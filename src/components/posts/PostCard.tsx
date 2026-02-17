"use client";

import { useState } from "react";
import { VoteButtons } from "@/components/posts/VoteButtons";
import { CommentSection } from "@/components/comments/CommentSection";
import { PostWithRelations } from "@/types";

interface PostCardProps {
    post: PostWithRelations;
}

export function PostCard({ post }: PostCardProps) {
    const [showComments, setShowComments] = useState(false);
    const [copied, setCopied] = useState(false);

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
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden transition-all hover:shadow-md">
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
                            Postado por <span className="font-semibold text-gray-700 dark:text-gray-300">@{post.author?.username}</span>
                            <span className="mx-1 text-yellow-500 font-bold">({post.author?.karma || 0})</span>
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
