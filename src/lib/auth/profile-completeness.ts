import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Single source of truth for "does this user still need onboarding".
 * Used by middleware and both auth callback routes — keep them in sync by
 * calling this instead of re-inlining the username/display_name check.
 */
export async function hasIncompleteProfile(
  supabase: SupabaseClient,
  userId: string,
): Promise<boolean> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("username, display_name")
    .eq("id", userId)
    .maybeSingle();

  const hasUsername = Boolean(profile?.username && (profile.username as string).trim().length > 0);
  const hasDisplayName = Boolean(profile?.display_name && (profile.display_name as string).trim().length > 0);

  return !hasUsername || !hasDisplayName;
}
