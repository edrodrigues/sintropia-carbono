// Replay every migration in supabase/migrations, in filename order, against an
// empty in-memory Postgres (PGlite). This is the check that the repository can
// actually rebuild the schema -- the thing that was impossible before the
// baseline existed.
//
// Usage: node scripts/verify-migrations.cjs
const fs = require("fs");
const path = require("path");

// PGlite has no pg_cron / pg_net, so migrations whose only job is scheduling
// cannot run here. They are reported as skipped, not failed.
const ENV_ONLY = new Set([
  "20260305000000_setup_cron.sql",
  "20260716000001_schedule_ingest_carbonmark.sql",
]);

const ENV_ONLY_PATTERN
  = /extension "(pg_cron|net|pg_net)" is not available|schema "cron" does not exist|relation "storage\.\w+" does not exist/;

(async () => {
  // PGlite is intentionally not a saved dependency: it is a development-only
  // verification tool, so it is installed on demand rather than shipped.
  let PGlite;
  try {
    ({ PGlite } = await import("@electric-sql/pglite"));
  }
  catch {
    console.error(
      "This check needs PGlite (an in-process Postgres), which is not a saved\n"
      + "dependency. Install it on demand:\n\n"
      + "  npm install --no-save @electric-sql/pglite\n",
    );
    process.exit(2);
  }
  const db = await PGlite.create();

  // Stand in for the parts of a hosted Supabase project that migrations assume.
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
      id TEXT PRIMARY KEY,
      name TEXT,
      public BOOLEAN,
      file_size_limit BIGINT,
      allowed_mime_types TEXT[]
    );
    CREATE TABLE IF NOT EXISTS storage.objects (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      bucket_id TEXT,
      name TEXT,
      owner UUID
    );
    ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
    CREATE SCHEMA IF NOT EXISTS vault;
    CREATE TABLE IF NOT EXISTS vault.decrypted_secrets (name TEXT, value TEXT);
  `);

  for (const role of ["anon", "authenticated", "service_role", "postgres"]) {
    try {
      await db.exec("CREATE ROLE " + role + ";");
    } catch {
      // already exists
    }
  }

  const migDir = path.join("supabase", "migrations");
  const files = fs.readdirSync(migDir).filter(f => f.endsWith(".sql")).sort();

  const failures = [];
  const skipped = [];

  for (const f of files) {
    const sql = fs.readFileSync(path.join(migDir, f), "utf8");
    try {
      await db.exec(sql);
      console.log("  ok    " + f);
    } catch (e) {
      const msg = e.message.split("\n")[0];
      if (ENV_ONLY.has(f) || ENV_ONLY_PATTERN.test(msg)) {
        console.log("  skip  " + f + "  (" + msg + ")");
        skipped.push(f);
      } else {
        console.log("  FAIL  " + f + "  ->  " + msg);
        failures.push({ f, msg });
      }
    }
  }

  const tables = await db.query(`
    SELECT count(*)::int AS n FROM information_schema.tables
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
  `);
  const views = await db.query(`
    SELECT count(*)::int AS n FROM information_schema.views
    WHERE table_schema = 'public'
  `);

  console.log("");
  console.log("migrations:  " + files.length);
  console.log("applied:     " + (files.length - failures.length - skipped.length));
  console.log("skipped:     " + skipped.length + "  (need pg_cron / storage)");
  console.log("failed:      " + failures.length);
  console.log("tables:      " + tables.rows[0].n);
  console.log("views:       " + views.rows[0].n);

  if (failures.length) {
    console.log("\nFAILURES:");
    for (const { f, msg } of failures) console.log("  " + f + "\n    " + msg);
  }

  await db.close();
  process.exit(failures.length ? 1 : 0);
})();
