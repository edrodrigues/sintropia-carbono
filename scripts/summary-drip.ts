import 'dotenv/config';
import { resolve } from 'path';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';

dotenv.config({ path: resolve(__dirname, '../.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_KEY!);
const TRACKING_FILE = resolve(__dirname, '../data/drip-tracking.json');

async function main() {
    const { data: dbUsers, error } = await supabase.rpc('get_users_for_drip');
    const tracking = existsSync(TRACKING_FILE) ? JSON.parse(readFileSync(TRACKING_FILE, 'utf-8')) : { contacts: {} };

    const results = dbUsers?.map(user => {
        const email = user.email.toLowerCase();
        const sent = tracking.contacts[email]?.map(r => r.emailType).join(', ') || 'NONE';
        return { email, sent, created_at: user.created_at };
    });

    console.log('SUMMARY_START');
    console.log(JSON.stringify(results || [], null, 2));
    console.log('SUMMARY_END');
}

main().catch(console.error);
