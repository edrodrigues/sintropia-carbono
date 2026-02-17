"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { PostCard } from "@/components/posts/PostCard";
import { CreatePostButton } from "@/components/posts/CreatePostButton";
import { PostModal } from "@/components/posts/PostModal";
import { PostWithRelations } from "@/types";
import { User } from "@supabase/supabase-js";

export default function FeedClient({ initialPosts }: { initialPosts: PostWithRelations[] }) {
    const [posts, setPosts] = useState(initialPosts);
    const [selectedPost, setSelectedPost] = useState<PostWithRelations | null>(null);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
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

    const refreshPosts = async () => {
        const { data } = await supabase
            .from("posts")
            .select(`*, author:profiles(username, avatar_url, karma)`)
            .eq("is_deleted", false)
            .order("created_at", { ascending: false })
            .limit(20);

        if (data) setPosts(data as PostWithRelations[]);
    };

    const handlePostUpdated = (updatedPost: PostWithRelations) => {
        setPosts(prev => prev.map(p => p.id === updatedPost.id ? updatedPost : p));
        setSelectedPost(updatedPost);
    };

    const handlePostDeleted = (deletedPostId: string) => {
        setPosts(prev => prev.filter(p => p.id !== deletedPostId));
        setSelectedPost(null);
    };

    return (
        <>
            <div className="container mx-auto max-w-2xl px-4">
                <div className="mb-8">
                    <h1 className="text-4xl font-black text-gray-900 dark:text-gray-100 mb-2">
                        Comunidade
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Compartilhe insights e discuta as tendências do mercado de carbono.
                    </p>
                </div>

                <div className="space-y-6">
                    <CreatePostButton onPostCreated={refreshPosts} />

                    <div className="space-y-4">
                        {posts && posts.length > 0 ? (
                            posts.map((post) => (
                                <PostCard 
                                    key={post.id} 
                                    post={post} 
                                    onOpenModal={handleOpenModal}
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
