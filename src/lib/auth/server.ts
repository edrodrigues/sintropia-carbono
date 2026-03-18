import type { User } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

import type { Database, UserRole } from "@/types/supabase";
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
