"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { ChallengeWithRelations, CommentWithRelations } from "@/types";
import { sanitizeInput } from "@/lib/utils/sanitize";
import { getUserTypeIcon } from "@/lib/utils/user";
import Link from "next/link";
import { User } from "@supabase/supabase-js";

interface ChallengeDetailModalProps {
  challenge: ChallengeWithRelations;
  onClose: () => void;
  currentUser: User | null;
  onChallengeUpdated: (challenge: ChallengeWithRelations) => void;
}

export function ChallengeDetailModal({ challenge, onClose, currentUser, onChallengeUpdated }: ChallengeDetailModalProps) {
  const [comments, setComments] = useState<CommentWithRelations[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const supabase = createClient();

  const isAuthor = currentUser && challenge.author_id === currentUser.id;

  const fetchComments = useCallback(async () => {
    const { data } = await supabase
      .from("comments")
      .select("*, author:profiles!inner(username, avatar_url, karma, display_name, linkedin_url, user_type, role)")
      .eq("challenge_id", challenge.id)
      .eq("is_deleted", false)
      .neq("author.role", "banned")
      .order("created_at", { ascending: true });

    if (data) setComments(data as CommentWithRelations[]);
  }, [challenge.id, supabase]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchComments();

    const channel = supabase
      .channel(`challenge-comments:${challenge.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "comments",
          filter: `challenge_id=eq.${challenge.id}`,
        },
        async (payload) => {
          const { data: authorData } = await supabase
            .from("profiles")
            .select("username, avatar_url, karma, display_name, linkedin_url, user_type, role")
            .eq("id", payload.new.author_id)
            .single();

          if (!authorData || authorData.role === "banned") return;

          const newCommentData = {
            ...payload.new,
            author: authorData,
          } as unknown as CommentWithRelations;

          setComments(prev => [...prev, newCommentData]);
        },
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [challenge.id, supabase, fetchComments]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setShowLoginPrompt(false);

    const trimmed = newComment.trim();
    if (!trimmed) { setError("O comentário não pode estar vazio"); return; }
    if (trimmed.length > 1000) { setError("Máximo de 1000 caracteres"); return; }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setShowLoginPrompt(true); return; }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role === "banned") {
      setError("Sua conta foi banida.");
      return;
    }

    const sanitizedContent = sanitizeInput(trimmed);
    setLoading(true);
    const { error: insertError } = await supabase.from("comments").insert({
      challenge_id: challenge.id,
      author_id: user.id,
      content: sanitizedContent,
    });

    if (insertError) setError("Erro ao enviar: " + insertError.message);
    else { setNewComment(""); setError(null); }
    setLoading(false);
  };

  const handleMarkSolution = async (commentId: string) => {
    if (!isAuthor) return;

    const { error } = await supabase
      .from("challenges")
      .update({ solution_comment_id: commentId })
      .eq("id", challenge.id);

    if (!error) {
      onChallengeUpdated({ ...challenge, solution_comment_id: commentId });
    }
  };

  const handleRemoveSolution = async () => {
    if (!isAuthor) return;

    const { error } = await supabase
      .from("challenges")
      .update({ solution_comment_id: null })
      .eq("id", challenge.id);

    if (!error) {
      onChallengeUpdated({ ...challenge, solution_comment_id: null });
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-10 bg-black/60 backdrop-blur-sm overflow-y-auto"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white dark:bg-gray-800 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700 my-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 9v4" /><path d="M12 17h.01" />
              <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            </svg>
            <span className="text-white text-sm font-bold uppercase tracking-wider">Desafio ESG</span>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors" aria-label="Fechar">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18" /><path d="M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Author */}
          <div className="flex items-center gap-3">
            <Link href={`/u/${challenge.author?.username}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="size-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 p-[2px] shadow-sm flex-shrink-0">
                <div className="w-full h-full rounded-[0.35rem] bg-white dark:bg-gray-900 flex items-center justify-center text-xl overflow-hidden">
                  {challenge.author?.avatar_url
                    ? <img src={challenge.author.avatar_url} alt="" className="w-full h-full object-cover" />
                    : <span>{getUserTypeIcon(challenge.author?.user_type)}</span>
                  }
                </div>
              </div>
              <div>
                <span className="text-base font-bold text-gray-900 dark:text-gray-100 block">
                  {challenge.author?.display_name || challenge.author?.username}
                </span>
                {challenge.author?.company_tagline && (
                  <span className="text-sm text-gray-500 dark:text-gray-400">{challenge.author.company_tagline}</span>
                )}
                {challenge.sector && (
                  <span className="text-xs text-blue-500 font-medium">{challenge.sector}</span>
                )}
              </div>
            </Link>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{challenge.title}</h2>

          {/* Category */}
          <div>
            <span className="inline-flex items-center px-3 py-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-sm font-semibold rounded-xl">
              {challenge.category}
            </span>
          </div>

          {/* Context */}
          <div>
            <h4 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">O Problema (Contexto)</h4>
            <p className="text-gray-700 dark:text-gray-300 text-base leading-relaxed whitespace-pre-wrap">{challenge.context}</p>
          </div>

          {/* Expected Result */}
          <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <h4 className="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-1">Resultado Esperado</h4>
            <p className="text-blue-700 dark:text-blue-300 text-sm leading-relaxed whitespace-pre-wrap">{challenge.expected_result}</p>
          </div>

          {/* Reward */}
          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
            <h4 className="text-sm font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wide mb-1">Incentivo / Recompensa</h4>
            <p className="text-amber-700 dark:text-amber-300 text-sm leading-relaxed whitespace-pre-wrap">{challenge.reward}</p>
          </div>

          {/* Images */}
          {challenge.images && challenge.images.length > 0 && (
            <div>
              <h4 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Imagens</h4>
              <div className="grid grid-cols-3 gap-3">
                {challenge.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(selectedImage === img ? null : img)}
                    className="aspect-video rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 hover:ring-2 hover:ring-emerald-400 transition-all"
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
              {selectedImage && (
                <div
                  className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4"
                  onClick={() => setSelectedImage(null)}
                >
                  <img src={selectedImage} alt="" className="max-w-full max-h-full rounded-2xl" />
                </div>
              )}
            </div>
          )}

          {/* Divider */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
              Ideias e Sugestões ({comments.length})
            </h4>

            {showLoginPrompt && (
              <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 rounded-lg text-sm border border-yellow-100 dark:border-yellow-800">
                Você precisa estar logado para comentar.{" "}
                <Link href="/login" className="underline font-semibold text-[#1e40af] dark:text-blue-400">Faça login</Link>
              </div>
            )}

            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm border border-red-100 dark:border-red-800">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmitComment} className="mb-6">
              <textarea
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                placeholder="Compartilhe sua ideia ou sugestão para resolver este desafio..."
                maxLength={1000}
                className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 outline-none transition-all resize-none h-24"
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-gray-400">{newComment.length}/1000</span>
                <button
                  type="submit"
                  disabled={loading || !newComment.trim()}
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors"
                >
                  {loading ? "Enviando..." : "Enviar Ideia"}
                </button>
              </div>
            </form>

            <div className="space-y-4">
              {comments.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Nenhuma ideia ainda. Seja o primeiro a contribuir!</p>
              ) : (
                comments.map(comment => {
                  const isSolution = challenge.solution_comment_id === comment.id;
                  return (
                    <div
                      key={comment.id}
                      className={`p-4 rounded-xl border ${
                        isSolution
                          ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-700"
                          : "bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-800"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Link href={`/u/${comment.author?.username}`} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                          <div className="size-6 rounded-md bg-gradient-to-br from-blue-500 to-indigo-600 p-[1px] shadow-sm flex-shrink-0">
                            <div className="w-full h-full rounded-[0.3rem] bg-white dark:bg-gray-900 flex items-center justify-center text-[10px] overflow-hidden">
                              {getUserTypeIcon(comment.author?.user_type)}
                            </div>
                          </div>
                          <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{comment.author?.username}</span>
                        </Link>
                        <span className="text-xs text-gray-500">• {comment.created_at ? new Date(comment.created_at).toLocaleDateString("pt-BR") : ""}</span>
                        {isSolution && (
                          <span className="ml-auto flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Solução
                          </span>
                        )}
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap">{comment.content}</p>
                      {isAuthor && !isSolution && (
                        <button
                          onClick={() => handleMarkSolution(comment.id)}
                          className="mt-2 text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
                        >
                          Aceitar como solução
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {isAuthor && challenge.solution_comment_id && (
              <div className="mt-4 text-center">
                <button
                  onClick={handleRemoveSolution}
                  className="text-xs text-red-500 hover:underline font-semibold"
                >
                  Remover solução aceita
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
