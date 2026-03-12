'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

interface InviteSectionProps {
    referralCode: string;
}

export function InviteSection({ referralCode }: InviteSectionProps) {
    const t = useTranslations('Dashboard');
    const [copied, setCopied] = useState(false);
    const referralLink = `${window.location.origin}/register?ref=${referralCode}`;

    const copyToClipboard = () => {
        navigator.clipboard.writeText(referralLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 p-6 rounded-2xl border border-blue-100 dark:border-blue-800/50">
            <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">🎁</span>
                <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {t('inviteTitle') || 'Convide Amigos'}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        {t('inviteDescription') || 'Ganhe 50 pontos de Karma por cada amigo que completar o perfil! Seus amigos também ganham 50 pontos.'}
                    </p>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 bg-white dark:bg-gray-800 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 font-mono text-sm text-gray-600 dark:text-gray-300 overflow-hidden text-ellipsis whitespace-nowrap">
                    {referralLink}
                </div>
                <button
                    onClick={copyToClipboard}
                    className={`px-6 py-3 rounded-xl font-bold text-sm transition-all active:scale-95 ${
                        copied
                        ? 'bg-green-600 text-white'
                        : 'bg-[#1e40af] text-white hover:bg-blue-700 shadow-lg shadow-blue-500/25'
                    }`}
                >
                    {copied ? (t('copied') || 'Copiado!') : (t('copyLink') || 'Copiar Link')}
                </button>
            </div>

            <p className="mt-3 text-[10px] text-gray-500 dark:text-gray-500 uppercase tracking-widest font-bold">
                {t('inviteLimit') || 'Limite de 20 indicações premiadas'}
            </p>
        </div>
    );
}
