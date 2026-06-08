"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { sendWelcomeEmail } from "@/lib/email";
import { checkRateLimit } from "@/lib/rate-limiter";
import { loginSchema, signupSchema, resetPasswordSchema, updatePasswordSchema } from "@/lib/validation";

const LOGIN_TIMEOUT_MS = 10000;

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error("Tempo limite excedido. Tente novamente.")), ms),
  );
  return Promise.race([promise, timeout]) as Promise<T>;
}

async function getRateLimitKey(type: string): Promise<string> {
  const hdrs = await headers();
  const ip = hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() || hdrs.get("x-real-ip") || "unknown";
  return `auth:${type}:${ip}`;
}

export async function login(formData: FormData) {
  const supabase = await createClient();

  const raw = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message || "Dados inválidos";
    redirect(`/login?error=${encodeURIComponent(msg)}`);
  }

  const rateKey = await getRateLimitKey("login");
  const rateCheck = checkRateLimit(rateKey);
  if (!rateCheck.allowed) {
    const retryAfter = Math.ceil(rateCheck.resetIn / 1000);
    redirect(`/login?error=Muitas tentativas. Tente novamente em ${retryAfter} segundos.`);
  }

  const data = parsed.data;

  const { error } = await withTimeout(
    supabase.auth.signInWithPassword(data),
    LOGIN_TIMEOUT_MS,
  );

  if (error) {
    redirect("/login?error=" + encodeURIComponent(error.message));
  }

  redirect("/");
}

export async function signup(formData: FormData) {
  const supabase = await createClient();

  const raw = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    name: formData.get("name") as string || "",
    username: formData.get("username") as string || "",
    user_type: formData.get("user_type") as string || "individual",
  };

  const parsed = signupSchema.safeParse(raw);
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message || "Dados inválidos";
    redirect(`/register?error=${encodeURIComponent(msg)}`);
  }

  const { email, password, name, username, user_type } = parsed.data;

  const rateKey = await getRateLimitKey("signup");
  const rateCheck = checkRateLimit(rateKey);
  if (!rateCheck.allowed) {
    const retryAfter = Math.ceil(rateCheck.resetIn / 1000);
    redirect(`/register?error=Muitas tentativas. Tente novamente em ${retryAfter} segundos.`);
  }

  const { error } = await withTimeout(
    supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name,
          username: username,
          user_type: user_type,
        },
        emailRedirectTo: `${(await headers()).get("origin")}/auth/callback`,
      },
    }),
    LOGIN_TIMEOUT_MS,
  );

  if (error) {
    redirect("/register?error=" + encodeURIComponent(error.message));
  }

  // Send welcome email (non-blocking, don't wait)
  sendWelcomeEmail(email, name || "Usuario").catch(console.error);

  redirect("/login?message=Cadastro realizado! Verifique seu e-mail para confirmar a conta.");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function signInWithGoogle() {
  const supabase = await createClient();
  const origin = (await headers()).get("origin");

  // Sign out any existing session to avoid stale token issues
  await supabase.auth.signOut();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    redirect("/login?error=" + encodeURIComponent(error.message));
  }

  if (data.url) {
    redirect(data.url);
  }
}

export async function signInWithLinkedIn() {
  const supabase = await createClient();
  const origin = (await headers()).get("origin");

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "linkedin_oidc",
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    redirect("/login?error=" + encodeURIComponent(error.message));
  }

  if (data.url) {
    redirect(data.url);
  }
}

export async function resetPassword(formData: FormData) {
  const supabase = await createClient();
  const raw = { email: formData.get("email") as string };
  const parsed = resetPasswordSchema.safeParse(raw);
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message || "E-mail inválido";
    redirect(`/forgot-password?error=${encodeURIComponent(msg)}`);
  }

  const { email } = parsed.data;
  const origin = (await headers()).get("origin");

  const rateKey = await getRateLimitKey("reset-password");
  const rateCheck = checkRateLimit(rateKey);
  if (!rateCheck.allowed) {
    const retryAfter = Math.ceil(rateCheck.resetIn / 1000);
    redirect(`/forgot-password?error=Muitas tentativas. Tente novamente em ${retryAfter} segundos.`);
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/confirm?type=recovery`,
  });

  if (error) {
    redirect("/forgot-password?error=" + encodeURIComponent(error.message));
  }

  redirect("/forgot-password?message=E-mail de recuperação enviado! Verifique sua caixa de entrada.");
}

export async function updatePassword(formData: FormData) {
  const supabase = await createClient();
  const raw = { password: formData.get("password") as string };
  const parsed = updatePasswordSchema.safeParse(raw);
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message || "Senha inválida";
    redirect(`/auth/reset-password?error=${encodeURIComponent(msg)}`);
  }

  const { password } = parsed.data;

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    redirect("/auth/reset-password?error=" + encodeURIComponent(error.message));
  }

  redirect("/login?message=Senha atualizada com sucesso!");
}
