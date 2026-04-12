import createIntlMiddleware from 'next-intl/middleware';
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { routing } from './i18n/routing';

const intlMiddleware = createIntlMiddleware(routing);

// Paths where authenticated users with incomplete profiles get redirected to onboarding.
// Only dashboard/authenticated paths are checked; all other paths pass through.
const DASHBOARD_PATHS = [
    '/dashboard',
    '/feed',
    '/profile',
    '/conquistas',
    '/leaderboard',
    '/mod',
    '/contribuir',
    '/posts',
    '/notifications',
]

function isDashboardPath(pathname: string): boolean {
    const pathWithoutLocale = pathname.replace(/^\/(pt|en|es)/, '') || '/'
    return DASHBOARD_PATHS.some(prefix => pathWithoutLocale.startsWith(prefix))
}

export async function middleware(request: NextRequest) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
        return intlMiddleware(request)
    }

    // Step 1: Run intl middleware first to handle locale routing
    const response = intlMiddleware(request)

    // If intl middleware issued a redirect (locale redirect), honor it immediately
    if (response.status >= 300 && response.status < 400) {
        return response
    }

    // Step 2: Only check profile completeness on dashboard paths
    // For all other paths (public pages, home, auth pages), just pass through
    if (!isDashboardPath(request.nextUrl.pathname)) {
        return response
    }

    // Step 3: Set up Supabase client to read auth state, setting cookies
    // on the EXISTING intl response (not creating a new one)
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
            getAll() {
                return request.cookies.getAll()
            },
            setAll(cookiesToSet) {
                cookiesToSet.forEach(({ name, value }) =>
                    request.cookies.set(name, value)
                )
                // Set cookies on the existing response from intl middleware,
                // NOT creating a new NextResponse that would discard locale info
                cookiesToSet.forEach(({ name, value, options }) =>
                    response.cookies.set(name, value, options)
                )
            },
        },
    })

    const { data: { user } } = await supabase.auth.getUser()

    // Step 4: If not authenticated on a dashboard path, let the page handle
    // the redirect to /login (which it already does)
    if (!user) {
        return response
    }

    // Step 5: Check profile completeness
    try {
        const { data: profile } = await supabase
            .from('profiles')
            .select('username, display_name')
            .eq('id', user.id)
            .single()

        const hasUsername = profile?.username && (profile.username as string).trim().length > 0
        const hasDisplayName = profile?.display_name && (profile.display_name as string).trim().length > 0

        if (!hasUsername || !hasDisplayName) {
            const localeMatch = request.nextUrl.pathname.match(/^\/(pt|en|es)/)
            const locale = localeMatch ? localeMatch![1] : routing.defaultLocale
            const onboardingUrl = new URL(`/${locale}/onboarding`, request.url)

            const redirectResponse = NextResponse.redirect(onboardingUrl)

            // Forward all cookies (including refreshed auth tokens) to the redirect
            response.cookies.getAll().forEach((cookie) => {
                redirectResponse.cookies.set(cookie.name, cookie.value)
            })

            return redirectResponse
        }
    } catch {
        // If profile check fails, continue normally
    }

    return response
}

export const config = {
    matcher: [
        '/',
        '/(pt|en|es)/:path*',
        '/((?!api|_next|_vercel|auth|.*\\..*).*)'
    ]
}