"use client";

import Link from "next/link";

export default function ProfileError({
  error: _error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="container mx-auto max-w-5xl px-4 py-16 text-center">
      <div className="max-w-md mx-auto">
        <div className="text-6xl mb-4">⚠️</div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Erro ao carregar perfil
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Não foi possível carregar os dados do seu perfil. Tente novamente ou volte mais tarde.
        </p>
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={reset}
            className="px-6 py-3 bg-blue-600 hover:bg-charcoal-ink text-white font-bold rounded-xl transition-colors"
          >
            Tentar novamente
          </button>
          <Link
            href="/feed"
            className="px-6 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-xl transition-colors"
          >
            Voltar ao feed
          </Link>
        </div>
      </div>
    </main>
  );
}
