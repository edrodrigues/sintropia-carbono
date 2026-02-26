"use client";

import { useState } from "react";
import { warnUser } from "@/lib/mod-actions";

interface WarnUserButtonProps {
  userId: string;
  username: string;
}

export function WarnUserButton({ userId, username }: WarnUserButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleWarn = async () => {
    if (!reason.trim()) return;

    setLoading(true);
    setError(null);

    const result = await warnUser(userId, reason);

    if (!result.success) {
      setError(result.error || "Erro desconhecido");
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
    setTimeout(() => {
      setIsOpen(false);
      setSuccess(false);
      setReason("");
    }, 1500);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-2 py-1 bg-yellow-500 hover:bg-yellow-600 text-white text-xs font-bold rounded-lg transition-colors"
      >
        Advertir
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Advertir @{username}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Esta ação será registrada no histórico do usuário.
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Motivo da advertência
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Descreva o motivo..."
                  className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none"
                  rows={3}
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              {success && (
                <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <p className="text-sm text-green-600 dark:text-green-400">Advertência registrada com sucesso!</p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    setError(null);
                    setReason("");
                  }}
                  className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleWarn}
                  disabled={loading || !reason.trim()}
                  className="flex-1 px-4 py-2.5 bg-yellow-500 text-white font-bold rounded-xl hover:bg-yellow-600 disabled:opacity-50 transition-colors"
                >
                  {loading ? "Enviando..." : "Advertir"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
