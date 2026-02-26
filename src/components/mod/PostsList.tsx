"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { DeletePostButton } from "@/components/mod/DeletePostButton";

interface Post {
  id: string;
  title: string;
  content: string;
  url: string | null;
  category: string;
  karma: number;
  comment_count: number;
  is_locked: boolean;
  is_deleted: boolean;
  created_at: string;
  author: {
    username: string;
    avatar_url: string | null;
  } | null;
}

interface PostsListProps {
  posts: Post[];
}

export function PostsList({ posts: initialPosts }: PostsListProps) {
  const [posts, setPosts] = useState(initialPosts);

  const handleDeleted = (postId: string) => {
    setPosts(posts.filter(p => p.id !== postId));
  };

  if (posts.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="text-4xl mb-3 opacity-30">📝</div>
        <p className="text-gray-500 dark:text-gray-400">
          Nenhum post encontrado
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      {posts.map((post) => (
        <div key={post.id} className="p-4 flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <Link href={`/feed/${post.id}`} className="font-medium text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 line-clamp-1">
              {post.title}
            </Link>
            <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
              <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">
                {post.category}
              </span>
              <span>por @{post.author?.username || "desconhecido"}</span>
              <span>{post.karma} karma</span>
              <span>{post.comment_count} comentários</span>
              <span>{new Date(post.created_at).toLocaleDateString("pt-BR")}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 ml-4">
            <Link
              href={`/feed/${post.id}`}
              className="px-2 py-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs font-bold rounded-lg transition-colors"
            >
              Ver
            </Link>
            <DeletePostButton
              postId={post.id}
              postTitle={post.title}
              onDeleted={() => handleDeleted(post.id)}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
