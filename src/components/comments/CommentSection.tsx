"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { CommentWithRelations } from "@/types";
import { sanitizeInput } from "@/lib/utils/sanitize";

interface CommentSectionProps {
    postId: string;
}

export function CommentSection({ postId }: CommentSectionProps) {
    const [comments, setComments] = useState<CommentWithRelations[]>([]);
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);
    const supabase = createClient();

    useEffect(() => {
        const fetchComments = async () => {
            const { data } = await supabase
                .from("comments")
                .select("*, author:profiles(username, avatar_url, linkedin_url)")
                .eq("post_id", postId)
                .eq("is_deleted", false)
                .order("created_at", { ascending: true });

            if (data) setComments(data as CommentWithRelations[]);
        };

        fetchComments();

        // Subscribe to realtime updates
        const channel = supabase
            .channel(`comments:${postId}`)
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "comments",
                    filter: `post_id=eq.${postId}`,
                },
                async (payload) => {
                    // Fetch author info for the new comment
                    const { data: authorData } = await supabase
                        .from("profiles")
                        .select("username, avatar_url, linkedin_url")
                        .eq("id", payload.new.author_id)
                        .single();

                    const newComment = {
                        ...payload.new,
                        author: authorData,
                    } as CommentWithRelations;

                    setComments((prev) => [...prev, newComment]);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [postId, supabase]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setShowLoginPrompt(false);

        const trimmedContent = content.trim();
        if (!trimmedContent) {
            setError("O comentário não pode estar vazio");
            return;
        }

        if (trimmedContent.length > 1000) {
            setError("O comentário deve ter no máximo 1000 caracteres");
            return;
        }

        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
            setShowLoginPrompt(true);
            return;
        }

        // Sanitize input
        const sanitizedContent = sanitizeInput(trimmedContent);

        setLoading(true);
        const { error: insertError } = await supabase.from("comments").insert({
            post_id: postId,
            author_id: user.id,
            content: sanitizedContent,
        });

        if (insertError) {
            setError("Erro ao enviar comentário: " + insertError.message);
        } else {
            setContent("");
            setError(null);
        }
        setLoading(false);
    };

    return (
        <div className="mt-6 border-t border-gray-100 dark:border-gray-800 pt-6">
            <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                Comentários
            </h4>

            {showLoginPrompt && (
                <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 rounded-lg text-sm border border-yellow-100 dark:border-yellow-800">
                    Você precisa estar logado para comentar.{' '}
                    <a href="/login" className="underline font-semibold">Faça login</a>
                </div>
            )}

            {error && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm border border-red-100 dark:border-red-800">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="mb-6">
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="O que você acha disso?"
                    maxLength={1000}
                    className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none h-24"
                />
                <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-gray-400">
                        {content.length}/1000
                    </span>
                    <button
                        type="submit"
                        disabled={loading || !content.trim()}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors"
                    >
                        {loading ? "Enviando..." : "Comentar"}
                    </button>
                </div>
            </form>

            <div className="space-y-4">
                {comments.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">
                        Nenhum comentário ainda. Seja o primeiro!
                    </p>
                ) : (
                    comments.map((comment) => (
                        <div
                            key={comment.id}
                            className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800"
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <Link href={`/u/${comment.author?.username}`} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                                    <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-xs font-bold text-blue-600">
                                        {comment.author?.username?.[0].toUpperCase()}
                                    </div>
                                    <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                                        {comment.author?.username}
                                    </span>
                                </Link>
                                {comment.author?.linkedin_url && (
                                    <a
                                        href={comment.author.linkedin_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:text-blue-700"
                                        title="LinkedIn"
                                    >
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                                        </svg>
                                    </a>
                                )}
                                <span className="text-xs text-gray-500">
                                    • {new Date(comment.created_at).toLocaleDateString()}
                                </span>
                            </div>
                            <p className="text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap">
                                {comment.content}
                            </p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
