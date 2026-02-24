import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/'
    const onboarding = searchParams.get('onboarding')

    if (code) {
        const supabase = await createClient()
        
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        
        if (error) {
            console.error('Auth callback error:', error.message)
            return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`)
        }

        const forwardedHost = request.headers.get('x-forwarded-host')
        const isLocalEnv = process.env.NODE_ENV === 'development'
        
        let redirectUrl = isLocalEnv ? `${origin}${next}` : forwardedHost ? `https://${forwardedHost}${next}` : `${origin}${next}`
        
        if (onboarding === 'true') {
            redirectUrl = `${origin}/profile/edit?onboarding=true`
        }
        
        return NextResponse.redirect(redirectUrl)
    }

    return NextResponse.redirect(`${origin}/login?error=No+authorization+code+received`)
}
