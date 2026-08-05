import type { User } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

import type { Database } from "@/types/supabase";
import type { UserRole } from "@/types";
import { createClient } from "@/lib/supabase/server";

type ProfileRoleRow = Pick<Database["public"]["Tables"]["profiles"]["Row"], "role">;

export interface ServerAuthContext {
  role: UserRole | null;
  supabase: Awaited<ReturnType<typeof createClient>>;
  user: User | null;
}

interface AdminServerAuthContext
  extends Omit<ServerAuthContext, "role" | "user"> {
  role: "admin";
  user: User;
}

export async function getServerAuthContext(): Promise<ServerAuthContext> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { supabase, user: null, role: null };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle<ProfileRoleRow>();

  return {
    supabase,
    user,
    role: profile?.role ?? null,
  };
}

export function isDevelopmentEnvironment() {
  return process.env.NODE_ENV !== "production";
}

/**
 * Roles allowed to use moderation tooling. Single source of truth — do not
 * re-inline this list at call sites.
 */
export const MODERATION_ROLES = ["moderator", "admin"] as const satisfies readonly UserRole[];

export type ActionAuthFailure = { ok: false; error: string };

export interface ActionAuthSuccess {
  ok: true;
  role: UserRole;
  supabase: Awaited<ReturnType<typeof createClient>>;
  user: User;
}

export type ActionAuthResult = ActionAuthSuccess | ActionAuthFailure;

/**
 * Require an authenticated user for a server action.
 *
 * Returns a discriminated result instead of throwing, so callers can surface
 * the message to the client directly.
 */
export async function requireActionUser(): Promise<ActionAuthResult> {
  const context = await getServerAuthContext();

  if (!context.user) {
    return { ok: false, error: "Usuário não autenticado" };
  }

  return {
    ok: true,
    supabase: context.supabase,
    user: context.user,
    role: context.role ?? "user",
  };
}

/**
 * Require an authenticated user whose role is in `allowedRoles`.
 *
 * `deniedError` is shown when the user is authenticated but lacks the role,
 * so each action can phrase its own refusal.
 */
export async function requireActionRole(
  allowedRoles: readonly UserRole[],
  deniedError: string,
): Promise<ActionAuthResult> {
  const auth = await requireActionUser();
  if (!auth.ok) {
    return auth;
  }

  if (!allowedRoles.includes(auth.role)) {
    return { ok: false, error: deniedError };
  }

  return auth;
}

/** Require a moderator or admin for a server action. */
export async function requireModerator(deniedError: string): Promise<ActionAuthResult> {
  return requireActionRole(MODERATION_ROLES, deniedError);
}

/** Require an admin for a server action. */
export async function requireAdmin(deniedError: string): Promise<ActionAuthResult> {
  return requireActionRole(["admin"], deniedError);
}

export async function requireAdminApiAccess(options?: {
  developmentOnly?: boolean;
}): Promise<
  | ({ ok: true } & AdminServerAuthContext)
  | { ok: false; response: NextResponse }
> {
  if (options?.developmentOnly && !isDevelopmentEnvironment()) {
    return {
      ok: false,
      response: new NextResponse("Not Found", { status: 404 }),
    };
  }

  const context = await getServerAuthContext();

  if (!context.user) {
    return {
      ok: false,
      response: new NextResponse("Unauthorized", { status: 401 }),
    };
  }

  if (context.role !== "admin") {
    return {
      ok: false,
      response: new NextResponse("Forbidden", { status: 403 }),
    };
  }

  return {
    ok: true,
    supabase: context.supabase,
    user: context.user,
    role: "admin",
  };
}
