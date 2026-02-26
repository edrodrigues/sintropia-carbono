"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { PromoteButton } from "./PromoteButton";
import { WarnUserButton } from "./WarnUserButton";
import { BanUserButton } from "./BanUserButton";
import { DeletePostButton } from "./DeletePostButton";

interface User {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  role: string | null;
  karma: number;
  user_type: string | null;
  created_at: string;
}

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

export function ModSearch() {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"users" | "posts">("users");
  const supabase = createClient();

  const search = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setUsers([]);
      setPosts([]);
      return;
    }

    setLoading(true);
    const searchTerm = `%${searchQuery.toLowerCase()}%`;

    // Search users
    const { data: usersData } = await supabase
      .from("profiles")
      .select("*")
      .or(`username.ilike.${searchTerm},display_name.ilike.${searchTerm}`)
      .order("created_at", { ascending: false })
      .limit(20);

    // Search posts
    const { data: postsData } = await supabase
      .from("posts")
      .select(`
        *,
        author:profiles(username, avatar_url)
      `)
      .eq("is_deleted", false)
      .or(`title.ilike.${searchTerm},content.ilike.${searchTerm},keywords.cs.${searchQuery.toLowerCase()}`)
      .order("created_at", { ascending: false })
      .limit(20);

    if (usersData) setUsers(usersData);
    if (postsData) setPosts(postsData);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      search(query);
    }, 300);

    return () => clearTimeout(debounce);
  }, [query, search]);

  const getRoleBadge = (role: string | null) => {
    switch (role) {
      case "admin":
        return <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-bold rounded">Admin</span>;
      case "moderator":
        return <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded">Mod</span>;
      case "banned":
        return <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded">Banido</span>;
      default:
        return <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-bold rounded">User</span>;
    }
  };

  const getUserTypeIcon = (type: string | null): string => {
    switch (type) {
      case 'company': return '🏢';
      case 'ong': return '🤝';
      case 'government': return '🏛️';
      case 'professor': return '🧑‍🏫';
      default: return '👤';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Buscar usuários (nome, username) ou posts (título, conteúdo, tags)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-forest-green focus:border-transparent"
          />
        </div>

        {query.trim() && (
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => setActiveTab("users")}
              className={`px-3 py-1.5 text-sm font-bold rounded-lg transition-colors ${
                activeTab === "users"
                  ? "bg-forest-green text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200"
              }`}
            >
              Usuários ({users.length})
            </button>
            <button
              onClick={() => setActiveTab("posts")}
              className={`px-3 py-1.5 text-sm font-bold rounded-lg transition-colors ${
                activeTab === "posts"
                  ? "bg-forest-green text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200"
              }`}
            >
              Posts ({posts.length})
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="p-8 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-gray-500">Buscando...</p>
        </div>
      ) : query.trim() && activeTab === "users" ? (
        users.length > 0 ? (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {users.map((user) => (
              <div key={user.id} className="p-4 flex items-center justify-between">
                <Link href={`/u/${user.username}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 p-[1.5px] shadow-sm flex-shrink-0">
                    <div className="w-full h-full rounded-[0.55rem] bg-white dark:bg-gray-900 flex items-center justify-center text-xl overflow-hidden relative">
                      {user.avatar_url ? (
                        <Image src={user.avatar_url} alt={user.username} fill className="object-cover" />
                      ) : (
                        getUserTypeIcon(user.user_type)
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">@{user.username}</p>
                    <p className="text-xs text-gray-400">{user.karma} karma • {getRoleBadge(user.role)}</p>
                  </div>
                </Link>
                <div className="flex items-center gap-2">
                  <PromoteButton userId={user.id} username={user.username} currentRole={user.role || "user"} />
                  {user.role !== "banned" && user.role !== "admin" && (
                    <WarnUserButton userId={user.id} username={user.username} />
                  )}
                  {user.role !== "banned" && user.role !== "admin" && (
                    <BanUserButton userId={user.id} username={user.username} />
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">Nenhum usuário encontrado</p>
          </div>
        )
      ) : query.trim() && activeTab === "posts" ? (
        posts.length > 0 ? (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {posts.map((post) => (
              <div key={post.id} className="p-4 flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <Link href={`/feed/${post.id}`} className="font-medium text-gray-900 dark:text-gray-100 hover:text-blue-600 line-clamp-1">
                    {post.title}
                  </Link>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                    <span className="px-2 py-0.5 bg-gray-100 rounded">{post.category}</span>
                    <span>por @{post.author?.username || "desconhecido"}</span>
                    <span>{post.karma} karma</span>
                    <span>{new Date(post.created_at).toLocaleDateString("pt-BR")}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Link href={`/feed/${post.id}`} className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-lg">
                    Ver
                  </Link>
                  <DeletePostButton postId={post.id} postTitle={post.title} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">Nenhum post encontrado</p>
          </div>
        )
      ) : query.trim() ? (
        <div className="p-8 text-center">
          <p className="text-gray-500 dark:text-gray-400">Digite para buscar...</p>
        </div>
      ) : null}
    </div>
  );
}
