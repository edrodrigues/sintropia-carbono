import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { logger } from "@/lib/utils/logger";
import { hasIncompleteProfile } from "@/lib/auth/profile-completeness";

const SUPPORTED_LOCALES = ["pt", "en", "es"] as const;

function localeFromNext(next: string): string {
  const match = next.match(/^\/(pt|en|es)(?:\/|$)/);
  return match && (SUPPORTED_LOCALES as readonly string[]).includes(match[1]) ? match[1] : "pt";
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";
  const locale = localeFromNext(next);

  const forwardedHost = request.headers.get("x-forwarded-host");
  const isLocalEnv = process.env.NODE_ENV === "development";
  const redirectBase = isLocalEnv ? origin : forwardedHost ? `https://${forwardedHost}` : origin;

  if (code) {
    const supabase = await createClient();

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      logger.error("Auth callback error", { error: error.message });
      return NextResponse.redirect(`${redirectBase}/${locale}/login?error=${encodeURIComponent(error.message)}`);
    }

    const { data: { user } } = await supabase.auth.getUser();

    if (user && await hasIncompleteProfile(supabase, user.id)) {
      return NextResponse.redirect(`${redirectBase}/${locale}/onboarding`);
    }

    return NextResponse.redirect(`${redirectBase}${next}`);
  }

  return NextResponse.redirect(`${redirectBase}/${locale}/login?error=${encodeURIComponent("No authorization code received")}`);
}
