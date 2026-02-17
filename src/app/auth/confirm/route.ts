import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import type { EmailOtpType } from '@supabase/supabase-js';

export async function GET(request: Request) {
    const requestUrl = new URL(request.url);
    const token_hash = requestUrl.searchParams.get('token_hash');
    const type = requestUrl.searchParams.get('type') as EmailOtpType | null;
    const code = requestUrl.searchParams.get('code');
    const next = requestUrl.searchParams.get('next') ?? '/dashboard';

    const supabase = await createClient();

    // Handle token_hash flow (email confirmation, magic link, recovery)
    if (token_hash && type) {
        const { error } = await supabase.auth.verifyOtp({
            type,
            token_hash,
        });

        if (!error) {
            if (type === 'recovery') {
                return NextResponse.redirect(new URL('/reset-password', requestUrl.origin));
            }
            return NextResponse.redirect(new URL(next, requestUrl.origin));
        }
    }

    // Handle PKCE code flow
    if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error) {
            if (type === 'recovery') {
                return NextResponse.redirect(new URL('/reset-password', requestUrl.origin));
            }
            return NextResponse.redirect(new URL(next, requestUrl.origin));
        }
    }

    // If we get here, something went wrong
    return NextResponse.redirect(
        new URL('/login?error=Link de confirmação inválido ou expirado. Tente novamente.', requestUrl.origin)
    );
}
