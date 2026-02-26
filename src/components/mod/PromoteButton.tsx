"use client";

import { useState } from "react";
import { promoteToModerator } from "@/lib/mod-actions";

interface PromoteButtonProps {
  userId: string;
  username: string;
  currentRole: string;
}

export function PromoteButton({ userId, username, currentRole }: PromoteButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handlePromote = async () => {
    setLoading(true);
    setError(null);

    const result = await promoteToModerator(userId);

    if (!result.success) {
      setError(result.error || "Erro desconhecido");
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  if (currentRole === "admin" || currentRole === "moderator") {
    return null;
  }

  if (success) {
    return (
      <span className="text-xs text-green-600 font-medium flex items-center gap-1">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        Promovido
      </span>
    );
  }

  return (
    <>
      <button
        onClick={handlePromote}
        disabled={loading}
        className="px-2 py-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-colors"
      >
        {loading ? "..." : "Promover"}
      </button>

      {error && (
        <span className="text-xs text-red-500">{error}</span>
      )}
    </>
  );
}
