import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

export function createClient(): SupabaseClient<Database> {
  // Browser-only by design. This client reads auth state from document.cookie,
  // so on the server it silently yields an *anonymous* session: RLS-filtered
  // reads come back as empty or partial data rather than as errors, which is
  // very hard to notice. Server components, server actions and route handlers
  // must import createClient from "@/lib/supabase/server" instead.
  if (typeof window === "undefined") {
    throw new Error(
      "createClient() from @/lib/supabase/client is browser-only. "
      + "Use createClient() from @/lib/supabase/server on the server.",
    );
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase URL e Anon Key são obrigatórias em ambiente de cliente.");
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
