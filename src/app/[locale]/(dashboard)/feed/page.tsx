import { createClient } from "@/lib/supabase/server";
import FeedClient from "./FeedClient";
import { PostWithRelations } from "@/types";
import { logger } from "@/lib/utils/logger";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  return {
    title: locale === "pt" ? "Feed de Notícias | Sintropia" : "News Feed | Sintropia",
    robots: {
      index: false,
      follow: false,
    },
  };
}

export const dynamic = "force-dynamic";

export default async function FeedPage() {
  let supabase;
  try {
    supabase = await createClient();
  } catch (err) {
    logger.error("FeedPage: Failed to create Supabase client", { error: String(err) });
    supabase = null;
  }

  let posts: PostWithRelations[] = [];
  try {
    const { data } = supabase
      ? await supabase
        .from("posts")
        .select(`
            *,
            author:profiles!inner(username, avatar_url, karma, linkedin_url, user_type, role)
          `)
        .eq("is_deleted", false)
        .neq("author.role", "banned")
        .order("created_at", { ascending: false })
        .limit(20)
      : { data: null };
    posts = (data as PostWithRelations[]) || [];
  } catch (err) {
    logger.error("FeedPage: Failed to load posts", { error: String(err) });
    posts = [];
  }

  let referralCode = "";
  try {
    const { data: { user } } = supabase
      ? await supabase.auth.getUser()
      : { data: { user: null } };
    if (user) {
      const { data: profile } = await supabase!
        .from("profiles")
        .select("referral_code")
        .eq("id", user.id)
        .maybeSingle();
      referralCode = (profile as { referral_code?: string })?.referral_code || "";
    }
  } catch {
    referralCode = "";
  }

  return <FeedClient initialPosts={posts} referralCode={referralCode} />;
}
