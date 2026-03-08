"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { PostWithRelations, CommentWithRelations } from "@/types";
import { VoteButtons } from "./VoteButtons";
import { sanitizeInput, sanitizeUrl, decodeHtml } from "@/lib/utils/sanitize";
import { User } from "@supabase/supabase-js";
import Link from "next/link";
import Image from "next/image";
import { getUserTypeIcon } from "@/lib/utils/user";
import { getCategoryDetails } from "@/lib/utils/post";

interface PostModalProps {
    post: PostWithRelations;
    onClose: () => void;
    currentUser: User | null;
    onPostUpdated: (post: PostWithRelations) => void;
    onPostDeleted: (postId: string) => void;
}

export function PostModal({ post, onClose, currentUser, onPostUpdated, onPostDeleted }: PostModalProps) {
    const [comments, setComments] = useState<CommentWithRelations[]>([]);
    const [newComment, setNewComment] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const [editTitle, setEditTitle] = useState(post.title);
    const [editContent, setEditContent] = useState(post.content || "");
    const [editUrl, setEditUrl] = useState(post.url || "");
    const [editCategory, setEditCategory] = useState(post.category);
    const [editKeywords, setEditKeywords] = useState<string[]>(post.keywords || []);
    const [editKeywordInput, setEditKeywordInput] = useState("");

    const supabase = createClient();

    const isAuthor = currentUser && post.author_id === currentUser.id;

    const fetchComments = useCallback(async () => {
        const { data } = await supabase
            .from("comments")
            .select("*, author:profiles!inner(username, avatar_url, karma, display_name, linkedin_url, user_type, role)")
            .eq("post_id", post.id)
            .eq("is_deleted", false)
            .neq("author.role", "banned")
            .order("created_at", { ascending: true });

        if (data) setComments(data as CommentWithRelations[]);
    }, [post.id, supabase]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchComments();

        const channel = supabase
            .channel(`modal-comments:${post.id}`)
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "comments",
                    filter: `post_id=eq.${post.id}`,
                },
                async (payload) => {
                    const { data: authorData } = await supabase
                        .from("profiles")
                        .select("username, avatar_url, karma, display_name, linkedin_url, user_type, role")
                        .eq("id", payload.new.author_id)
                        .single();

                    if (!authorData || authorData.role === 'banned') return;

                    const newCommentWithAuthor = {
                        ...payload.new,
                        author: authorData,
                    } as unknown as CommentWithRelations;

                    setComments((prev) => [...prev, newCommentWithAuthor]);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [post.id, supabase, fetchComments]);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", handleEscape);
        document.body.style.overflow = "hidden";

        return () => {
            document.removeEventListener("keydown", handleEscape);
            document.body.style.overflow = "";
        };
    }, [onClose]);

    const handleSubmitComment = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setShowLoginPrompt(false);

        const trimmedContent = newComment.trim();
        if (!trimmedContent) return;

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            setShowLoginPrompt(true);
            return;
        }

        // Check if user is banned
        const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

        if (profile?.role === 'banned') {
            setError("Sua conta foi banida e você não pode postar comentários.");
            return;
        }

        const sanitizedContent = sanitizeInput(trimmedContent);

        setLoading(true);
        const { error: insertError } = await supabase.from("comments").insert({
            post_id: post.id,
            author_id: user.id,
            content: sanitizedContent,
        });

        if (insertError) {
            setError("Erro ao enviar comentário: " + insertError.message);
        } else {
            setNewComment("");
            await fetchComments();
        }
        setLoading(false);
    };

    const handleSaveEdit = async () => {
        setError(null);

        const trimmedTitle = editTitle.trim();
        if (!trimmedTitle) {
            setError("O título é obrigatório");
            return;
        }

        if (trimmedTitle.length > 200) {
            setError("O título deve ter no máximo 200 caracteres");
            return;
        }

        setLoading(true);

        const { error: updateError } = await supabase
            .from("posts")
            .update({
                title: sanitizeInput(trimmedTitle),
                content: editContent.trim() ? sanitizeInput(editContent.trim()) : null,
                url: editUrl.trim() ? sanitizeUrl(editUrl.trim()) : null,
                category: editCategory,
                keywords: editKeywords.length > 0 ? editKeywords : null,
                updated_at: new Date().toISOString(),
            })
            .eq("id", post.id);

        if (updateError) {
            setError("Erro ao atualizar post: " + updateError.message);
            setLoading(false);
            return;
        }

        const updatedPost: PostWithRelations = {
            ...post,
            title: trimmedTitle,
            content: editContent.trim() || null,
            url: editUrl.trim() || null,
            category: editCategory,
            keywords: editKeywords.length > 0 ? editKeywords : null,
        };

        onPostUpdated(updatedPost);
        setIsEditing(false);
        setLoading(false);
    };

    const handleDelete = async () => {
        setLoading(true);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: deleteError } = await (supabase.rpc as any)("delete_post", { post_id: post.id });

        if (deleteError) {
            // Check if post was actually deleted despite error
            const { data: checkPost } = await supabase
                .from("posts")
                .select("is_deleted")
                .eq("id", post.id)
                .single();

            if (checkPost?.is_deleted) {
                onPostDeleted(post.id);
                setLoading(false);
                return;
            }

            setError("Erro ao excluir post: " + deleteError.message);
            setLoading(false);
            return;
        }

        onPostDeleted(post.id);
    };

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget && !isEditing) onClose();
    };

    const getBadge = (karma: number) => {
        if (karma >= 1000) return { emoji: "👑", label: "Master" };
        if (karma >= 500) return { emoji: "💎", label: "Especialista" };
        if (karma >= 100) return { emoji: "🌟", label: "Contribuidor" };
        if (karma >= 50) return { emoji: "🌿", label: "Aprendiz" };
        if (karma >= 10) return { emoji: "🌱", label: "Iniciante" };
        return { emoji: "🥚", label: "Novato" };
    };

    const authorBadge = getBadge(post.author?.karma || 0);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={handleBackdropClick}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
        >
            <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col">
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <Link href={`/u/${post.author?.username}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 p-[2px] shadow-lg flex-shrink-0">
                                <div className="w-full h-full rounded-[0.9rem] bg-white dark:bg-gray-900 flex items-center justify-center text-2xl overflow-hidden relative">
                                    {post.author?.avatar_url ? (
                                        <Image src={post.author.avatar_url} alt="" fill className="object-cover" />
                                    ) : (
                                        getUserTypeIcon(post.author?.user_type)
                                    )}
                                </div>
                            </div>
                            <div>
                                <p className="font-bold text-gray-900 dark:text-white">
                                    @{post.author?.username}
                                </p>
                                <div className="flex items-center gap-1 text-sm">
                                    <span>{authorBadge.emoji}</span>
                                    <span className="text-yellow-600 font-semibold">{post.author?.karma || 0}</span>
                                    <span className="text-gray-400">•</span>
                                    <span className="text-gray-500">{authorBadge.label}</span>
                                </div>
                            </div>
                        </Link>
                        {post.author?.linkedin_url && (
                            <a
                                href={post.author.linkedin_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded"
                                aria-label="Perfil LinkedIn"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                </svg>
                            </a>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {isAuthor && !isEditing && (
                            <>
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    aria-label="Editar post"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                        <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => setShowDeleteConfirm(true)}
                                    className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-red-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                                    aria-label="Excluir post"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                        <polyline points="3 6 5 6 21 6" />
                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                    </svg>
                                </button>
                            </>
                        )}
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                            aria-label="Fechar modal"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm border border-red-100 dark:border-red-800">
                            {error}
                        </div>
                    )}

                    {isEditing ? (
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="edit-title" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Título</label>
                                <input
                                    id="edit-title"
                                    type="text"
                                    value={editTitle}
                                    onChange={(e) => setEditTitle(e.target.value)}
                                    maxLength={200}
                                    className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                />
                                <div className="text-right text-xs text-gray-400 mt-1">
                                    {editTitle.length}/200
                                </div>
                            </div>

                            <div>
                                <label htmlFor="edit-url" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">URL (opcional)</label>
                                <input
                                    id="edit-url"
                                    type="url"
                                    value={editUrl}
                                    onChange={(e) => setEditUrl(e.target.value)}
                                    placeholder="https://..."
                                    className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                />
                            </div>

                            <div>
                                <label htmlFor="edit-category" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Categoria</label>
                                <select
                                    id="edit-category"
                                    value={editCategory}
                                    onChange={(e) => setEditCategory(e.target.value)}
                                    className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                >
                                    <option value="news">Notícias</option>
                                    <option value="discussion">Discussão</option>
                                    <option value="question">Dúvida</option>
                                    <option value="help">Pedir Ajuda</option>
                                    <option value="link">Link</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                                    Palavras-chave
                                </label>
                                <div className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus-within:ring-2 focus-within:ring-blue-500 transition-all">
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {editKeywords.map((keyword, index) => (
                                            <span
                                                key={index}
                                                className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-lg"
                                            >
                                                {keyword}
                                                <button
                                                    type="button"
                                                    onClick={() => setEditKeywords(editKeywords.filter((_, i) => i !== index))}
                                                    className="hover:text-blue-900 dark:hover:text-blue-100"
                                                >
                                                    ×
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                    <input
                                        type="text"
                                        value={editKeywordInput}
                                        onChange={(e) => setEditKeywordInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                e.preventDefault();
                                                const trimmed = editKeywordInput.trim().toLowerCase();
                                                if (trimmed && !editKeywords.includes(trimmed)) {
                                                    setEditKeywords([...editKeywords, trimmed]);
                                                    setEditKeywordInput("");
                                                }
                                            }
                                        }}
                                        placeholder="Digite e pressione Enter para adicionar"
                                        className="w-full bg-transparent text-gray-900 dark:text-gray-100 outline-none text-sm"
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    Pressione Enter para separar as palavras-chave
                                </p>
                            </div>

                            <div>
                                <label htmlFor="edit-content" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Conteúdo</label>
                                <textarea
                                    id="edit-content"
                                    value={editContent}
                                    onChange={(e) => setEditContent(e.target.value)}
                                    maxLength={2000}
                                    className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none transition-all h-32 resize-none"
                                />
                                <div className="text-right text-xs text-gray-400 mt-1">
                                    {editContent.length}/2000
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => {
                                        setIsEditing(false);
                                        setEditTitle(post.title);
                                        setEditContent(post.content || "");
                                        setEditUrl(post.url || "");
                                        setEditCategory(post.category);
                                        setEditKeywords(post.keywords || []);
                                        setEditKeywordInput("");
                                        setError(null);
                                    }}
                                    className="flex-1 px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleSaveEdit}
                                    disabled={loading}
                                    className="flex-1 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                >
                                    {loading ? "Salvando..." : "Salvar"}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center gap-2 mb-3">
                                <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider ${getCategoryDetails(post.category).classes}`}>
                                    {getCategoryDetails(post.category).label}
                                </span>
                                <span className="text-xs text-gray-500">
                                    {post.created_at ? new Date(post.created_at).toLocaleDateString("pt-BR", {
                                        day: "numeric",
                                        month: "long",
                                        year: "numeric",
                                    }) : ''}
                                </span>
                            </div>

                            <h2 id="modal-title" className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                                {decodeHtml(post.title)}
                            </h2>

                            {post.content && (
                                <div className="prose prose-gray dark:prose-invert max-w-none mb-6">
                                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                                        {decodeHtml(post.content)}
                                    </p>
                                </div>
                            )}

                            {post.url && (
                                <a
                                    href={post.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-blue-600 hover:text-blue-700 dark:text-blue-400 transition-colors mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                                    aria-label={`Abrir link: ${new URL(post.url).hostname}`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                                    </svg>
                                    {new URL(post.url).hostname}
                                </a>
                            )}

                            {post.keywords && post.keywords.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-6">
                                    {post.keywords.map((keyword, index) => (
                                        <span
                                            key={index}
                                            className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs font-medium rounded-lg"
                                        >
                                            #{keyword}
                                        </span>
                                    ))}
                                </div>
                            )}

                            <div className="flex items-center gap-4 py-4 border-y border-gray-200 dark:border-gray-700 mb-6">
                                <VoteButtons
                                    targetId={post.id}
                                    targetType="post"
                                    initialKarma={post.karma ?? 0}
                                />
                            </div>

                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                                    Comentários ({comments.length})
                                </h3>

                                {showLoginPrompt && (
                                    <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 rounded-lg text-sm border border-yellow-100 dark:border-yellow-800">
                                        Você precisa estar logado para comentar.{' '}
                                        <Link href="/login" className="underline font-semibold text-[#1e40af] dark:text-blue-400">Faça login</Link>
                                    </div>
                                )}

                                <form onSubmit={handleSubmitComment} className="mb-6">
                                    <label htmlFor="new-comment" className="sr-only">Escrever comentário</label>
                                    <textarea
                                        id="new-comment"
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        placeholder="O que você acha disso?"
                                        maxLength={1000}
                                        aria-describedby="comment-counter"
                                        className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none h-24"
                                    />
                                    <div className="flex justify-between items-center mt-2">
                                        <span id="comment-counter" className="text-xs text-gray-400">
                                            {newComment.length}/1000
                                        </span>
                                        <button
                                            type="submit"
                                            disabled={loading || !newComment.trim()}
                                            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                        >
                                            {loading ? "Enviando..." : "Comentar"}
                                        </button>
                                    </div>
                                </form>

                                <div className="space-y-4">
                                    {comments.length === 0 ? (
                                        <p className="text-gray-500 text-center py-6">
                                            Nenhum comentário ainda. Seja o primeiro!
                                        </p>
                                    ) : (
                                        comments.map((comment) => {
                                            const commentBadge = getBadge(comment.author?.karma || 0);
                                            return (
                                                <div
                                                    key={comment.id}
                                                    className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700"
                                                >
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="flex items-center gap-2">
                                                            <Link href={`/u/${comment.author?.username}`} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                                                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 p-[1px] shadow-sm flex-shrink-0">
                                                                    <div className="w-full h-full rounded-[calc(0.5rem-1px)] bg-white dark:bg-gray-900 flex items-center justify-center text-sm overflow-hidden relative">
                                                                        {comment.author?.avatar_url ? (
                                                                            <Image src={comment.author.avatar_url} alt="" fill className="object-cover" />
                                                                        ) : (
                                                                            getUserTypeIcon(comment.author?.user_type)
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <span className="font-bold text-gray-900 dark:text-gray-100 text-sm">
                                                                    @{comment.author?.username}
                                                                </span>
                                                                <span className="text-xs">{commentBadge.emoji}</span>
                                                                <span className="text-xs text-yellow-600 font-semibold">
                                                                    {comment.author?.karma || 0}
                                                                </span>
                                                            </Link>
                                                            {comment.author?.linkedin_url && (
                                                                <a
                                                                    href={comment.author.linkedin_url}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-blue-600 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded"
                                                                    aria-label="Perfil LinkedIn"
                                                                >
                                                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                                                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                                                    </svg>
                                                                </a>
                                                            )}
                                                        </div>
                                                        <span className="text-xs text-gray-500">
                                                            {comment.created_at ? new Date(comment.created_at).toLocaleDateString("pt-BR", {
                                                                day: "numeric",
                                                                month: "short",
                                                            }) : ''}
                                                        </span>
                                                    </div>
                                                    <p className="text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap">
                                                        {comment.content}
                                                    </p>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {showDeleteConfirm && (
                    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60">
                        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
                                Confirmar exclusão
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                Tem certeza que deseja excluir este post? Esta ação não pode ser desfeita.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={loading}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                                >
                                    {loading ? "Excluindo..." : "Excluir"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
