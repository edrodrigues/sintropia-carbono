import 'dotenv/config';
import { resolve } from 'path';
import dotenv from 'dotenv';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';

dotenv.config({ path: resolve(__dirname, '../.env.local') });

import { Resend } from 'resend';
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

const APP_URL = 'https://sintropia.space/';

const DRIP_SCHEDULE = [
  { day: 0, name: 'welcome', fn: sendDripEmail1_Welcome },
  { day: 2, name: 'carbon_credits', fn: sendDripEmail2_CarbonCredits },
  { day: 4, name: 'irec', fn: sendDripEmail3_IREC },
  { day: 6, name: 'community', fn: sendDripEmail4_Community },
  { day: 9, name: 'action', fn: sendDripEmail5_Action },
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

function hasEmailBeenSent(tracking: TrackingData, email: string, emailType: string): boolean {
  const contact = tracking.contacts[email];
  if (!contact) return false;
  return contact.some(record => record.emailType === emailType);
}

interface ContactRecord {
  email: string;
  first_name?: string;
  created_at?: string;
}

async function getAudienceContacts(audienceId: string) {
  const contacts: ContactRecord[] = [];
  let cursor: string | undefined;
  let attempts = 0;
  const maxAttempts = 3;

  do {
    try {
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const listOptions: { audienceId: string; limit: number; cursor?: string } = {
        audienceId,
        limit: 100,
      };
      if (cursor) listOptions.cursor = cursor;
      
      const { data, error } = await resend.contacts.list(listOptions);

      if (error) {
        if (error.name === 'rate_limit_exceeded') {
          attempts++;
          if (attempts < maxAttempts) {
            console.log(`Rate limited, retrying in 2 seconds... (attempt ${attempts}/${maxAttempts})`);
            await new Promise(resolve => setTimeout(resolve, 2000));
            continue;
          }
        }
        console.error('Error fetching contacts:', error);
        throw error;
      }

      if (data?.data) {
        contacts.push(...data.data.map(c => ({
          email: c.email,
          first_name: c.first_name ?? undefined,
          created_at: (c as unknown as { created_at?: string }).created_at,
        })));
      }

      cursor = (data as unknown as { next_cursor?: string })?.next_cursor;
      attempts = 0;
    } catch (err) {
      console.error('Exception:', err);
      throw err;
    }
  } while (cursor);

  return contacts;
}

async function listAudiences() {
  const { data, error } = await resend.audiences.list();

  if (error) {
    console.error('Error listing audiences:', error);
    throw error;
  }

  return data?.data || [];
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Drip Campaign Email Sender

Usage: npx tsx scripts/send-drip-emails.ts [options]

Options:
  --dry-run         Run without actually sending emails
  --email=<type>   Send only a specific email type
  --days=<n>       Simulate n days since signup (for testing)
  --help, -h       Show this help message

Email types:
  welcome       - Day 0: Welcome email
  carbon_credits - Day 2: Understanding Carbon Credits
  irec          - Day 4: IREC Certificates
  community     - Day 6: Community & Karma
  action        - Day 9: Call to Action

Examples:
  npx tsx scripts/send-drip-emails.ts                  # Run full drip campaign
  npx tsx scripts/send-drip-emails.ts --dry-run         # Test without sending
  npx tsx scripts/send-drip-emails.ts --email=welcome   # Send only welcome email
  npx tsx scripts/send-drip-emails.ts --days=5          # Simulate 5 days since signup
`);
    return;
  }

  const dryRun = args.includes('--dry-run');
  const emailIndex = args.findIndex(arg => arg.startsWith('--email='));
  const specificEmail = emailIndex >= 0 ? args[emailIndex].replace('--email=', '') : null;
  const daysIndex = args.findIndex(arg => arg.startsWith('--days='));
  const simulatedDays = daysIndex >= 0 ? parseInt(args[daysIndex].replace('--days=', ''), 10) : null;

  if (dryRun) {
    console.log('=== DRY RUN MODE ===\n');
  }

  console.log('Loading drip email tracking...');
  const tracking = loadTracking();

  console.log('Listing audiences...');
  const audiences = await listAudiences();
  
  console.log('Available audiences:');
  audiences.forEach(a => {
    const aud = a as unknown as { subscribers_count?: number };
    console.log(`  - ${a.id}: ${a.name} (${aud.subscribers_count ?? 'unknown'} subscribers)`);
  });

  if (audiences.length === 0) {
    console.log('No audiences found.');
    return;
  }

  let contacts: ContactRecord[] = [];
  
  for (const audience of audiences) {
    console.log(`\nFetching contacts from audience: ${audience.name} (${audience.id})...`);
    const audienceContacts = await getAudienceContacts(audience.id);
    console.log(`Found ${audienceContacts.length} contacts in ${audience.name}`);
    contacts = [...contacts, ...audienceContacts];
  }

  console.log(`\nTotal contacts found: ${contacts.length}`);

  if (contacts.length === 0) {
    console.log('No contacts found in any audience.');
    return;
  }

  if (specificEmail) {
    console.log(`\nSending specific email type: ${specificEmail}`);
    const emailConfig = DRIP_SCHEDULE.find(e => e.name === specificEmail);
    if (!emailConfig) {
      console.error(`Email type "${specificEmail}" not found. Available: ${DRIP_SCHEDULE.map(e => e.name).join(', ')}`);
      return;
    }

    const results = [];
    for (const contact of contacts) {
      if (hasEmailBeenSent(tracking, contact.email, specificEmail)) {
        console.log(`Skipping ${contact.email} - already sent ${specificEmail}`);
        continue;
      }

      console.log(`Sending ${specificEmail} to ${contact.email}...`);
      if (!dryRun) {
        await new Promise(resolve => setTimeout(resolve, 800));
        const result = await emailConfig.fn(contact.email, contact.first_name || 'Amigo');
        
        if (result.success) {
          if (!tracking.contacts[contact.email]) {
            tracking.contacts[contact.email] = [];
          }
          tracking.contacts[contact.email].push({
            email: contact.email,
            sentAt: new Date().toISOString(),
            emailType: specificEmail,
          });
          saveTracking(tracking);
          console.log(`  ✓ Sent to ${contact.email}`);
        } else {
          console.log(`  ✗ Failed: ${result.error}`);
        }
        results.push(result);
      }
    }
    console.log(`\nCompleted sending ${specificEmail}`);
    return;
  }

  const now = new Date();
  console.log(`\n=== Sending Drip Campaign (${now.toISOString()}) ===\n`);

  for (const dripConfig of DRIP_SCHEDULE) {
    console.log(`\n--- ${dripConfig.name} (Day ${dripConfig.day}) ---`);
    let sent = 0;
    let skipped = 0;

    for (const contact of contacts) {
      if (hasEmailBeenSent(tracking, contact.email, dripConfig.name) && simulatedDays === null) {
        skipped++;
        continue;
      }

      const createdAt = contact.created_at ? new Date(contact.created_at) : now;
      const daysSinceSignup = simulatedDays !== null 
        ? simulatedDays 
        : Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));

      if (daysSinceSignup < dripConfig.day) {
        console.log(`Skipping ${contact.email} - only ${daysSinceSignup} days since signup (needs ${dripConfig.day})`);
        skipped++;
        continue;
      }

      console.log(`Sending to ${contact.email} (Day ${daysSinceSignup})...`);
      if (!dryRun) {
        await new Promise(resolve => setTimeout(resolve, 800));
        const result = await dripConfig.fn(contact.email, contact.first_name || 'Amigo');
        
        if (result.success) {
          if (!tracking.contacts[contact.email]) {
            tracking.contacts[contact.email] = [];
          }
          tracking.contacts[contact.email].push({
            email: contact.email,
            sentAt: new Date().toISOString(),
            emailType: dripConfig.name,
          });
          saveTracking(tracking);
          sent++;
          console.log(`  ✓ Sent ${dripConfig.name} to ${contact.email}`);
        } else {
          console.log(`  ✗ Failed: ${result.error}`);
        }
      } else {
        console.log(`  [DRY RUN] Would send ${dripConfig.name} to ${contact.email}`);
        sent++;
      }
    }

    console.log(`Sent: ${sent}, Skipped: ${skipped}`);
  }

  console.log('\n=== Drip Campaign Complete ===');
}

main().catch(console.error);
