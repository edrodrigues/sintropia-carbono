"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface BanUserButtonProps {
  userId: string;
  username: string;
}

export function BanUserButton({ userId, username }: BanUserButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [duration, setDuration] = useState<"7days" | "permanent">("7days");
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleBan = async () => {
    if (!reason.trim()) return;

    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Você precisa estar logado.");
      setLoading(false);
      return;
    }

    const expiresAt = duration === "permanent" 
      ? null 
      : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    const { error: banError } = await supabase.from("bans").insert({
      user_id: userId,
      moderator_id: user.id,
      reason,
      expires_at: expiresAt,
    });

    if (banError) {
      alert("Erro ao banir usuário: " + banError.message);
      setLoading(false);
      return;
    }

    const { error: profileError } = await supabase
      .from("profiles")
      .update({ role: "banned" })
      .eq("id", userId);

    if (profileError) {
      alert("Erro ao atualizar perfil: " + profileError.message);
    } else {
      setIsOpen(false);
      setReason("");
    }

    setLoading(false);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors"
      >
        Banir Usuário
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Banir @{username}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Esta ação não pode ser desfeita facilmente.
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Duração do banimento
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setDuration("7days")}
                    className={`flex-1 p-3 rounded-xl border-2 transition-all ${
                      duration === "7days"
                        ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20"
                        : "border-transparent bg-gray-100 dark:bg-gray-900 hover:bg-gray-200 dark:hover:bg-gray-800"
                    }`}
                  >
                    <p className="font-bold text-gray-900 dark:text-gray-100">
                      7 Dias
                    </p>
                    <p className="text-xs text-gray-500">Temporário</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDuration("permanent")}
                    className={`flex-1 p-3 rounded-xl border-2 transition-all ${
                      duration === "permanent"
                        ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                        : "border-transparent bg-gray-100 dark:bg-gray-900 hover:bg-gray-200 dark:hover:bg-gray-800"
                    }`}
                  >
                    <p className="font-bold text-gray-900 dark:text-gray-100">
                      Permanente
                    </p>
                    <p className="text-xs text-gray-500">Indefinido</p>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Motivo do banimento
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Descreva o motivo..."
                  className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleBan}
                  disabled={loading || !reason.trim()}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                  {loading ? "Banindo..." : "Confirmar Ban"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
