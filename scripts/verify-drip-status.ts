import 'dotenv/config';
import { resolve } from 'path';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';

dotenv.config({ path: resolve(__dirname, '../.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const TRACKING_FILE = resolve(__dirname, '../data/drip-tracking.json');

async function main() {
    console.log('--- DB USERS (from get_users_for_drip) ---');
    const { data: dbUsers, error: dbError } = await supabase.rpc('get_users_for_drip');

    if (dbError) {
        console.error('Error calling get_users_for_drip:', dbError);
        // fallback to profiles if RPC fails
        console.log('Falling back to profiles table...');
        const { data: profiles, error: pError } = await supabase.from('profiles').select('email, created_at').order('created_at', { ascending: false });
        if (pError) console.error('Error fetching profiles:', pError);
        else dbUsers = profiles;
    }

    console.log(`Found ${dbUsers?.length || 0} users in DB`);
    console.log(JSON.stringify(dbUsers, null, 2));

    console.log('\n--- TRACKING FILE ---');
    if (existsSync(TRACKING_FILE)) {
        const tracking = JSON.parse(readFileSync(TRACKING_FILE, 'utf-8'));
        console.log(`Tracking found ${Object.keys(tracking.contacts).length} contacts`);

        dbUsers?.forEach(user => {
            const email = user.email.toLowerCase();
            const records = tracking.contacts[email];
            if (!records) {
                console.log(`[MISSING] ${email} (Created: ${user.created_at}) - No emails sent yet.`);
            } else {
                const types = records.map(r => r.emailType).join(', ');
                console.log(`[OK] ${email} - Sent: ${types}`);
            }
        });
    } else {
        console.log('Tracking file not found.');
    }
}

main().catch(console.error);
