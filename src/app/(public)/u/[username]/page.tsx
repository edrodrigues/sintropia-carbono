import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";

interface PageProps {
    params: Promise<{ username: string }>;
}

export default async function PublicProfilePage(props: PageProps) {
    const params = await props.params;
    const username = params.username;
    const supabase = await createClient();

    const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("username", username)
        .single();

    if (!profile) {
        notFound();
    }

    const { data: posts } = await supabase
        .from("posts")
        .select("*")
        .eq("author_id", profile.id)
        .eq("is_deleted", false)
        .order("created_at", { ascending: false })
        .limit(10);

    const { data: postCounts } = await supabase
        .from("posts")
        .select("id", { count: "exact" })
        .eq("author_id", profile.id)
        .eq("is_deleted", false);

    const { data: commentCounts } = await supabase
        .from("comments")
        .select("id", { count: "exact" })
        .eq("author_id", profile.id)
        .eq("is_deleted", false);

    const getBadge = (karma: number) => {
        if (karma >= 1000) return { emoji: "👑", label: "Master", color: "yellow" };
        if (karma >= 500) return { emoji: "💎", label: "Especialista", color: "blue" };
        if (karma >= 100) return { emoji: "🌟", label: "Contribuidor", color: "green" };
        if (karma >= 10) return { emoji: "🌱", label: "Iniciante", color: "emerald" };
        return { emoji: "🥚", label: "Novato", color: "gray" };
    };

    const badge = getBadge(profile.karma || 0);

    return (
        <div className="container mx-auto max-w-3xl px-4 py-12">
            <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 p-8 mb-8">
                <div className="flex items-start gap-6">
                    <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-3xl flex-shrink-0">
                        {profile.display_name?.[0].toUpperCase() || profile.username?.[0].toUpperCase() || "?"}
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                {profile.display_name || profile.username}
                            </h1>
                            <span className="text-2xl">{badge.emoji}</span>
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 mb-3">@{profile.username}</p>
                        
                        {profile.bio && (
                            <p className="text-gray-700 dark:text-gray-300 mb-4">{profile.bio}</p>
                        )}

                        <div className="flex flex-wrap gap-4 text-sm">
                            <div className="flex items-center gap-1">
                                <span className="font-bold text-yellow-600">{profile.karma?.toLocaleString() || 0}</span>
                                <span className="text-gray-500">Karma</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <span className="font-bold text-gray-900 dark:text-gray-100">{postCounts?.length || 0}</span>
                                <span className="text-gray-500">Posts</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <span className="font-bold text-gray-900 dark:text-gray-100">{commentCounts?.length || 0}</span>
                                <span className="text-gray-500">Comentários</span>
                            </div>
                        </div>

                        {profile.organization && (
                            <div className="mt-3 text-sm text-gray-500">
                                🏢 {profile.organization}
                                {profile.cargo && ` - ${profile.cargo}`}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                    Posts Recentes
                </h2>
                <div className="space-y-4">
                    {posts && posts.length > 0 ? (
                        posts.map((post) => (
                            <Link
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
                                    <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
                                        {post.content}
                                    </p>
                                )}
                                <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                                    <span>⬆ {post.karma}</span>
                                    <span>💬 {post.comment_count}</span>
                                </div>
                            </Link>
                        ))
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            Nenhum post ainda.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
