"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { FeedPostCard } from "@/components/posts/FeedPostCard";
import { PostWithRelations } from "@/types";

export function CommunityFeed() {
    const [posts, setPosts] = useState<PostWithRelations[]>([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState<"new" | "top">("new");
    const supabase = createClient();

    useEffect(() => {
        async function fetchPosts() {
            setLoading(true);
            let query = supabase
                .from("posts")
                .select(`*, author:profiles(username, avatar_url, karma, linkedin_url, user_type)`)
                .eq("is_deleted", false);

            if (sortBy === "new") {
                query = query.order("created_at", { ascending: false });
            } else {
                query = query.order("comment_count", { ascending: false });
            }

            const { data } = await query.limit(3);
            if (data) setPosts(data as PostWithRelations[]);
            setLoading(false);
        }

        fetchPosts();
    }, [sortBy, supabase]);

    return (
        <div className="flex-[2]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 sm:mb-10">
                <h2 className="text-2xl sm:text-3xl font-bold text-forest-green">Feed da Comunidade</h2>
                <div className="flex bg-slate-100 p-1 rounded-xl w-fit">
                    <button
                        onClick={() => setSortBy("new")}
                        className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${sortBy === "new" ? "bg-forest-green text-white shadow-sm" : "text-slate-500 hover:text-slate-900"
                            }`}
                    >
                        Recentes
                    </button>
                    <button
                        onClick={() => setSortBy("top")}
                        className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${sortBy === "top" ? "bg-forest-green text-white shadow-sm" : "text-slate-500 hover:text-slate-900"
                            }`}
                    >
                        Populares
                    </button>
                </div>
            </div>

            <div className="space-y-6">
                {loading ? (
                    <div className="flex flex-col gap-6">
                        {[1, 2].map((i) => (
                            <div key={i} className="h-40 bg-slate-100 rounded-2xl animate-pulse" />
                        ))}
                    </div>
                ) : posts.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6">
                        {posts.map((post) => (
                            <Link key={post.id} href={`/feed?post=${post.id}`} className="block bg-white rounded-2xl border border-slate-100 hover:shadow-premium transition-all overflow-hidden group">
                                <FeedPostCard post={post} />
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="p-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        <p className="text-slate-400 font-medium">Nenhum post encontrado.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
