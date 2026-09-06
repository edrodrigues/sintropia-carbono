import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { hasIncompleteProfile } from "@/lib/auth/profile-completeness";

const SUPPORTED_LOCALES = ["pt", "en", "es"] as const;

function localeFromNext(next: string): string {
  const match = next.match(/^\/(pt|en|es)(?:\/|$)/);
  return match && (SUPPORTED_LOCALES as readonly string[]).includes(match[1]) ? match[1] : "pt";
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const token_hash = requestUrl.searchParams.get("token_hash");
  const type = requestUrl.searchParams.get("type") as EmailOtpType | null;
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/";
  const locale = localeFromNext(next);

  const supabase = await createClient();

  const verified = token_hash && type
    ? (await supabase.auth.verifyOtp({ type, token_hash })).error === null
    : code
      ? (await supabase.auth.exchangeCodeForSession(code)).error === null
      : false;

  if (verified) {
    if (type === "recovery") {
      return NextResponse.redirect(new URL(`/${locale}/reset-password`, requestUrl.origin));
    }

    const { data: { user } } = await supabase.auth.getUser();

    if (user && await hasIncompleteProfile(supabase, user.id)) {
      return NextResponse.redirect(new URL(`/${locale}/onboarding`, requestUrl.origin));
    }

    return NextResponse.redirect(new URL(next, requestUrl.origin));
  }

  const msg = "Link de confirmação inválido ou expirado. Tente novamente.";
  return NextResponse.redirect(
    new URL(`/${locale}/login?error=${encodeURIComponent(msg)}`, requestUrl.origin),
  );
}
