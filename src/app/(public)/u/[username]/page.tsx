import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { Tooltip } from "@/components/ui/Tooltip";

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
        <main className="container mx-auto max-w-3xl px-4 py-12">
            <Breadcrumb />
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
                                <Tooltip content="Pontos ganhos com contribuições na comunidade">
                                    <span className="text-gray-500 cursor-help border-b border-dashed border-gray-400">Pontos</span>
                                </Tooltip>
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

                        {(profile.linkedin_url || profile.twitter_url) && (
                            <div className="flex gap-3 mt-4">
                                {profile.linkedin_url && (
                                    <a
                                        href={profile.linkedin_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm"
                                        title="LinkedIn"
                                    >
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                                        </svg>
                                        LinkedIn
                                    </a>
                                )}
                                {profile.twitter_url && (
                                    <a
                                        href={profile.twitter_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-gray-900 dark:text-gray-100 hover:text-gray-600 flex items-center gap-1 text-sm"
                                        title="Twitter/X"
                                    >
                                        𝕏
                                    </a>
                                )}
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
        </main>
    );
}
