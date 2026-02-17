import { createClient } from "@/lib/supabase/server";
import FeedClient from "./FeedClient";
import { PostWithRelations } from "@/types";

export const dynamic = "force-dynamic";

export default async function FeedPage() {
    const supabase = await createClient();

    const { data: posts } = await supabase
        .from("posts")
        .select(`
      *,
      author:profiles(username, avatar_url, karma)
    `)
        .eq("is_deleted", false)
        .order("created_at", { ascending: false })
        .limit(20);

    return <FeedClient initialPosts={(posts || []) as PostWithRelations[]} />;
}
