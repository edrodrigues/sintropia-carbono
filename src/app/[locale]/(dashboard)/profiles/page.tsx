import { createClient } from "@/lib/supabase/server";
import { Metadata } from "next";
import { ProfilesClient } from "./ProfilesClient";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;

  return {
    title: locale === "pt" ? "Perfis da Comunidade | Sintropia" : "Community Profiles | Sintropia",
  };
}

export default async function ProfilesPage() {
  const supabase = await createClient();

  // Fetch all profiles with their stats
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, username, display_name, bio, user_type, karma, created_at")
    .neq("role", "banned")
    .order("karma", { ascending: false })
    .limit(50);

  // Fetch post counts for each profile
  const { data: postCounts } = await supabase
    .from("posts")
    .select("author_id")
    .eq("is_deleted", false);

  // Fetch comment counts for each profile
  const { data: commentCounts } = await supabase
    .from("comments")
    .select("author_id")
    .eq("is_deleted", false);

  // Calculate stats per user
  const postCountByUser = postCounts?.reduce((acc, p) => {
    acc[p.author_id] = (acc[p.author_id] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const commentCountByUser = commentCounts?.reduce((acc, c) => {
    acc[c.author_id] = (acc[c.author_id] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <ProfilesClient
        profiles={profiles || []}
        postCountByUser={postCountByUser}
        commentCountByUser={commentCountByUser}
      />
    </div>
  );
}
