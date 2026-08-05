/**
 * Generate a SQL baseline for tables that exist in the live database but were
 * never captured in supabase/migrations.
 *
 * Source of truth is src/types/supabase.ts, which is generated from the live
 * schema, so TABLE NAMES, COLUMN NAMES, NULLABILITY and FOREIGN KEY targets are
 * read from real metadata rather than guessed. SQL scalar types are inferred,
 * and defaults, CHECK constraints, indexes, RLS policies and triggers are not
 * represented because the generated types do not carry them.
 *
 * Output is a reviewed starting point, not a substitute for `supabase db dump`.
 *
 * Usage: node scripts/generate-schema-baseline.cjs [--out <file>]
 */

const fs = require("fs");
const path = require("path");

const TYPES_FILE = path.join("src", "types", "supabase.ts");
const MIGRATIONS_DIR = path.join("supabase", "migrations");

// Tables in the shared Supabase project that belong to a different application.
// Excluded so this baseline describes only this repo's schema.
const FOREIGN_TABLES = new Set(["fotos", "musicas", "presentes"]);

// This generator's own output. Excluded when scanning for existing coverage so
// the script is idempotent.
const TABLES_FILE = "20260101000000_schema_baseline_tables.sql";
const CONSTRAINTS_FILE = "20260805000001_schema_baseline_constraints.sql";
const GENERATED_FILES = new Set([TABLES_FILE, CONSTRAINTS_FILE]);

// `profiles.id` is the user's auth id, not an independently generated key.
const AUTH_BACKED_PK = new Set(["profiles"]);

function parseTables(types) {
  const start = types.indexOf("    Tables: {");
  const end = types.indexOf("    Views: {");
  if (start < 0) throw new Error("Could not locate Tables block");
  const block = types.slice(start, end > start ? end : undefined);

  const bounds = [];
  const nameRe = /^      ([a-z0-9_]+): \{$/gm;
  let m;
  while ((m = nameRe.exec(block))) bounds.push({ name: m[1], at: m.index });

  const tables = [];
  for (let i = 0; i < bounds.length; i++) {
    const { name, at } = bounds[i];
    const stop = i + 1 < bounds.length ? bounds[i + 1].at : block.length;
    const section = block.slice(at, stop);

    const rowStart = section.indexOf("        Row: {");
    if (rowStart < 0) continue;
    const rowEnd = section.indexOf("        }", rowStart);
    const rowBody = section.slice(rowStart + "        Row: {".length, rowEnd);

    const columns = [];
    for (const line of rowBody.split(/\r?\n/)) {
      const c = line.match(/^\s{10}([a-z0-9_]+)(\?)?:\s*(.+?)\s*$/);
      if (!c) continue;
      columns.push({ name: c[1], tsType: c[3].trim() });
    }
    if (!columns.length) continue;

    // Real foreign keys from the generated Relationships metadata.
    const fks = new Map();
    const relRe = /columns: \["([a-z0-9_]+)"\][\s\S]{0,200}?referencedRelation: "([a-z0-9_]+)"[\s\S]{0,120}?referencedColumns: \["([a-z0-9_]+)"\]/g;
    let r;
    while ((r = relRe.exec(section))) {
      fks.set(r[1], { table: r[2], column: r[3] });
    }

    tables.push({ name, columns, fks });
  }
  return tables;
}

function tablesCreatedByMigrations() {
  const created = new Set();
  if (!fs.existsSync(MIGRATIONS_DIR)) return created;
  // Skip this generator's own output: counting it as existing coverage would
  // make a re-run believe nothing is missing and emit empty files.
  const sql = fs.readdirSync(MIGRATIONS_DIR)
    .filter(f => f.endsWith(".sql"))
    .filter(f => !GENERATED_FILES.has(f))
    .map(f => fs.readFileSync(path.join(MIGRATIONS_DIR, f), "utf8"))
    .join("\n");
  const re = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:public\.)?"?([a-z0-9_]+)"?/gi;
  let m;
  while ((m = re.exec(sql))) created.add(m[1].toLowerCase());
  return created;
}

/** Infer a Postgres type from the TS type and the column's role. */
function baseSqlType(table, column, tsType) {
  const base = tsType.replace(/ \| null$/, "").trim();

  if (base === "number") {
    if (column === "id") return "BIGINT";
    if (/(_count|count|karma|ordem|position|rank|ranking|score|vintage|year|_size)$/.test(column)) return "INTEGER";
    return "NUMERIC";
  }
  if (base === "boolean") return "BOOLEAN";
  if (base === "Json") return "JSONB";
  if (base === "string[]") return "TEXT[]";
  if (base === "number[]") return "NUMERIC[]";
  if (base === "string") {
    if (column === "id") return "UUID";
    if (/_at$|^date$|_date$/.test(column)) return "TIMESTAMPTZ";
    return "TEXT";
  }
  // Union of string literals: the CHECK is not recoverable, so keep TEXT.
  return "TEXT";
}

function main() {
  const outIdx = process.argv.indexOf("--out");
  const outFile = outIdx > -1 ? process.argv[outIdx + 1] : null;

  const types = fs.readFileSync(TYPES_FILE, "utf8");
  const all = parseTables(types);
  const created = tablesCreatedByMigrations();

  const byName = new Map(all.map(t => [t.name, t]));
  const missing = all
    .filter(t => !created.has(t.name) && !FOREIGN_TABLES.has(t.name))
    .sort((a, b) => a.name.localeCompare(b.name));

  const knownTables = new Set([...created, ...missing.map(t => t.name)]);

  /**
   * Resolve a column's type. A foreign key must match the type of the column it
   * references: carbon_credits.project_id points at carbon_projects.project_id,
   * which holds a registry code (TEXT), not a UUID -- inferring UUID from the
   * `_id` suffix would produce a schema that cannot take the real data.
   */
  function resolveType(table, column, tsType) {
    const fk = table.fks.get(column);
    if (fk) {
      const target = byName.get(fk.table);
      const targetCol = target && target.columns.find(c => c.name === fk.column);
      if (targetCol) {
        return baseSqlType(target, fk.column, targetCol.tsType);
      }
    }
    return baseSqlType(table, column, tsType);
  }

  const tableSql = [];
  const fkSql = [];
  // A foreign key requires the referenced column to be UNIQUE (or a PK).
  // carbon_credits.project_id -> carbon_projects.project_id targets a
  // non-PK column, so the constraint has to be declared explicitly.
  const uniqueTargets = new Map();

  for (const t of missing) {
    const defs = [];

    for (const c of t.columns) {
      const nullable = / \| null$/.test(c.tsType);
      const sql = resolveType(t, c.name, c.tsType);
      let def = "  " + c.name + " " + sql;

      if (c.name === "id") {
        if (AUTH_BACKED_PK.has(t.name)) {
          // Mirrors auth.users; the row is created by a trigger on signup.
          def += " PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE";
        } else if (sql === "BIGINT") {
          def += " GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY";
        } else {
          def += " PRIMARY KEY DEFAULT gen_random_uuid()";
        }
      } else if (!nullable) {
        def += " NOT NULL";
      }

      defs.push(def);
    }

    tableSql.push(
      "CREATE TABLE IF NOT EXISTS public." + t.name + " (\n" + defs.join(",\n") + "\n);",
    );

    // Foreign keys are added afterwards so table order never matters and a
    // cycle (profiles.referred_by -> profiles) cannot deadlock the script.
    for (const [col, ref] of t.fks) {
      if (col === "id" && AUTH_BACKED_PK.has(t.name)) continue;
      if (!knownTables.has(ref.table)) continue;
      if (ref.column !== "id") {
        if (!uniqueTargets.has(ref.table)) uniqueTargets.set(ref.table, new Set());
        uniqueTargets.get(ref.table).add(ref.column);
      }
      const cname = t.name + "_" + col + "_fkey";
      // Additive only: never drop or redefine an existing constraint, because
      // this file also runs against the live database, where the real ON DELETE
      // behaviour is authoritative and is NOT recoverable from the types.
      fkSql.push(
        "DO $$\n"
        + "BEGIN\n"
        + "  IF NOT EXISTS (\n"
        + "    SELECT 1 FROM pg_constraint con\n"
        + "    JOIN pg_class rel ON rel.oid = con.conrelid\n"
        + "    JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace\n"
        + "    WHERE nsp.nspname = 'public'\n"
        + "      AND rel.relname = '" + t.name + "'\n"
        + "      AND con.contype = 'f'\n"
        + "      AND con.conkey = ARRAY[\n"
        + "        (SELECT attnum FROM pg_attribute\n"
        + "          WHERE attrelid = rel.oid AND attname = '" + col + "')\n"
        + "      ]::smallint[]\n"
        + "  ) THEN\n"
        + "    ALTER TABLE public." + t.name + "\n"
        + "      ADD CONSTRAINT " + cname + "\n"
        + "      FOREIGN KEY (" + col + ") REFERENCES public." + ref.table + "(" + ref.column + ")\n"
        + "      ON DELETE CASCADE;\n"
        + "  END IF;\n"
        + "END $$;",
      );
    }
  }

  const uniqueSql = [];
  for (const [table, cols] of uniqueTargets) {
    for (const col of cols) {
      const cname = table + "_" + col + "_key";
      // Additive only, for the same reason as the foreign keys below: a unique
      // constraint may already exist under a different name, and dropping the
      // live one could take an index (and any FK depending on it) with it.
      uniqueSql.push(
        "DO $$\n"
        + "BEGIN\n"
        + "  IF NOT EXISTS (\n"
        + "    SELECT 1 FROM pg_constraint con\n"
        + "    JOIN pg_class rel ON rel.oid = con.conrelid\n"
        + "    JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace\n"
        + "    WHERE nsp.nspname = 'public'\n"
        + "      AND rel.relname = '" + table + "'\n"
        + "      AND con.contype IN ('u', 'p')\n"
        + "      AND con.conkey = ARRAY[\n"
        + "        (SELECT attnum FROM pg_attribute\n"
        + "          WHERE attrelid = rel.oid AND attname = '" + col + "')\n"
        + "      ]::smallint[]\n"
        + "  ) THEN\n"
        + "    ALTER TABLE public." + table + "\n"
        + "      ADD CONSTRAINT " + cname + " UNIQUE (" + col + ");\n"
        + "  END IF;\n"
        + "END $$;",
      );
    }
  }

  const header = [
    "-- ============================================================",
    "-- SCHEMA BASELINE (GENERATED - REVIEW BEFORE TRUSTING)",
    "-- ============================================================",
    "--",
    "-- These tables exist in the live database but were never captured in a",
    "-- migration: every other migration here only ALTERs them. Without this",
    "-- file the schema cannot be rebuilt from the repository, which means no",
    "-- local development, no CI against a real schema, and no recovery path.",
    "--",
    "-- Generated by scripts/generate-schema-baseline.cjs from",
    "-- src/types/supabase.ts. Because that file is generated from the live",
    "-- schema, these are read from real metadata and are accurate:",
    "--   * table names",
    "--   * column names",
    "--   * nullability",
    "--   * foreign key columns and their targets",
    "--",
    "-- NOT captured, because the generated TypeScript types do not carry it:",
    "--   * exact scalar types (BIGINT vs INTEGER, TEXT vs VARCHAR(n), numeric",
    "--     precision) - these are INFERRED",
    "--   * DEFAULT expressions",
    "--   * CHECK constraints and enum domains",
    "--   * ON DELETE / ON UPDATE behaviour (CASCADE is assumed everywhere)",
    "--   * UNIQUE constraints and every index",
    "--   * RLS policies",
    "--   * triggers and trigger functions (including the auth.users -> profiles",
    "--     signup trigger this schema depends on)",
    "--",
    "-- Reconcile against `supabase db dump --schema public` from a machine with",
    "-- database credentials before treating this as canonical.",
    "-- See docs/schema-baseline.md.",
    "--",
    "-- RLS is enabled with NO policies for every table: deny-by-default is the",
    "-- safe failure mode for a rebuilt environment. The real policies must be",
    "-- recovered from the live project and committed alongside this file, or",
    "-- authenticated reads will return nothing.",
    "-- ============================================================",
    "",
  ].join("\n");

  const tablesDoc = [
    header,
    tableSql.join("\n\n"),
    "",
    "",
    "-- ------------------------------------------------------------",
    "-- Deny-by-default RLS. Real policies must be recovered from the",
    "-- live project and committed alongside this file.",
    "-- ------------------------------------------------------------",
    "",
    missing.map(t => "ALTER TABLE public." + t.name + " ENABLE ROW LEVEL SECURITY;").join("\n"),
    "",
  ].join("\n");

  const constraintsDoc = [
    "-- ============================================================",
    "-- SCHEMA BASELINE, PART 2: CONSTRAINTS (GENERATED)",
    "-- ============================================================",
    "--",
    "-- Companion to the baseline tables migration. Split into its own file, and",
    "-- deliberately timestamped AFTER the existing migrations, because some of",
    "-- these foreign keys reference tables that later migrations create (for",
    "-- example challenges). Applying them here keeps a from-scratch replay of",
    "-- this directory working in filename order.",
    "--",
    "-- Every statement here is ADDITIVE and idempotent: a constraint is created",
    "-- only when one does not already exist on that column. That matters because",
    "-- this file also runs against the LIVE database, where these constraints",
    "-- already exist with their real referential actions.",
    "--",
    "-- ON DELETE CASCADE below is an ASSUMPTION for a from-scratch rebuild only.",
    "-- The generated types record which columns are foreign keys and what they",
    "-- reference, but NOT the referential action. Never convert these into",
    "-- DROP + ADD: that would replace the live ON DELETE behaviour with CASCADE",
    "-- and could turn deleting one row into a cascading data loss.",
    "-- See docs/schema-baseline.md.",
    "-- ============================================================",
    "",
    "-- Uniqueness required by the foreign keys below, for targets that are not",
    "-- a primary key.",
    "",
    uniqueSql.join("\n\n"),
    "",
    "",
    "-- Foreign keys.",
    "",
    fkSql.join("\n\n"),
    "",
  ].join("\n");

  if (outFile) {
    // --out writes a single combined document, for validation/preview.
    fs.writeFileSync(outFile, tablesDoc + "\n\n" + constraintsDoc);
    console.log(
      "Wrote " + outFile + " (" + missing.length + " tables, "
      + fkSql.length + " foreign keys, " + uniqueSql.length + " unique constraints)",
    );
    return;
  }

  const tablesFile = path.join(MIGRATIONS_DIR, TABLES_FILE);
  const constraintsFile = path.join(MIGRATIONS_DIR, CONSTRAINTS_FILE);
  if (!missing.length) {
    console.error(
      "Refusing to write an empty baseline: no uncaptured tables were found.\n"
      + "That usually means src/types/supabase.ts could not be parsed.",
    );
    process.exit(1);
  }

  fs.writeFileSync(tablesFile, tablesDoc);
  fs.writeFileSync(constraintsFile, constraintsDoc);
  console.log("Wrote " + tablesFile);
  console.log("Wrote " + constraintsFile);
  console.log(
    missing.length + " tables, " + fkSql.length + " foreign keys, "
    + uniqueSql.length + " unique constraints",
  );
}

main();
