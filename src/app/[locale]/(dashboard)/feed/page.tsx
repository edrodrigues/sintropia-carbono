import { createClient } from "@/lib/supabase/server";
import FeedClient from "./FeedClient";
import { PostWithRelations } from "@/types";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
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

  // Get current user and their referral code
  const { data: { user } } = await supabase.auth.getUser();
  let referralCode = '';
  
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    referralCode = (profile as { referral_code?: string })?.referral_code || '';
  }

  return <FeedClient initialPosts={(posts || []) as PostWithRelations[]} referralCode={referralCode} />;
}
