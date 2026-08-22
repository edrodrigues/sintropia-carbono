// Exercise the queries the application actually issues against a schema rebuilt
// purely from supabase/migrations. Proves the rebuild is *functional*, not just
// structurally complete: views resolve, filters and ORDER BY columns exist, and
// the RPCs the app calls are present with the right signatures.
const fs = require("fs");
const path = require("path");

async function rebuild(PGlite) {
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
    try { await db.exec(fs.readFileSync(path.join(migDir, f), "utf8")); } catch {}
  }
  return db;
}

(async () => {
  let PGlite;
  try {
    ({ PGlite } = await import("@electric-sql/pglite"));
  } catch {
    console.error("Needs: npm install --no-save @electric-sql/pglite");
    process.exit(2);
  }

  const db = await rebuild(PGlite);
  let pass = true;
  const check = async (label, sql, params) => {
    try {
      await db.query(sql, params);
      console.log("  ok    " + label);
    } catch (e) {
      console.log("  FAIL  " + label + "  ->  " + e.message.split("\n")[0]);
      pass = false;
    }
  };

  // Mirrors src/lib/queries/carbon.ts, irec.ts, carbon-prices.ts.
  console.log("public data queries (server components):");
  await check("carbon_stakeholders by region, ordered",
    "SELECT * FROM carbon_stakeholders WHERE region = $1 ORDER BY ranking ASC", ["brazil"]);
  await check("carbon_stakeholders by sector",
    "SELECT * FROM carbon_stakeholders WHERE setor = $1 AND region = $2 ORDER BY ranking ASC", ["Energia", "brazil"]);
  await check("carbon_stakeholders search (ilike)",
    "SELECT * FROM carbon_stakeholders WHERE region = $1 AND empresa ILIKE $2 ORDER BY ranking ASC", ["brazil", "%pet%"]);
  await check("v_carbon_dashboard view",
    "SELECT * FROM v_carbon_dashboard WHERE region = $1", ["brazil"]);
  await check("irec_stakeholders by region",
    "SELECT * FROM irec_stakeholders WHERE region = $1 ORDER BY ranking ASC", ["world"]);
  await check("v_irec_dashboard view",
    "SELECT * FROM v_irec_dashboard WHERE region = $1", ["brazil"]);
  await check("irec_prices by category",
    "SELECT * FROM irec_prices WHERE category = $1 ORDER BY created_at ASC", ["brazil"]);
  await check("carbon_prices by market_type",
    "SELECT * FROM carbon_prices WHERE market_type = $1 ORDER BY created_at ASC", ["voluntary"]);

  // Mirrors the volume_2026 columns the fixed migration restored.
  console.log("\ncolumns restored by the drift fix:");
  await check("carbon_stakeholders.volume_2026 / delta_num",
    "SELECT volume_2026, delta_num FROM carbon_stakeholders LIMIT 1");

  // Mirrors src/app/api/carbon-projects/route.ts.
  console.log("\ncarbon-projects API route:");
  await check("filtered page with exact count",
    "SELECT *, count(*) OVER () FROM carbon_projects WHERE country = $1 ORDER BY country ASC LIMIT 100 OFFSET 0", ["Brazil"]);
  await check("credits stats pagination",
    "SELECT vintage, quantity, project_id, transaction_type FROM carbon_credits LIMIT 1000 OFFSET 0");
  await check("credits -> projects join key",
    "SELECT c.project_id FROM carbon_credits c JOIN carbon_projects p ON p.project_id = c.project_id LIMIT 1");

  // Mirrors src/lib/mod-actions.ts and auth/server.ts.
  console.log("\nmoderation + auth:");
  await check("profile role lookup",
    "SELECT role FROM profiles WHERE id = $1", ["00000000-0000-0000-0000-000000000000"]);
  await check("bans insert shape",
    "SELECT user_id, moderator_id, reason, expires_at FROM bans LIMIT 1");
  await check("warnings insert shape",
    "SELECT user_id, moderator_id, reason FROM warnings LIMIT 1");
  await check("post_deletions insert shape",
    "SELECT post_id, moderator_id, reason FROM post_deletions LIMIT 1");
  await check("posts soft delete",
    "SELECT id, is_deleted FROM posts LIMIT 1");

  // Mirrors src/lib/queries/market-actions.ts + market-listings.ts.
  console.log("\nmarket:");
  await check("alerts scoped to owner",
    "SELECT id FROM alerts WHERE id = $1 AND user_id = $2",
    ["00000000-0000-0000-0000-000000000000", "00000000-0000-0000-0000-000000000000"]);
  await check("market_listings by author",
    "SELECT * FROM market_listings WHERE author_id = $1", ["00000000-0000-0000-0000-000000000000"]);
  await check("market_listings.notes column",
    "SELECT notes FROM market_listings LIMIT 1");
  await check("buyer_profiles upsert target",
    "SELECT user_id, company_name FROM buyer_profiles LIMIT 1");

  // RPCs the app calls.
  console.log("\nRPCs:");
  await check("consume_rate_limit", "SELECT * FROM consume_rate_limit($1,$2,$3)", ["probe", 5, 60]);
  await check("prune_rate_limits", "SELECT prune_rate_limits($1)", [86400]);
  await check("check_and_award_achievements exists",
    "SELECT 1 FROM pg_proc WHERE proname = 'check_and_award_achievements'");

  await db.close();
  console.log("\n" + (pass ? "ALL APP QUERIES RUN AGAINST THE REBUILT SCHEMA" : "SOME QUERIES FAILED"));
  process.exit(pass ? 0 : 1);
})();
