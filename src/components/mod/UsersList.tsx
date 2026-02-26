"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Profile } from "@/types";
import { getUserTypeIcon } from "@/lib/utils/user";
import { PromoteButton } from "./PromoteButton";
import { WarnUserButton } from "./WarnUserButton";
import { BanUserButton } from "./BanUserButton";

export function UsersList() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchUsers = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);

      if (data) setUsers(data);
      setLoading(false);
    };

    fetchUsers();
  }, [supabase]);

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
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      {users.map((user) => (
        <div key={user.id} className="p-4 flex items-center justify-between">
          <Link href={`/u/${user.username}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
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
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                @{user.username}
              </p>
              <p className="text-xs text-gray-400">
                {user.karma} karma • {getRoleBadge(user.role || "user")}
              </p>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <PromoteButton
              userId={user.id}
              username={user.username}
              currentRole={user.role || "user"}
            />
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
  );
}
