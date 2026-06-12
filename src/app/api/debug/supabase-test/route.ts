import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const steps: Record<string, unknown> = {};
  const results: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    url: request.url,
    environment: {
      nodeEnv: process.env.NODE_ENV,
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      supabaseUrlLength: process.env.NEXT_PUBLIC_SUPABASE_URL?.length ?? 0,
      anonKeyLength: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length ?? 0,
    },
    steps,
  };

  // Step 1: createClient
  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    steps["1_createClient"] = { ok: true, hasClient: !!supabase };

    // Step 2: getUser
    try {
      const { data, error } = await supabase.auth.getUser();
      steps["2_getUser"] = {
        ok: true,
        hasUser: !!data?.user,
        userId: data?.user?.id ?? null,
        error: error ? { message: error.message, status: error.status } : null,
      };
    } catch (err) {
      steps["2_getUser"] = {
        ok: false,
        error: err instanceof Error ? { message: err.message, stack: err.stack?.split("\n").slice(0, 5).join("\n") } : String(err),
      };
    }

    // Step 3: query profiles (single without maybeSingle — to test if that's the issue)
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username")
        .eq("username", "edrodrigues")
        .single();
      steps["3_profiles_single"] = {
        ok: true,
        found: !!data,
        data,
        error: error ? { message: error.message, details: error.details, hint: error.hint, code: error.code } : null,
      };
    } catch (err) {
      steps["3_profiles_single"] = {
        ok: false,
        error: err instanceof Error ? { message: err.message, stack: err.stack?.split("\n").slice(0, 5).join("\n") } : String(err),
      };
    }

    // Step 4: query profiles with maybeSingle
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username")
        .eq("username", "edrodrigues")
        .maybeSingle();
      steps["4_profiles_maybeSingle"] = {
        ok: true,
        found: !!data,
        data,
        error: error ? { message: error.message, details: error.details, hint: error.hint, code: error.code } : null,
      };
    } catch (err) {
      steps["4_profiles_maybeSingle"] = {
        ok: false,
        error: err instanceof Error ? { message: err.message, stack: err.stack?.split("\n").slice(0, 5).join("\n") } : String(err),
      };
    }

    // Step 5: query posts (top 3 by karma)
    try {
      const { data, error } = await supabase
        .from("posts")
        .select("id, title, karma")
        .eq("is_deleted", false)
        .order("karma", { ascending: false })
        .limit(3);
      steps["5_posts"] = {
        ok: true,
        count: Array.isArray(data) ? data.length : 0,
        error: error ? { message: error.message, details: error.details } : null,
      };
    } catch (err) {
      steps["5_posts"] = {
        ok: false,
        error: err instanceof Error ? { message: err.message } : String(err),
      };
    }
  } catch (err) {
    steps["1_createClient"] = {
      ok: false,
      error: err instanceof Error ? { message: err.message, stack: err.stack?.split("\n").slice(0, 5).join("\n") } : String(err),
    };
  }

  return NextResponse.json(results);
}
