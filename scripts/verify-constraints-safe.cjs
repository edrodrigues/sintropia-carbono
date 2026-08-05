// Prove the two generated baseline migrations are strict no-ops against an
// existing database, and still build a correct schema from empty.
//
// Migrations run against production as well as a fresh database. Two things here
// could have caused real damage if unguarded:
//
//   1. Constraints. An earlier version used DROP CONSTRAINT IF EXISTS + ADD ...
//      ON DELETE CASCADE. The real referential actions are NOT recoverable from
//      the generated types, so that would have replaced e.g. ON DELETE SET NULL
//      with cascading deletes -- deleting a profile could delete their posts.
//
//   2. RLS. An earlier version ran ALTER TABLE ... ENABLE ROW LEVEL SECURITY
//      unconditionally. Enabling RLS on a live table that deliberately has it
//      off, with no policies present, denies every non-service-role read.
//
// This checks BOTH, across EVERY table and EVERY constraint, in both directions.
const fs = require("fs");
const path = require("path");

const MIG = path.join("supabase", "migrations");
const TABLES = path.join(MIG, "20260101000000_schema_baseline_tables.sql");
const CONSTRAINTS = path.join(MIG, "20260805000001_schema_baseline_constraints.sql");

function tableNames(sql) {
  return [...sql.matchAll(/IF to_regclass\('public\.(\w+)'\) IS NULL THEN/g)].map(m => m[1]);
}

(async () => {
  let PGlite;
  try {
    ({ PGlite } = await import("@electric-sql/pglite"));
  } catch {
    console.error("Needs: npm install --no-save @electric-sql/pglite");
    process.exit(2);
  }

  let pass = true;
  const check = (label, cond, detail) => {
    console.log((cond ? "  PASS  " : "  FAIL  ") + label + (detail ? "   " + detail : ""));
    if (!cond) pass = false;
  };

  const tablesSql = fs.readFileSync(TABLES, "utf8");
  const constraintsSql = fs.readFileSync(CONSTRAINTS, "utf8");

  // -- Static guarantees ----------------------------------------------------
  console.log("static: no unguarded destructive or RLS-toggling statements");
  const unguardedRls = tablesSql.match(/^ALTER TABLE public\.\w+ ENABLE ROW LEVEL SECURITY;/gm) || [];
  check("no top-level ENABLE ROW LEVEL SECURITY in tables file", unguardedRls.length === 0,
    "found " + unguardedRls.length);
  const drops = constraintsSql.match(/DROP CONSTRAINT/g) || [];
  check("no DROP CONSTRAINT in constraints file", drops.length === 0, "found " + drops.length);

  const names = tableNames(tablesSql);
  check("every table is existence-guarded", names.length === 20, "guarded=" + names.length);

  // -- Direction A: fresh database ------------------------------------------
  console.log("\nfresh database: schema is actually built");
  const fresh = await PGlite.create();
  await fresh.exec(`
    CREATE SCHEMA IF NOT EXISTS auth;
    CREATE TABLE auth.users (id UUID PRIMARY KEY, email TEXT);
    CREATE OR REPLACE FUNCTION auth.uid() RETURNS UUID
      LANGUAGE sql STABLE AS $$ SELECT NULL::uuid $$;
    CREATE SCHEMA IF NOT EXISTS storage;
    CREATE TABLE storage.buckets (
      id TEXT PRIMARY KEY, name TEXT, public BOOLEAN,
      file_size_limit BIGINT, allowed_mime_types TEXT[]
    );
    CREATE TABLE storage.objects (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      bucket_id TEXT, name TEXT, owner UUID
    );
    ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
    CREATE SCHEMA IF NOT EXISTS tasks;
    CREATE SCHEMA IF NOT EXISTS vault;
    CREATE TABLE vault.decrypted_secrets (name TEXT, value TEXT);
  `);
  for (const r of ["anon", "authenticated", "service_role", "postgres"]) {
    try { await fresh.exec("CREATE ROLE " + r + ";"); } catch {}
  }
  await fresh.exec(tablesSql);

  const built = await fresh.query(`
    SELECT c.relname, c.relrowsecurity
    FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relkind = 'r'
  `);
  check("all 20 baselined tables created", names.every(n => built.rows.some(r => r.relname === n)),
    "created=" + built.rows.length);
  const rlsOff = built.rows.filter(r => !r.relrowsecurity).map(r => r.relname);
  check("all created tables have RLS enabled", rlsOff.length === 0,
    rlsOff.length ? "off for: " + rlsOff.join(", ") : "");

  // Apply the intervening migrations, then the constraints file -- the real
  // filename order. Some constraint targets (challenges) are created by these.
  const between = fs.readdirSync(MIG)
    .filter(x => x.endsWith(".sql"))
    .sort()
    .filter(x => x !== path.basename(TABLES) && x !== path.basename(CONSTRAINTS));
  for (const m of between) {
    try {
      await fresh.exec(fs.readFileSync(path.join(MIG, m), "utf8"));
    } catch {
      // pg_cron / pg_net are unavailable in PGlite; unrelated to this check.
    }
  }
  await fresh.exec(constraintsSql);
  const fks = await fresh.query(`
    SELECT count(*)::int AS n FROM pg_constraint con
    JOIN pg_class rel ON rel.oid = con.conrelid
    JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
    WHERE nsp.nspname = 'public' AND con.contype = 'f'
  `);
  check("foreign keys created on fresh database", fks.rows[0].n >= 27, "count=" + fks.rows[0].n);

  // -- Direction B: existing database, deliberately divergent ---------------
  console.log("\nexisting database: migrations change nothing");
  const live = await PGlite.create();
  await live.exec(`
    CREATE SCHEMA IF NOT EXISTS auth;
    CREATE TABLE auth.users (id UUID PRIMARY KEY, email TEXT);
  `);

  // Build every baselined table with DIFFERENT properties than the baseline
  // would choose: RLS OFF, an extra column, and a permissive FK action.
  //
  // Also create the FK *targets* that later migrations own (challenges,
  // organizations, ...), since the constraints file references them. Collected
  // from the file itself so this cannot drift.
  const referenced = new Set(
    [...constraintsSql.matchAll(/REFERENCES public\.(\w+)\(/g)].map(m => m[1]),
  );
  for (const t of new Set([...names, ...referenced])) {
    await live.exec(
      "CREATE TABLE public." + t + " (id UUID PRIMARY KEY, sentinel TEXT DEFAULT 'keep');",
    );
  }

  // carbon_projects.project_id is referenced by a non-PK unique constraint.
  await live.exec(`
    ALTER TABLE public.carbon_projects ADD COLUMN project_id TEXT;
    ALTER TABLE public.carbon_projects
      ADD CONSTRAINT carbon_projects_project_id_uniq UNIQUE (project_id);
  `);
  // Recreate EVERY foreign key the migration would add, but with ON DELETE
  // SET NULL instead of the CASCADE the baseline assumes, and under a different
  // constraint name. This is the realistic production shape: the constraints
  // exist, and their real actions are not what the generated types imply.
  const fkCols = [...constraintsSql.matchAll(
    /rel\.relname = '(\w+)'[\s\S]{0,400}?attname = '(\w+)'\)[\s\S]{0,300}?REFERENCES public\.(\w+)\((\w+)\)/g,
  )];
  check("parsed every FK from the migration", fkCols.length === 27, "parsed=" + fkCols.length);

  for (const [, table, col, refTable, refCol] of fkCols) {
    const type = refCol === "project_id" ? "TEXT" : "UUID";
    try {
      await live.exec("ALTER TABLE public." + table + " ADD COLUMN IF NOT EXISTS " + col + " " + type + ";");
    } catch { /* already present */ }
    // The referenced column must exist and be unique for the FK to attach.
    if (refCol !== "id") {
      try {
        await live.exec("ALTER TABLE public." + refTable + " ADD COLUMN IF NOT EXISTS " + refCol + " " + type + ";");
        await live.exec("ALTER TABLE public." + refTable + " ADD CONSTRAINT " + refTable + "_" + refCol + "_pre UNIQUE (" + refCol + ");");
      } catch { /* already present */ }
    }
    try {
      await live.exec(
        "ALTER TABLE public." + table
        + " ADD CONSTRAINT " + table + "_" + col + "_pre_fkey"
        + " FOREIGN KEY (" + col + ") REFERENCES public." + refTable + "(" + refCol + ")"
        + " ON DELETE SET NULL;",
      );
    } catch (e) {
      console.log("    (fixture) could not pre-create FK on " + table + "." + col + ": " + e.message.split("\n")[0]);
    }
  }

  const snapshot = async (db) => {
    const cols = await db.query(`
      SELECT table_name, column_name FROM information_schema.columns
      WHERE table_schema = 'public' ORDER BY table_name, column_name
    `);
    const rls = await db.query(`
      SELECT c.relname, c.relrowsecurity FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public' AND c.relkind = 'r' ORDER BY c.relname
    `);
    const cons = await db.query(`
      SELECT rel.relname, con.conname, con.contype, con.confdeltype
      FROM pg_constraint con
      JOIN pg_class rel ON rel.oid = con.conrelid
      JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
      WHERE nsp.nspname = 'public' ORDER BY rel.relname, con.conname
    `);
    return JSON.stringify({ cols: cols.rows, rls: rls.rows, cons: cons.rows });
  };

  const beforeState = await snapshot(live);
  await live.exec(tablesSql);
  await live.exec(constraintsSql);
  const afterState = await snapshot(live);

  if (beforeState !== afterState) {
    const a = JSON.parse(beforeState);
    const b = JSON.parse(afterState);
    const diff = (label, x, y) => {
      const sx = x.map(v => JSON.stringify(v));
      const sy = y.map(v => JSON.stringify(v));
      const added = sy.filter(v => !sx.includes(v));
      const removed = sx.filter(v => !sy.includes(v));
      if (added.length || removed.length) {
        console.log("    " + label + ":");
        for (const v of removed) console.log("      - " + v);
        for (const v of added) console.log("      + " + v);
      }
    };
    console.log("  schema differences:");
    diff("columns", a.cols, b.cols);
    diff("rls", a.rls, b.rls);
    diff("constraints", a.cons, b.cons);
  }
  check("schema byte-identical after applying both migrations", beforeState === afterState,
    beforeState === afterState ? "" : "see differences above");

  const rlsAfter = await live.query(`
    SELECT c.relname FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relkind = 'r' AND c.relrowsecurity
  `);
  check("RLS was NOT switched on for any existing table", rlsAfter.rows.length === 0,
    rlsAfter.rows.length ? "enabled for: " + rlsAfter.rows.map(r => r.relname).join(", ") : "");

  const act = await live.query(`
    SELECT con.conname, con.confdeltype FROM pg_constraint con
    JOIN pg_class rel ON rel.oid = con.conrelid
    WHERE rel.relname = 'posts' AND con.contype = 'f'
  `);
  check("no CASCADE was introduced on any posts FK",
    act.rows.length > 0 && act.rows.every(r => r.confdeltype === "n"),
    JSON.stringify(act.rows));

  const anyCascade = await live.query(`
    SELECT rel.relname, con.conname FROM pg_constraint con
    JOIN pg_class rel ON rel.oid = con.conrelid
    JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
    WHERE nsp.nspname = 'public' AND con.contype = 'f' AND con.confdeltype = 'c'
  `);
  check("NO foreign key anywhere was converted to CASCADE", anyCascade.rows.length === 0,
    anyCascade.rows.length ? JSON.stringify(anyCascade.rows.slice(0, 5)) : "");

  // Behavioural: the dependent row must survive.
  await live.exec(`
    INSERT INTO public.profiles (id) VALUES ('11111111-1111-1111-1111-111111111111');
    INSERT INTO public.posts (id, author_id)
      VALUES ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111');
    DELETE FROM public.profiles WHERE id = '11111111-1111-1111-1111-111111111111';
  `);
  const survived = await live.query("SELECT author_id FROM public.posts");
  check("deleting a parent row does NOT cascade", survived.rows.length === 1 && survived.rows[0].author_id === null,
    JSON.stringify(survived.rows));

  // -- Idempotency ----------------------------------------------------------
  console.log("\nidempotency: re-applying is still a no-op");
  await live.exec(tablesSql);
  await live.exec(constraintsSql);
  const thirdState = await snapshot(live);
  check("second application changes nothing", thirdState === afterState);

  await fresh.close();
  await live.close();
  console.log("\n" + (pass ? "BOTH MIGRATIONS ARE PRODUCTION-SAFE" : "UNSAFE - see failures above"));
  process.exit(pass ? 0 : 1);
})();
