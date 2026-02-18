"use client";

import { useState } from "react";
import { VoteButtons } from "@/components/posts/VoteButtons";
import { CommentSection } from "@/components/comments/CommentSection";
import { PostWithRelations } from "@/types";
import Link from "next/link";

interface PostCardProps {
    post: PostWithRelations;
    onOpenModal?: (post: PostWithRelations) => void;
}

export function PostCard({ post, onOpenModal }: PostCardProps) {
    const [showComments, setShowComments] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleCardClick = (e: React.MouseEvent) => {
        if (
            e.target instanceof HTMLAnchorElement ||
            e.target instanceof HTMLButtonElement ||
            (e.target as HTMLElement).closest("button") ||
            (e.target as HTMLElement).closest("a")
        ) {
            return;
        }
        onOpenModal?.(post);
    };

    const handleShare = async () => {
        const postUrl = `${window.location.origin}/feed#post-${post.id}`;
        const shareData = {
            title: post.title,
            text: post.content?.slice(0, 100) || post.title,
            url: postUrl,
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(postUrl);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            }
        } catch {
            // User cancelled share or clipboard failed
            try {
                await navigator.clipboard.writeText(postUrl);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            } catch { /* silently fail */ }
        }
    };

    return (
        <div 
            className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden transition-all hover:shadow-md cursor-pointer"
            onClick={handleCardClick}
        >
            <div className="flex p-4 gap-4">
                {/* Votos */}
                <div className="flex-shrink-0 pt-1">
                    <VoteButtons
                        targetId={post.id}
                        targetType="post"
                        initialKarma={post.karma}
                    />
                </div>

                {/* Conteúdo */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 uppercase tracking-wider">
                            {post.category}
                        </span>
                        <span className="text-xs text-gray-500">
                            Postado por <Link href={`/u/${post.author?.username}`} className="font-semibold text-gray-700 dark:text-gray-300 hover:text-blue-600">@{post.author?.username}</Link>
                            <span className="mx-1 text-yellow-500 font-bold">({post.author?.karma || 0})</span>
                        </span>
                        {post.author?.linkedin_url && (
                            <a
                                href={post.author.linkedin_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-700"
                                title="LinkedIn"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                                </svg>
                            </a>
                        )}
                        <span className="text-xs text-gray-500">
                            • {new Date(post.created_at).toLocaleDateString()}
                        </span>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 leading-tight">
                        {post.title}
                    </h3>

                    {post.content && (
                        <p className="text-gray-700 dark:text-gray-300 mb-3 whitespace-pre-wrap line-clamp-3">
                            {post.content}
                        </p>
                    )}

                    {post.url && (
                        <a
                            href={post.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline text-sm flex items-center gap-1 mb-3"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
                            {new URL(post.url).hostname}
                        </a>
                    )}

                    <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                        <button
                            onClick={() => setShowComments(!showComments)}
                            className="flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-blue-600 transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                            {post.comment_count} Comentários
                        </button>
                        <button
                            onClick={handleShare}
                            className="flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-green-600 transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" /></svg>
                            {copied ? 'Copiado!' : 'Compartilhar'}
                        </button>
                    </div>

                    {showComments && (
                        <CommentSection postId={post.id} />
                    )}
                </div>
            </div>
        </div>
    );
}
