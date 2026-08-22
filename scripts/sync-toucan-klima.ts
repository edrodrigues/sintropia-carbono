import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

// Thin wrapper: the actual GraphQL/Klima fetch + upsert logic lives in the
// deployed edge function (supabase/functions/ingest-toucan-klima). This
// script just invokes it, matching what the cron schedule calls in
// production. Requires the function to already be deployed and
// THE_GRAPH_API_KEY to already be set as a Supabase secret (see
// docs/toucan-klima-ingest-plan.md).
//
// Usage:
//   npx tsx scripts/sync-toucan-klima.ts [--full] [--days=30]

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set");
  process.exit(1);
}

const args = process.argv.slice(2);
const full = args.includes("--full");
const daysArg = args.find((a) => a.startsWith("--days="));
const days = daysArg ? daysArg.split("=")[1] : undefined;

async function run() {
  const params = new URLSearchParams();
  if (full) params.set("full", "1");
  if (days) params.set("days", days);
  const query = params.toString();

  const url = `${supabaseUrl}/functions/v1/ingest-toucan-klima${query ? `?${query}` : ""}`;
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
