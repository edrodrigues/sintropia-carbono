import { NextRequest, NextResponse } from 'next/server';

import { requireAdminApiAccess } from '@/lib/auth/server';

export async function GET(request: NextRequest) {
    const start = Date.now();
    const access = await requireAdminApiAccess({ developmentOnly: true });
    if (!access.ok) {
        return access.response;
    }

    const timings = {
        auth: Date.now() - start,
        total: Date.now() - start,
    };

    return NextResponse.json({
        timestamp: new Date().toISOString(),
        url: request.url,
        method: request.method,
        headers: Object.fromEntries(request.headers.entries()),
        auth: {
            user: {
                id: access.user.id,
                email: access.user.email,
                email_confirmed_at: access.user.email_confirmed_at,
            },
            role: access.role,
        },
        timings,
        environment: {
            hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
            hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
            nodeEnv: process.env.NODE_ENV,
        },
    });
}
