import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

// Thin wrapper: the actual CAD Trust fetch + upsert logic lives in the
// deployed edge function (supabase/functions/ingest-cadtrust-ratings). This
// script just invokes it, matching what the daily cron schedule calls in
// production. Requires the function to already be deployed.
//
// Usage:
//   npx tsx scripts/sync-cadtrust-ratings.ts

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set");
  process.exit(1);
}

async function run() {
  const url = `${supabaseUrl}/functions/v1/ingest-cadtrust-ratings`;
  console.log(`Invoking ${url}`);

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${supabaseServiceKey}`,
      "Content-Type": "application/json",
    },
  });

  const body = await res.json().catch(() => null);
  if (!res.ok || !body?.ok) {
    console.error(`Ingest failed (${res.status}):`, body ?? (await res.text().catch(() => "")));
    process.exit(1);
  }

  console.log("Done:", JSON.stringify(body, null, 2));
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
