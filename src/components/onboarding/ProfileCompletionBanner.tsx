'use client';

import { useState } from 'react';
import { Link } from '@/i18n/routing';

interface ProfileCompletionBannerProps {
    missingFields: ('username' | 'display_name')[];
}

export function ProfileCompletionBanner({ missingFields }: ProfileCompletionBannerProps) {
    const [dismissed, setDismissed] = useState(false);

    if (dismissed || missingFields.length === 0) return null;

    const fieldLabels: Record<string, string> = {
        username: 'nome de usuário',
        display_name: 'nome de exibição',
    };

    const missingLabels = missingFields.map(f => fieldLabels[f]).join(' e ');

    return (
        <div className="bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800">
            <div className="container mx-auto max-w-5xl px-4 py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center shrink-0">
                        <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <p className="text-sm text-amber-800 dark:text-amber-200">
                        Complete seu perfil — adicione seu <strong>{missingLabels}</strong> para desbloquear todos os recursos.
                    </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <Link
                        href="/profile/edit"
                        className="px-4 py-2 text-sm font-bold rounded-lg bg-amber-500 hover:bg-amber-600 text-white transition-colors"
                    >
                        Completar
                    </Link>
                    <button
                        onClick={() => setDismissed(true)}
                        className="p-1.5 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/40 text-amber-600 dark:text-amber-400 transition-colors"
                        aria-label="Dispensar"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}