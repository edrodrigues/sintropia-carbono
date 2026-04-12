import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/'

    if (code) {
        const supabase = await createClient()
        
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        
        if (error) {
            console.error('Auth callback error:', error.message)
            return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`)
        }

        const { data: { user } } = await supabase.auth.getUser()

        const forwardedHost = request.headers.get('x-forwarded-host')
        const isLocalEnv = process.env.NODE_ENV === 'development'
        
        const redirectBase = isLocalEnv ? origin : forwardedHost ? `https://${forwardedHost}` : origin

        if (user) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('username, display_name')
                .eq('id', user.id)
                .single()

            const hasUsername = profile?.username && profile.username.trim().length > 0
            const hasDisplayName = profile?.display_name && profile.display_name.trim().length > 0

            if (!hasUsername || !hasDisplayName) {
                return NextResponse.redirect(`${redirectBase}/onboarding`)
            }
        }

        return NextResponse.redirect(`${redirectBase}${next}`)
    }

    return NextResponse.redirect(`${origin}/login?error=No+authorization+code+received`)
}