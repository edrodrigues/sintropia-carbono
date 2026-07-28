import "dotenv/config";
import { resolve } from "path";
import dotenv from "dotenv";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: resolve(__dirname, "../.env.local") });

import {
  sendDripEmail1_Welcome,
  sendDripEmail2_CarbonCredits,
  sendDripEmail3_IREC,
  sendDripEmail4_Community,
  sendDripEmail5_Action,
} from "../src/lib/email";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
if (!RESEND_API_KEY) {
  console.error("RESEND_API_KEY is not set");
  process.exit(1);
}
const resend = new Resend(RESEND_API_KEY);

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const DRIP_SCHEDULE = [
  { name: "welcome", fn: sendDripEmail1_Welcome },
  { name: "carbon_credits", fn: sendDripEmail2_CarbonCredits },
  { name: "irec", fn: sendDripEmail3_IREC },
  { name: "community", fn: sendDripEmail4_Community },
  { name: "action", fn: sendDripEmail5_Action },
];

interface SentEmailRecord {
  email: string;
  sentAt: string;
  emailType: string;
}

async function loadSentEmails(): Promise<Map<string, SentEmailRecord[]>> {
  const { data, error } = await supabase
    .from("drip_tracking")
    .select("user_id, email_type, email_sent_at, status");

  if (error) {
    console.error("Error loading drip tracking:", error);
    return new Map();
  }

  const map = new Map<string, SentEmailRecord[]>();
  for (const row of data ?? []) {
    const email = row.user_id;
    if (!map.has(email)) map.set(email, []);
    map.get(email)!.push({
      email,
      sentAt: row.email_sent_at,
      emailType: row.email_type,
    });
  }
  return map;
}

async function saveSentEmail(userId: string, emailType: string, status: string, errorMessage?: string) {
  const { error } = await supabase
    .from("drip_tracking")
    .upsert({
      user_id: userId,
      email_type: emailType,
      email_sent_at: new Date().toISOString(),
      status,
      error_message: errorMessage ?? null,
    }, { onConflict: "user_id,email_type" });

  if (error) {
    console.error(`Error saving drip tracking for ${userId}:`, error);
  }
}

interface ContactRecord {
  id: string;
  email: string;
  first_name?: string;
  created_at: string;
}

interface ResendContact {
  email: string;
  first_name?: string;
  created_at: string;
}

async function getDbUsers(): Promise<ContactRecord[]> {
  const { data, error } = await supabase.rpc("get_users_for_drip");
  if (error) {
    console.error("Error fetching users from DB:", error);
    throw error;
  }
  return (data as ContactRecord[])?.map(user => ({
    id: user.id,
    email: user.email,
    created_at: user.created_at,
    first_name: user.first_name || undefined,
  })) || [];
}

async function getResendContacts(audienceId: string) {
  const contacts: ResendContact[] = [];
  let cursor: string | undefined;

  do {
    await new Promise(resolve => setTimeout(resolve, 600));
    const { data, error } = await resend.contacts.list({ audienceId, limit: 100 });
    if (error) throw error;
    if (data?.data) {
      contacts.push(...data.data.map(c => ({
        email: c.email,
        first_name: c.first_name ?? undefined,
        created_at: (c as { created_at: string }).created_at,
      })));
    }
    cursor = (data as { next_cursor?: string })?.next_cursor;
  } while (cursor);
  return contacts;
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");

  console.log("=== Step 1: Syncing database users to Resend ===");
  const dbUsers = await getDbUsers();
  const audiences = await resend.audiences.list();
  if (!audiences.data?.data?.[0]) {
    console.error("No audiences found");
    return;
  }
  const audienceId = audiences.data.data[0].id;
  const existingResendContacts = await getResendContacts(audienceId);
  const existingEmails = new Set(existingResendContacts.map(c => c.email.toLowerCase()));

  const toAdd = dbUsers.filter(u => !existingEmails.has(u.email.toLowerCase()));
  console.log(`Found ${toAdd.length} new users to sync to Resend.`);

  for (const user of toAdd) {
    if (!dryRun) {
      console.log(`Adding ${user.email} to audience...`);
      await resend.contacts.create({ audienceId, email: user.email, firstName: user.first_name });
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    else {
      console.log(`[DRY RUN] Would add ${user.email} to audience`);
    }
  }

  console.log("\n=== Step 2: Processing Drip Campaign ===");
  const tracking = await loadSentEmails();
  const now = new Date();
  let sentCount = 0;

  for (const user of dbUsers) {
    const userId = user.id;
    const email = user.email.toLowerCase();
    const userTracking = tracking.get(userId) || [];

    // Find next email in sequence
    const sentEmailTypes = new Set(userTracking.map(r => r.emailType));
    const nextEmailIndex = DRIP_SCHEDULE.findIndex(config => !sentEmailTypes.has(config.name));

    if (nextEmailIndex === -1) {
      // Drip completed for this user
      continue;
    }

    const nextEmail = DRIP_SCHEDULE[nextEmailIndex];

    // Check interval since last email
    if (userTracking.length > 0) {
      const lastSent = new Date(userTracking[userTracking.length - 1].sentAt);
      const diffMs = now.getTime() - lastSent.getTime();
      const diffDays = diffMs / (1000 * 60 * 60 * 24);

      if (diffDays < 2) {
        console.log(`Skipping ${email} - last email (${userTracking[userTracking.length - 1].emailType}) sent only ${diffDays.toFixed(1)} days ago.`);
        continue;
      }
    }

    console.log(`Sending ${nextEmail.name} to ${email}...`);
    if (!dryRun) {
      const result = await nextEmail.fn(email, user.first_name || "Amigo");
      if (result.success) {
        await saveSentEmail(userId, nextEmail.name, "sent");
        sentCount++;
        console.log(`  ✓ Successfully sent ${nextEmail.name}`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      else {
        await saveSentEmail(userId, nextEmail.name, "failed", String(result.error));
        console.error(`  ✗ Failed to send to ${email}:`, result.error);
      }
    }
    else {
      console.log(`  [DRY RUN] Would send ${nextEmail.name} to ${email}`);
      sentCount++;
    }
  }

  console.log(`\n=== Drip campaign processing complete. Total emails sent: ${sentCount} ===`);
}

main().catch(console.error);
