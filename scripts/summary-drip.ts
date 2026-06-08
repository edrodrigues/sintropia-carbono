import "dotenv/config";
import { resolve } from "path";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: resolve(__dirname, "../.env.local") });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_KEY!);

const DRIP_EMAIL_TYPES = ["welcome", "carbon_credits", "irec", "community", "action"];

async function main() {
  const { data: dbUsers } = await supabase.rpc("get_users_for_drip");
  const { data: trackingData } = await supabase
    .from("drip_tracking")
    .select("user_id, email_type");

  const trackingByUserId = new Map<string, string[]>();
  for (const row of trackingData ?? []) {
    if (!trackingByUserId.has(row.user_id)) trackingByUserId.set(row.user_id, []);
    trackingByUserId.get(row.user_id)!.push(row.email_type);
  }

  const results = (dbUsers ?? []).map((user: { id: string; email: string; created_at: string }) => {
    const sent = (trackingByUserId.get(user.id) ?? []).join(", ") || "NONE";
    return { email: user.email, sent, created_at: user.created_at };
  });

  console.log("SUMMARY_START");
  console.log(JSON.stringify(results, null, 2));
  console.log("SUMMARY_END");
}

main().catch(console.error);
