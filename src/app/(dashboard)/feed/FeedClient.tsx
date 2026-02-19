"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { FeedPostCard } from "@/components/posts/FeedPostCard";
import { CreatePostButton } from "@/components/posts/CreatePostButton";
import { PostModal } from "@/components/posts/PostModal";
import { PostWithRelations } from "@/types";
import { User } from "@supabase/supabase-js";

type SortOption = "top" | "new" | "best";

export default function FeedClient({ initialPosts }: { initialPosts: PostWithRelations[] }) {
    const [posts, setPosts] = useState(initialPosts);
    const [selectedPost, setSelectedPost] = useState<PostWithRelations | null>(null);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [sortBy, setSortBy] = useState<SortOption>("new");
    const supabase = createClient();

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setCurrentUser(user);
        };
        getUser();
    }, [supabase]);

    const handleOpenModal = (post: PostWithRelations) => {
        setSelectedPost(post);
    };

    const handleCloseModal = () => {
        setSelectedPost(null);
    };

    const refreshPosts = useCallback(async () => {
        let query = supabase
            .from("posts")
            .select(`*, author:profiles(username, avatar_url, karma, linkedin_url)`)
            .eq("is_deleted", false);

        switch (sortBy) {
            case "top":
                query = query.order("karma", { ascending: false });
                break;
            case "new":
                query = query.order("created_at", { ascending: false });
                break;
            case "best":
                query = query.order("comment_count", { ascending: false });
                break;
        }

        const { data } = await query.limit(20);

        if (data) setPosts(data as PostWithRelations[]);
    }, [sortBy, supabase]);

    useEffect(() => {
        refreshPosts();
    }, [sortBy, refreshPosts]);

    const handlePostUpdated = (updatedPost: PostWithRelations) => {
        setPosts(prev => prev.map(p => p.id === updatedPost.id ? updatedPost : p));
        setSelectedPost(updatedPost);
    };

    const handlePostDeleted = (deletedPostId: string) => {
        setPosts(prev => prev.filter(p => p.id !== deletedPostId));
        setSelectedPost(null);
    };

    const sortOptions: { value: SortOption; label: string }[] = [
        { value: "top", label: "Top" },
        { value: "new", label: "Novos" },
        { value: "best", label: "Melhores" },
    ];

    return (
        <>
            <div className="container mx-auto max-w-5xl px-4">
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                            Feed de Hoje
                        </h1>
                        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                            {sortOptions.map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => setSortBy(option.value)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                        sortBy === option.value
                                            ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm"
                                            : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                                    }`}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">
                        Compartilhe insights e discuta as tendências do mercado de carbono.
                    </p>
                </div>

                <div className="space-y-6">
                    <CreatePostButton onPostCreated={refreshPosts} />

                    <div className="border-t border-gray-200 dark:border-gray-700">
                        {posts && posts.length > 0 ? (
                            posts.map((post, index) => (
                                <FeedPostCard 
                                    key={post.id} 
                                    post={post} 
                                    onOpenModal={handleOpenModal}
                                    isAlternateBg={index % 2 === 1}
                                />
                            ))
                        ) : (
                            <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700">
                                <div className="text-5xl mb-4">🌱</div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Ainda não há posts</h3>
                                <p className="text-gray-500">Seja o primeiro a compartilhar algo com a comunidade!</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {selectedPost && (
                <PostModal 
                    post={selectedPost} 
                    onClose={handleCloseModal}
                    currentUser={currentUser}
                    onPostUpdated={handlePostUpdated}
                    onPostDeleted={handlePostDeleted}
                />
            )}
        </>
    );
}
