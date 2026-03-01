import { createClient } from "@/lib/supabase/server";
import FeedClient from "./FeedClient";
import { PostWithRelations } from "@/types";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    
    return {
        title: locale === 'pt' ? 'Feed de Notícias | Sintropia' : 'News Feed | Sintropia',
        robots: {
            index: false,
            follow: false,
        },
    };
}

export const dynamic = "force-dynamic";

export default async function FeedPage() {
  const supabase = await createClient();

  const { data: posts } = await supabase
    .from("posts")
    .select(`
      *,
      author:profiles!inner(username, avatar_url, karma, linkedin_url, user_type, role)
    `)
    .eq("is_deleted", false)
    .neq("author.role", "banned")
    .order("created_at", { ascending: false })
    .limit(20);

  return <FeedClient initialPosts={(posts || []) as PostWithRelations[]} />;
}
