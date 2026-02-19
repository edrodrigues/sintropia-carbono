import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { StatsDashboard } from "@/components/profile/StatsDashboard";
import { calculateAchievements } from "@/lib/achievements";
import Link from "next/link";

export default async function MyProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/profile");
  }

  const { data: posts } = await supabase
    .from("posts")
    .select("*")
    .eq("author_id", profile.id)
    .eq("is_deleted", false)
    .order("created_at", { ascending: false })
    .limit(10);

  const { count: postCount } = await supabase
    .from("posts")
    .select("id", { count: "exact", head: true })
    .eq("author_id", profile.id)
    .eq("is_deleted", false);

  const { count: commentCount } = await supabase
    .from("comments")
    .select("id", { count: "exact", head: true })
    .eq("author_id", profile.id)
    .eq("is_deleted", false);

  const userPostIds = posts?.map((p) => p.id) || [];
  const { count: upvotesReceived } = await supabase
    .from("votes")
    .select("id", { count: "exact", head: true })
    .in("target_id", userPostIds.length > 0 ? userPostIds : [""])
    .eq("vote_type", 1);

  const { count: higherKarmaCount } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .gt("karma", profile.karma || 0);

  const stats = {
    posts: postCount || 0,
    comments: commentCount || 0,
    upvotes: upvotesReceived || 0,
    ranking: higherKarmaCount !== null ? higherKarmaCount + 1 : 1,
  };

  const achievements = calculateAchievements(profile, {
    postCount: postCount || 0,
    commentCount: commentCount || 0,
    upvotesReceived: upvotesReceived || 0,
    hasLinkedIn: !!profile.linkedin_url,
    createdAt: profile.created_at,
  });

  return (
    <main className="container mx-auto max-w-5xl px-4 py-8">
      <ProfileHeader
        profile={profile}
        achievements={achievements}
        isOwnProfile={true}
      />

      <StatsDashboard stats={stats} />

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          Meus Posts
        </h2>
        <Link
          href="/feed"
          className="text-sm text-[#1e40af] dark:text-blue-400 hover:underline"
        >
          Criar novo post →
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {posts && posts.length > 0 ? (
          posts.map((post) => (
            <a
              key={post.id}
              href="/feed"
              className="block bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 uppercase">
                  {post.category}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(post.created_at).toLocaleDateString("pt-BR")}
                </span>
              </div>
              <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-1">
                {post.title}
              </h3>
              {post.content && (
                <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-3">
                  {post.content}
                </p>
              )}
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>⬆ {post.karma}</span>
                <span>💬 {post.comment_count}</span>
              </div>
            </a>
          ))
        ) : (
          <div className="col-span-full text-center py-8 text-gray-500">
            Nenhum post ainda.{" "}
            <Link href="/feed" className="text-[#1e40af] hover:underline">
              Criar primeiro post
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
