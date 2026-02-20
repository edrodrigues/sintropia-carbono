"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { TopicTags, commonTopicTags } from "@/components/posts/TopicTags";
import { decodeHtml } from "@/lib/utils/sanitize";
import type { PostWithRelations } from "@/types";

interface FeedPostCardProps {
  post: PostWithRelations;
  onOpenModal?: (post: PostWithRelations) => void;
  isAlternateBg?: boolean;
}

const getBadge = (karma: number) => {
  if (karma >= 1000) return { emoji: "👑", label: "Master" };
  if (karma >= 500) return { emoji: "💎", label: "Especialista" };
  if (karma >= 100) return { emoji: "🌟", label: "Contribuidor" };
  if (karma >= 50) return { emoji: "🌿", label: "Aprendiz" };
  if (karma >= 10) return { emoji: "🌱", label: "Iniciante" };
  return null;
};

export function FeedPostCard({ post, onOpenModal, isAlternateBg = false }: FeedPostCardProps) {
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
    try {
      if (navigator.share) {
        await navigator.share({
          title: post.title,
          text: post.content?.slice(0, 100) || post.title,
          url: postUrl,
        });
      } else {
        await navigator.clipboard.writeText(postUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      try {
        await navigator.clipboard.writeText(postUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch { /* silently fail */ }
    }
  };

  const authorBadge = post.author?.karma ? getBadge(post.author.karma) : null;
  const topicTags = [
    commonTopicTags.find(t => post.category.toLowerCase().includes(t.label.toLowerCase())) || { label: post.category, color: "gray" as const }
  ].filter(Boolean) as { label: string; color: "gray" | "blue" | "green" | "yellow" | "red" | "purple" }[];

  return (
    <div 
      className={`${isAlternateBg ? "bg-gray-50 dark:bg-gray-800/50" : "bg-white dark:bg-gray-900"} border-b border-gray-200 dark:border-gray-700 cursor-pointer`}
      onClick={handleCardClick}
    >
      <div className="flex max-w-5xl mx-auto">
        <div className="w-16 flex-shrink-0 flex flex-col items-center pt-4 pb-4">
          <div className={`w-12 h-12 rounded-lg flex flex-col items-center justify-center ${
            post.karma > 0 ? "bg-green-100 dark:bg-green-900/30" : "bg-gray-100 dark:bg-gray-800"
          }`}>
            <span className={`text-lg font-bold ${post.karma > 0 ? "text-green-600 dark:text-green-400" : "text-gray-500 dark:text-gray-400"}`}>
              {post.karma}
            </span>
          </div>
        </div>
        
        <div className="flex-1 p-4 pb-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2 leading-tight">
            {decodeHtml(post.title)}
          </h3>
          
          {post.url && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
              🔗 {new URL(post.url).hostname}
            </p>
          )}
          
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 overflow-hidden">
              {post.author?.avatar_url ? (
                <Image src={post.author.avatar_url} alt="" fill className="object-cover rounded-full" unoptimized />
              ) : (
                (post.author?.username?.[0] || "?").toUpperCase()
              )}
            </div>
            <Link 
              href={`/u/${post.author?.username}`}
              className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600"
              onClick={(e) => e.stopPropagation()}
            >
              @{post.author?.username}
            </Link>
            {authorBadge && (
              <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-600 dark:text-gray-400">
                {authorBadge.emoji} {authorBadge.label}
              </span>
            )}
            <span className="text-xs text-gray-500 dark:text-gray-400">
              • {new Date(post.created_at).toLocaleDateString("pt-BR")}
            </span>
          </div>
          
          {post.content && (
            <p className="text-gray-700 dark:text-gray-300 mb-3 whitespace-pre-wrap line-clamp-2">
              {decodeHtml(post.content)}
            </p>
          )}
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => onOpenModal?.(post)}
                className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                {post.comment_count}
              </button>
              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-green-600 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                {copied ? "Copiado!" : "Compartilhar"}
              </button>
            </div>
            
            <TopicTags tags={topicTags} maxVisible={2} />
          </div>
        </div>
      </div>
    </div>
  );
}
