import createIntlMiddleware from 'next-intl/middleware';
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { routing } from './i18n/routing';

const intlMiddleware = createIntlMiddleware(routing);

const ONBOARDING_WHITELIST = [
    '/onboarding',
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/auth',
    '/api',
    '/_next',
]

function isOnboardingWhitelisted(pathname: string): boolean {
    const pathWithoutLocale = pathname.replace(/^\/(pt|en|es)/, '') || '/'
    return ONBOARDING_WHITELIST.some(prefix => pathWithoutLocale.startsWith(prefix))
}

export async function middleware(request: NextRequest) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
        return intlMiddleware(request)
    }

    let response = intlMiddleware(request)

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
            getAll() {
                return request.cookies.getAll()
            },
            setAll(cookiesToSet) {
                cookiesToSet.forEach(({ name, value }) =>
                    request.cookies.set(name, value)
                )
                response = NextResponse.next({ request })
                cookiesToSet.forEach(({ name, value, options }) =>
                    response.cookies.set(name, value, options)
                )
            },
        },
    })

    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('username, display_name')
            .eq('id', user.id)
            .single()

        const hasUsername = profile?.username && (profile.username as string).trim().length > 0
        const hasDisplayName = profile?.display_name && (profile.display_name as string).trim().length > 0

        if (!hasUsername || !hasDisplayName) {
            if (!isOnboardingWhitelisted(request.nextUrl.pathname)) {
                const localeMatch = request.nextUrl.pathname.match(/^\/(pt|en|es)/)
                const locale = localeMatch ? localeMatch[1] : routing.defaultLocale
                const onboardingUrl = new URL(`/${locale}/onboarding`, request.url)

                const redirectResponse = NextResponse.redirect(onboardingUrl)

                response.cookies.getAll().forEach((cookie) => {
                    redirectResponse.cookies.set(cookie.name, cookie.value, {
                        path: cookie.path || '/',
                        expires: cookie.expires ? new Date(cookie.expires) : undefined,
                        httpOnly: cookie.httpOnly,
                        secure: cookie.secure,
                        sameSite: cookie.sameSite as 'lax' | 'strict' | 'none' | undefined,
                    })
                })

                return redirectResponse
            }
        }
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