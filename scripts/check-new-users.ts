import 'dotenv/config';
import { resolve } from 'path';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: resolve(__dirname, '../.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_KEY!);

async function main() {
    const { data: profiles, error } = await supabase
        .from('profiles')
        .select('email, created_at')
        .gt('created_at', '2026-02-24T00:00:00')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching profiles:', error);
        process.exit(1);
    }

    console.log('RECENT_REGISTRATIONS_START');
    console.log(JSON.stringify(profiles, null, 2));
    console.log('RECENT_REGISTRATIONS_END');
}

main().catch(console.error);
