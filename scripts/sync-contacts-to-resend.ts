import 'dotenv/config';
import { resolve } from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: resolve(__dirname, '../.env.local') });

import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

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

interface ContactRecord {
  email: string;
  first_name?: string;
  created_at: string;
}

async function getDbUsers(): Promise<ContactRecord[]> {
  const { data, error } = await supabase
    .rpc('get_users_for_drip');

  if (error) {
    console.error('Error fetching users from DB:', error);
    throw error;
  }

  return data?.map((user: { email: string; created_at: string }) => ({
    email: user.email,
    created_at: user.created_at,
  })) || [];
}

async function getResendContacts(audienceId: string): Promise<string[]> {
  const contacts: string[] = [];
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
        contacts.push(...data.data.map(c => c.email));
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

async function addContactToResend(audienceId: string, email: string, firstName?: string) {
  const { data, error } = await resend.contacts.create({
    audienceId,
    email,
    firstName,
  });

  if (error) {
    if ((error.name as string) === 'already_exists') {
      return { success: true, alreadyExists: true };
    }
    console.error(`Error adding ${email}:`, error);
    return { success: false, error };
  }

  return { success: true, data };
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
  const dryRun = args.includes('--dry-run');
  const audienceArg = args.find(arg => arg.startsWith('--audience='));
  const audienceId = audienceArg ? audienceArg.replace('--audience=', '') : null;

  if (dryRun) {
    console.log('=== DRY RUN MODE ===\n');
  }

  console.log('Fetching users from database...');
  const dbUsers = await getDbUsers();
  console.log(`Found ${dbUsers.length} users in database`);

  console.log('\nFetching audiences from Resend...');
  const audiences = await listAudiences();

  console.log('Available audiences:');
  audiences.forEach(a => {
    const aud = a as unknown as { subscribers_count?: number };
    console.log(`  - ${a.id}: ${a.name} (${aud.subscribers_count ?? 'unknown'} subscribers)`);
  });

  let targetAudienceId = audienceId;

  if (!targetAudienceId) {
    if (audiences.length === 0) {
      console.error('No audiences found in Resend.');
      return;
    }
    targetAudienceId = audiences[0].id;
    console.log(`\nUsing first audience: ${audiences[0].name} (${targetAudienceId})`);
  }

  console.log(`\nFetching existing contacts from audience ${targetAudienceId}...`);
  const existingEmails = await getResendContacts(targetAudienceId);
  console.log(`Found ${existingEmails.length} existing contacts`);

  const emailsToAdd = dbUsers.filter(u => !existingEmails.includes(u.email.toLowerCase()));

  console.log(`\n=== Summary ===`);
  console.log(`Total in DB: ${dbUsers.length}`);
  console.log(`Already in Resend: ${existingEmails.length}`);
  console.log(`To add: ${emailsToAdd.length}`);

  if (emailsToAdd.length === 0) {
    console.log('\nNo new contacts to add.');
    return;
  }

  console.log('\n=== Adding contacts ===');

  if (dryRun) {
    for (const user of emailsToAdd) {
      console.log(`[DRY RUN] Would add: ${user.email}`);
    }
    return;
  }

  let added = 0;
  let skipped = 0;

  for (const user of emailsToAdd) {
    console.log(`Adding ${user.email}...`);
    await new Promise(resolve => setTimeout(resolve, 800));

    const result = await addContactToResend(targetAudienceId, user.email);

    if (result.success) {
      if (result.alreadyExists) {
        console.log(`  ↩ Already exists`);
        skipped++;
      } else {
        console.log(`  ✓ Added`);
        added++;
      }
    } else {
      console.log(`  ✗ Failed: ${result.error}`);
    }
  }

  console.log(`\n=== Complete ===`);
  console.log(`Added: ${added}`);
  console.log(`Skipped (already exists): ${skipped}`);
}

main().catch(console.error);
