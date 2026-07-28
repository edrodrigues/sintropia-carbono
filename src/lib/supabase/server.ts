import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import type { Database } from "@/types/supabase";

export async function createClient(): Promise<SupabaseClient<Database>> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return createServerClient(
      "https://placeholder-url.supabase.co",
      "placeholder-key",
      {
        cookies: {
          getAll() { return []; },
          setAll() { },
        },
      },
    );
  }

  let getAllCookies: () => Array<{ name: string; value: string }> = () => [];
  let setAllCookies: (cookiesToSet: Array<{ name: string; value: string; options: Record<string, unknown> }>) => void = () => {};

  try {
    const cookieStore = await cookies();
    getAllCookies = () => cookieStore.getAll();
    setAllCookies = (cookiesToSet) => {
      for (const { name, value, options } of cookiesToSet) {
        try {
          cookieStore.set(name, value, options);
        } catch {
          // setAll called from a Server Component — safe to ignore
        }
      }
    };
  } catch {
    // cookies() unavailable (e.g. static generation, edge runtime)
  }

  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll: getAllCookies,
        setAll: setAllCookies,
      },
    },
  );
}
