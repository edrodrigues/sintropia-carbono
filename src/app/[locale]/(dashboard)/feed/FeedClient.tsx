"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { FeedPostCard } from "@/components/posts/FeedPostCard";
import { CreatePostButton } from "@/components/posts/CreatePostButton";
import { PostModal } from "@/components/posts/PostModal";
import { PostWithRelations } from "@/types";
import { User } from "@supabase/supabase-js";
import { useTranslations } from "next-intl";

type SortOption = "top" | "new" | "best";

export default function FeedClient({ initialPosts }: { initialPosts: PostWithRelations[] }) {
    const t = useTranslations('Community.feed');
    const [posts, setPosts] = useState(initialPosts);
    const [selectedPost, setSelectedPost] = useState<PostWithRelations | null>(null);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [sortBy, setSortBy] = useState<SortOption>("new");
    const searchParams = useSearchParams();
    const shouldOpenCreateModal = searchParams.get("create") === "true";
    const postIdParam = searchParams.get("post");
    const supabase = createClient();

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setCurrentUser(user);
        };
        getUser();
    }, [supabase]);

    // Use URL param to determine which post to show in modal if not manually selected
    const activePost = selectedPost || (postIdParam ? posts.find(p => p.id === postIdParam) : null);

    const handleOpenModal = (post: PostWithRelations) => {
        setSelectedPost(post);
    };

    const handleCloseModal = () => {
        setSelectedPost(null);
        // If we were viewing a post from the URL, we might want to clear it, 
        // but for now we'll just clear the local state.
    };

    const refreshPosts = useCallback(async () => {
        let query = supabase
            .from("posts")
            .select(`*, author:profiles!inner(username, avatar_url, karma, linkedin_url, user_type, role)`)
            .eq("is_deleted", false)
            .neq("author.role", "banned");

        switch (sortBy) {
            case "top":
                query = query.order("comment_count", { ascending: false });
                break;
            case "new":
                query = query.order("created_at", { ascending: false });
                break;
            case "best":
                query = query.order("karma", { ascending: false });
                break;
        }

        const { data } = await query.limit(20);

        if (data) setPosts(data as PostWithRelations[]);
    }, [sortBy, supabase]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
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
        { value: "top", label: t('sortTop') },
        { value: "new", label: t('sortNew') },
        { value: "best", label: t('sortBest') },
    ];

    return (
        <>
            <div className="container mx-auto max-w-5xl px-4">
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                            {t('todayFeed')}
                        </h1>
                        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                            {sortOptions.map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => setSortBy(option.value)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${sortBy === option.value
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
                        {t('shareInsight')}
                    </p>
                </div>

                <div className="space-y-6">
                    <CreatePostButton onPostCreated={refreshPosts} initialOpen={shouldOpenCreateModal} />

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
                                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">{t('noPosts')}</h3>
                                <p className="text-gray-500">{t('beFirst')}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {activePost && (
                <PostModal
                    post={activePost}
                    onClose={handleCloseModal}
                    currentUser={currentUser}
                    onPostUpdated={handlePostUpdated}
                    onPostDeleted={handlePostDeleted}
                />
            )}
        </>
    );
}
