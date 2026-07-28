import "dotenv/config";
import { resolve } from "path";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: resolve(__dirname, "../.env.local") });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const DRIP_EMAIL_TYPES = ["welcome", "carbon_credits", "irec", "community", "action"];

async function main() {
  console.log("--- DB USERS (from get_users_for_drip) ---");
  const { data, error: dbError } = await supabase.rpc("get_users_for_drip");
  let dbUsers: Array<{ id: string; email: string; name: string; created_at: string }> = data ?? [];

  if (dbError) {
    console.error("Error calling get_users_for_drip:", dbError);
    return;
  }

  console.log(`Found ${dbUsers.length} users in DB`);

  console.log("\n--- DRIP TRACKING (from drip_tracking table) ---");
  const { data: trackingData, error: trackingError } = await supabase
    .from("drip_tracking")
    .select("user_id, email_type, email_sent_at, status")
    .order("user_id", { ascending: true });

  if (trackingError) {
    console.error("Error fetching drip tracking:", trackingError);
    return;
  }

  const trackingByUserId = new Map<string, Array<{ email_type: string; email_sent_at: string; status: string }>>();
  for (const row of trackingData ?? []) {
    if (!trackingByUserId.has(row.user_id)) trackingByUserId.set(row.user_id, []);
    trackingByUserId.get(row.user_id)!.push(row);
  }

  console.log(`Tracking found ${trackingByUserId.size} users with drip emails`);

  for (const user of dbUsers) {
    const records = trackingByUserId.get(user.id) ?? [];
    const sentTypes = records.map(r => r.email_type);
    const missing = DRIP_EMAIL_TYPES.filter(t => !sentTypes.includes(t));

    if (missing.length === DRIP_EMAIL_TYPES.length) {
      console.log(`[MISSING] ${user.email} - No emails sent yet.`);
    } else if (missing.length === 0) {
      console.log(`[COMPLETE] ${user.email} - All ${DRIP_EMAIL_TYPES.length} emails sent.`);
    } else {
      const sent = sentTypes.join(", ");
      console.log(`[PARTIAL] ${user.email} - Sent: ${sent} | Missing: ${missing.join(", ")}`);
    }
  }
}

main().catch(console.error);
