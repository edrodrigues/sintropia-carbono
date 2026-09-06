"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { sendWelcomeEmail } from "@/lib/email";
import { buildRateLimitKey, checkRateLimit, type RateLimitResult } from "@/lib/rate-limiter";
import { loginSchema, signupSchema, resetPasswordSchema, updatePasswordSchema } from "@/lib/validation";

const LOGIN_TIMEOUT_MS = 10000;
const SUPPORTED_LOCALES = ["pt", "en", "es"] as const;

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error("Tempo limite excedido. Tente novamente.")), ms),
  );
  return Promise.race([promise, timeout]) as Promise<T>;
}

// Prefers the locale the form was actually submitted from (hidden "locale" field) over
// the Referer header, which is absent or unreliable for a meaningful share of requests.
async function getLocale(formData?: FormData): Promise<string> {
  const fromForm = formData?.get("locale");
  if (typeof fromForm === "string" && (SUPPORTED_LOCALES as readonly string[]).includes(fromForm)) {
    return fromForm;
  }
  const hdrs = await headers();
  const referer = hdrs.get("referer") || "";
  const match = referer.match(/\/(pt|en|es)\b/);
  return match ? match[1] : "pt";
}

/**
 * Two-tier rate limit for a credential endpoint identified by `email`:
 *  - (account + origin IP): stops repeated attempts from one source without
 *    punishing unrelated users who share an IP (CGNAT, corporate NAT).
 *  - account only, looser ceiling: stops an attacker from bypassing the check
 *    above by rotating IPs against the same target account/inbox.
 */
async function checkAuthRateLimit(action: string, email: string): Promise<RateLimitResult> {
  const hdrs = await headers();
  const ip = hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() || hdrs.get("x-real-ip") || "unknown";
  const normalizedEmail = email.trim().toLowerCase();

  const perOriginCheck = await checkRateLimit(buildRateLimitKey(action, `${normalizedEmail}:${ip}`));
  if (!perOriginCheck.allowed) {
    return perOriginCheck;
  }

  return checkRateLimit(buildRateLimitKey(`${action}-account`, normalizedEmail), {
    maxRequests: 10,
    windowSeconds: 300,
  });
}

function safeNextPath(raw: unknown, locale: string): string {
  if (typeof raw !== "string") return `/${locale}`;
  const trimmed = raw.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) return `/${locale}`;
  const decoded = decodeURIComponent(trimmed);
  // Re-check after decoding: a percent-encoded "//" (e.g. "/%2Fevil.com") passes the
  // check above but decodes into a protocol-relative URL, which is an open redirect.
  if (decoded.startsWith("//")) return `/${locale}`;
  if (!/^\/[A-Za-z0-9\-._~:/?#\[\]@!$&'()*+,;=%]*$/.test(decoded)) return `/${locale}`;
  return decoded;
}

export async function login(formData: FormData) {
  const locale = await getLocale(formData);
  const supabase = await createClient();
  const next = safeNextPath(formData.get("next"), locale);

  const raw = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message || "Dados inválidos";
    redirect(`/${locale}/login?error=${encodeURIComponent(msg)}&next=${encodeURIComponent(next)}`);
  }

  const data = parsed.data;

  const rateCheck = await checkAuthRateLimit("login", data.email);
  if (!rateCheck.allowed) {
    const msg = `Muitas tentativas. Tente novamente em ${rateCheck.resetIn} segundos.`;
    redirect(`/${locale}/login?error=${encodeURIComponent(msg)}&next=${encodeURIComponent(next)}`);
  }

  let authResult: Awaited<ReturnType<typeof supabase.auth.signInWithPassword>>;
  try {
    authResult = await withTimeout(
      supabase.auth.signInWithPassword(data),
      LOGIN_TIMEOUT_MS,
    );
  }
  catch {
    const msg = "Tempo limite excedido. Tente novamente.";
    redirect(`/${locale}/login?error=${encodeURIComponent(msg)}&next=${encodeURIComponent(next)}`);
  }

  if (authResult.error) {
    redirect(`/${locale}/login?error=${encodeURIComponent(authResult.error.message)}&next=${encodeURIComponent(next)}`);
  }

  redirect(next);
}

export async function signup(formData: FormData) {
  const locale = await getLocale(formData);
  const supabase = await createClient();

  const raw = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    name: formData.get("name") as string || "",
    username: formData.get("username") as string || "",
    user_type: formData.get("user_type") as string || "individual",
    referred_by_code: formData.get("referred_by_code") as string || "",
  };

  const parsed = signupSchema.safeParse(raw);
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message || "Dados inválidos";
    redirect(`/${locale}/register?error=${encodeURIComponent(msg)}`);
  }

  const { email, password, name, username, user_type, referred_by_code } = parsed.data;

  const rateCheck = await checkAuthRateLimit("signup", email);
  if (!rateCheck.allowed) {
    const msg = `Muitas tentativas. Tente novamente em ${rateCheck.resetIn} segundos.`;
    redirect(`/${locale}/register?error=${encodeURIComponent(msg)}`);
  }

  let authResult: Awaited<ReturnType<typeof supabase.auth.signUp>>;
  try {
    authResult = await withTimeout(
      supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            username,
            user_type,
            referred_by_code: referred_by_code || undefined,
          },
          emailRedirectTo: `${(await headers()).get("origin")}/auth/callback?next=${encodeURIComponent(`/${locale}`)}`,
        },
      }),
      LOGIN_TIMEOUT_MS,
    );
  }
  catch {
    const msg = "Tempo limite excedido. Tente novamente.";
    redirect(`/${locale}/register?error=${encodeURIComponent(msg)}`);
  }

  if (authResult.error) {
    redirect(`/${locale}/register?error=${encodeURIComponent(authResult.error.message)}`);
  }

  // Send welcome email (non-blocking, don't wait)
  sendWelcomeEmail(email, name || "Usuario").catch(console.error);

  const msg = "Cadastro realizado! Verifique seu e-mail para confirmar a conta.";
  redirect(`/${locale}/login?message=${encodeURIComponent(msg)}`);
}

export async function resetPassword(formData: FormData) {
  const locale = await getLocale(formData);
  const supabase = await createClient();
  const raw = { email: formData.get("email") as string };
  const parsed = resetPasswordSchema.safeParse(raw);
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message || "E-mail inválido";
    redirect(`/${locale}/forgot-password?error=${encodeURIComponent(msg)}`);
  }

  const { email } = parsed.data;
  const origin = (await headers()).get("origin");

  const rateCheck = await checkAuthRateLimit("reset-password", email);
  if (!rateCheck.allowed) {
    const msg = `Muitas tentativas. Tente novamente em ${rateCheck.resetIn} segundos.`;
    redirect(`/${locale}/forgot-password?error=${encodeURIComponent(msg)}`);
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/confirm?type=recovery&next=${encodeURIComponent(`/${locale}`)}`,
  });

  if (error) {
    redirect(`/${locale}/forgot-password?error=${encodeURIComponent(error.message)}`);
  }

  const msg = "E-mail de recuperação enviado! Verifique sua caixa de entrada.";
  redirect(`/${locale}/forgot-password?message=${encodeURIComponent(msg)}`);
}

export async function updatePassword(formData: FormData) {
  const locale = await getLocale(formData);
  const supabase = await createClient();
  const raw = { password: formData.get("password") as string };
  const parsed = updatePasswordSchema.safeParse(raw);
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message || "Senha inválida";
    redirect(`/${locale}/reset-password?error=${encodeURIComponent(msg)}`);
  }

  const { password } = parsed.data;

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    redirect(`/${locale}/reset-password?error=${encodeURIComponent(error.message)}`);
  }

  const msg = "Senha atualizada com sucesso!";
  redirect(`/${locale}/login?message=${encodeURIComponent(msg)}`);
}
