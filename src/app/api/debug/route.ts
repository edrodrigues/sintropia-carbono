'use server';

import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const start = Date.now();
    
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    const timings = {
        total: Date.now() - start,
        auth: Date.now() - start,
    };

    return NextResponse.json({
        timestamp: new Date().toISOString(),
        url: request.url,
        method: request.method,
        headers: Object.fromEntries(request.headers.entries()),
        auth: {
            user: user ? {
                id: user.id,
                email: user.email,
                email_confirmed_at: user.email_confirmed_at,
            } : null,
            error: authError?.message || null,
        },
        timings,
        environment: {
            hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
            hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
            nodeEnv: process.env.NODE_ENV,
        },
    });
}
