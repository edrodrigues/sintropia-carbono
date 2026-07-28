"use client";

import { useEffect } from "react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard page error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md px-4">
        <div className="text-6xl mb-4">⚠️</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Algo deu errado</h1>
        <p className="text-gray-600 mb-6">
          Ocorreu um erro inesperado. Nossa equipe foi notificada.
        </p>
        <p className="text-sm text-gray-400 mb-6 font-mono bg-gray-100 rounded-lg p-3 break-all">
          {error.message}
        </p>
        <button
          onClick={reset}
          className="px-6 py-3 bg-deep-forest text-white font-bold rounded-lg hover:bg-emerald-900 transition-colors"
        >
          Tentar novamente
        </button>
      </div>
    </div>
  );
}
