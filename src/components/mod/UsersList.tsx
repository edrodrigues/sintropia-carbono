"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Profile } from "@/types";
import { getUserTypeIcon } from "@/lib/utils/user";
import { PromoteButton } from "./PromoteButton";
import { WarnUserButton } from "./WarnUserButton";
import { BanUserButton } from "./BanUserButton";

const USERS_PER_PAGE = 10;

export function UsersList() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const supabaseRef = useRef(createClient());

  const totalPages = Math.ceil(totalCount / USERS_PER_PAGE);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      const from = (page - 1) * USERS_PER_PAGE;
      const to = from + USERS_PER_PAGE - 1;

      const { data, count } = await supabaseRef.current
        .from("profiles")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(from, to);

      if (cancelled) return;
      if (data) {
        setUsers(data);
        setTotalCount(count || 0);
      }
      setLoading(false);
    }

    load();
    return () => { cancelled = true; };
  }, [page]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return (
          <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-bold rounded">
            Admin
          </span>
        );
      case "moderator":
        return (
          <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-bold rounded">
            Mod
          </span>
        );
      case "banned":
        return (
          <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs font-bold rounded">
            Banido
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-bold rounded">
            User
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-3" />
        <p className="text-gray-500">Carregando...</p>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="text-4xl mb-3 opacity-30">👥</div>
        <p className="text-gray-500 dark:text-gray-400">
          Nenhum usuário encontrado
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {users.map((user) => (
          <div key={user.id} className="p-4 flex items-center justify-between">
            <Link href={`/u/${user.username}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity flex-1 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 p-[1.5px] shadow-sm flex-shrink-0">
                <div className="w-full h-full rounded-[0.55rem] bg-white dark:bg-gray-900 flex items-center justify-center text-xl overflow-hidden relative">
                  {user.avatar_url ? (
                    <Image
                      src={user.avatar_url}
                      alt={user.username}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    getUserTypeIcon(user.user_type)
                  )}
                </div>
              </div>
              <div className="min-w-0">
                <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                  @{user.username}
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-gray-400">
                    {user.karma} karma
                  </span>
                  {getRoleBadge(user.role || "user")}
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  Inscrito em {formatDate(user.created_at)}
                </p>
              </div>
            </Link>
            <div className="flex items-center gap-2 flex-shrink-0 ml-2">
              <PromoteButton
                userId={user.id}
                username={user.username}
                currentRole={user.role || "user"}
              />
              {user.role !== "banned" && user.role !== "admin" && (
                <>
                  <WarnUserButton userId={user.id} username={user.username} />
                  <BanUserButton userId={user.id} username={user.username} />
                </>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {totalPages > 1 && (
        <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Página {page} de {totalPages} • {totalCount} usuários
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
            >
              Anterior
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
            >
              Próxima
            </button>
          </div>
        </div>
      )}
    </div>
  );
}