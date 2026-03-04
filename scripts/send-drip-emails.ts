import 'dotenv/config';
import { resolve } from 'path';
import dotenv from 'dotenv';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: resolve(__dirname, '../.env.local') });

import { 
  sendDripEmail1_Welcome,
  sendDripEmail2_CarbonCredits,
  sendDripEmail3_IREC,
  sendDripEmail4_Community,
  sendDripEmail5_Action
} from '../src/lib/email';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
if (!RESEND_API_KEY) {
  console.error('RESEND_API_KEY is not set');
  process.exit(1);
}
const resend = new Resend(RESEND_API_KEY);

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const DRIP_SCHEDULE = [
  { name: 'welcome', fn: sendDripEmail1_Welcome },
  { name: 'carbon_credits', fn: sendDripEmail2_CarbonCredits },
  { name: 'irec', fn: sendDripEmail3_IREC },
  { name: 'community', fn: sendDripEmail4_Community },
  { name: 'action', fn: sendDripEmail5_Action },
];

interface SentEmailRecord {
  email: string;
  sentAt: string;
  emailType: string;
}

interface TrackingData {
  contacts: Record<string, SentEmailRecord[]>;
}

const TRACKING_FILE = resolve(__dirname, '../data/drip-tracking.json');

function loadTracking(): TrackingData {
  try {
    if (existsSync(TRACKING_FILE)) {
      return JSON.parse(readFileSync(TRACKING_FILE, 'utf-8'));
    }
  } catch (e) {
    console.error('Error loading tracking file:', e);
  }
  return { contacts: {} };
}

function saveTracking(data: TrackingData) {
  const dir = resolve(__dirname, '../data');
  try {
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    writeFileSync(TRACKING_FILE, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error('Error saving tracking file:', e);
  }
}

interface ContactRecord {
  email: string;
  first_name?: string;
  created_at: string;
}

async function getDbUsers(): Promise<ContactRecord[]> {
  const { data, error } = await supabase.rpc('get_users_for_drip');
  if (error) {
    console.error('Error fetching users from DB:', error);
    throw error;
  }
  return (data as ContactRecord[])?.map((user) => ({
    email: user.email,
    created_at: user.created_at,
    first_name: user.first_name || undefined
  })) || [];
}

async function getResendContacts(audienceId: string) {
  const contacts: ContactRecord[] = [];
  let cursor: string | undefined;
  
  do {
    await new Promise(resolve => setTimeout(resolve, 600));
    const { data, error } = await resend.contacts.list({ audienceId, limit: 100 } as any);
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
  const dryRun = args.includes('--dry-run');
  
  console.log('=== Step 1: Syncing database users to Resend ===');
  const dbUsers = await getDbUsers();
  const audiences = await resend.audiences.list();
  if (!audiences.data?.data?.[0]) {
    console.error('No audiences found');
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
    } else {
      console.log(`[DRY RUN] Would add ${user.email} to audience`);
    }
  }

  console.log('\n=== Step 2: Processing Drip Campaign ===');
  const tracking = loadTracking();
  const contacts = await getResendContacts(audienceId);
  const now = new Date();
  let sentCount = 0;

  for (const contact of contacts) {
    const email = contact.email.toLowerCase();
    const userTracking = tracking.contacts[email] || [];
    
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
    } else {
      // First email (welcome) - check if we should wait since signup or just send it
      const createdAt = new Date(contact.created_at);
      const diffMs = now.getTime() - createdAt.getTime();
      const diffDays = diffMs / (1000 * 60 * 60 * 24);
      
      // If they just signed up 5 minutes ago, we can send welcome immediately (Day 0)
      // No extra check needed for welcome.
    }

    console.log(`Sending ${nextEmail.name} to ${email}...`);
    if (!dryRun) {
      const result = await nextEmail.fn(contact.email, contact.first_name || 'Amigo');
      if (result.success) {
        if (!tracking.contacts[email]) tracking.contacts[email] = [];
        tracking.contacts[email].push({
          email: contact.email,
          sentAt: now.toISOString(),
          emailType: nextEmail.name,
        });
        saveTracking(tracking);
        sentCount++;
        console.log(`  ✓ Successfully sent ${nextEmail.name}`);
        // Add a small delay between users to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));
      } else {
        console.error(`  ✗ Failed to send to ${email}:`, result.error);
      }
    } else {
      console.log(`  [DRY RUN] Would send ${nextEmail.name} to ${email}`);
      sentCount++;
    }
  }

  console.log(`\n=== Drip campaign processing complete. Total emails sent: ${sentCount} ===`);
}

main().catch(console.error);

