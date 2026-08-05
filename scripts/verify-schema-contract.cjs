// Verify the rebuilt schema actually satisfies the application's real queries.
//
// The migration replay proves the SQL applies; it does NOT prove the resulting
// schema has the columns the app selects, filters and orders by. This extracts
// table/column usage from the generated types (the app's compile-time contract)
// and diffs it against the schema the migrations actually produce.
const fs = require("fs");
const path = require("path");

function parseTypeTables(types) {
  const start = types.indexOf("    Tables: {");
  const end = types.indexOf("    Views: {");
  const block = types.slice(start, end > start ? end : undefined);

  const bounds = [];
  const nameRe = /^      ([a-z0-9_]+): \{$/gm;
  let m;
  while ((m = nameRe.exec(block))) bounds.push({ name: m[1], at: m.index });

  const out = new Map();
  for (let i = 0; i < bounds.length; i++) {
    const { name, at } = bounds[i];
    const stop = i + 1 < bounds.length ? bounds[i + 1].at : block.length;
    const section = block.slice(at, stop);
    const rowStart = section.indexOf("        Row: {");
    if (rowStart < 0) continue;
    const rowEnd = section.indexOf("        }", rowStart);
    const body = section.slice(rowStart + 14, rowEnd);
    const cols = new Set();
    for (const line of body.split(/\r?\n/)) {
      const c = line.match(/^\s{10}([a-z0-9_]+)\??:/);
      if (c) cols.add(c[1]);
    }
    out.set(name, cols);
  }
  return out;
}

(async () => {
  let PGlite;
  try {
    ({ PGlite } = await import("@electric-sql/pglite"));
  } catch {
    console.error("Needs: npm install --no-save @electric-sql/pglite");
    process.exit(2);
  }

  const db = await PGlite.create();
  await db.exec(`
    CREATE SCHEMA IF NOT EXISTS auth;
    CREATE TABLE IF NOT EXISTS auth.users (id UUID PRIMARY KEY, email TEXT);
    CREATE OR REPLACE FUNCTION auth.uid() RETURNS UUID
      LANGUAGE sql STABLE AS $$ SELECT NULL::uuid $$;
    CREATE OR REPLACE FUNCTION auth.role() RETURNS TEXT
      LANGUAGE sql STABLE AS $$ SELECT NULL::text $$;
    CREATE SCHEMA IF NOT EXISTS extensions;
    CREATE SCHEMA IF NOT EXISTS tasks;
    CREATE SCHEMA IF NOT EXISTS storage;
    CREATE TABLE IF NOT EXISTS storage.buckets (
      id TEXT PRIMARY KEY, name TEXT, public BOOLEAN,
      file_size_limit BIGINT, allowed_mime_types TEXT[]
    );
    CREATE TABLE IF NOT EXISTS storage.objects (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      bucket_id TEXT, name TEXT, owner UUID
    );
    ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
    CREATE SCHEMA IF NOT EXISTS vault;
    CREATE TABLE IF NOT EXISTS vault.decrypted_secrets (name TEXT, value TEXT);
  `);
  for (const r of ["anon", "authenticated", "service_role", "postgres"]) {
    try { await db.exec("CREATE ROLE " + r + ";"); } catch {}
  }

  const migDir = path.join("supabase", "migrations");
  for (const f of fs.readdirSync(migDir).filter(x => x.endsWith(".sql")).sort()) {
    try {
      await db.exec(fs.readFileSync(path.join(migDir, f), "utf8"));
    } catch {
      // cron/storage gaps already reported by verify-migrations.cjs
    }
  }

  // What the rebuilt database actually has.
  const res = await db.query(`
    SELECT table_name, column_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
  `);
  const actual = new Map();
  for (const { table_name, column_name } of res.rows) {
    if (!actual.has(table_name)) actual.set(table_name, new Set());
    actual.get(table_name).add(column_name);
  }

  // What the application's type contract requires.
  const required = parseTypeTables(fs.readFileSync(path.join("src", "types", "supabase.ts"), "utf8"));

  // Tables belonging to a different app in the same project.
  const IGNORED = new Set(["fotos", "musicas", "presentes"]);

  const missingTables = [];
  const missingColumns = [];

  for (const [table, cols] of required) {
    if (IGNORED.has(table)) continue;
    if (!actual.has(table)) {
      missingTables.push(table);
      continue;
    }
    const have = actual.get(table);
    const gaps = [...cols].filter(c => !have.has(c));
    if (gaps.length) missingColumns.push({ table, gaps });
  }

  console.log("app tables required:   " + (required.size - IGNORED.size));
  console.log("present in rebuild:    " + (required.size - IGNORED.size - missingTables.length));
  console.log("");

  if (missingTables.length) {
    console.log("MISSING TABLES (" + missingTables.length + "):");
    for (const t of missingTables) console.log("  - " + t);
  } else {
    console.log("MISSING TABLES: none");
  }

  console.log("");
  if (missingColumns.length) {
    console.log("MISSING COLUMNS (" + missingColumns.length + " table(s)):");
    for (const { table, gaps } of missingColumns) {
      console.log("  " + table + ": " + gaps.join(", "));
    }
  } else {
    console.log("MISSING COLUMNS: none");
  }

  await db.close();
  const bad = missingTables.length + missingColumns.length;
  console.log("\n" + (bad ? "SCHEMA GAPS FOUND" : "rebuilt schema satisfies every app query"));
  process.exit(bad ? 1 : 0);
})();
