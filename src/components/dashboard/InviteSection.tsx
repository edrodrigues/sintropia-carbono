'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';

interface InviteSectionProps {
    referralCode: string;
}

export function InviteSection({ referralCode }: InviteSectionProps) {
    const t = useTranslations('Dashboard');
    const [copied, setCopied] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);
    }, []);

    const referralLink = (mounted && referralCode) 
        ? `${window.location.origin}/register?ref=${referralCode}` 
        : '';

    const copyToClipboard = () => {
        if (!referralLink) return;
        navigator.clipboard.writeText(referralLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const hasCode = !!referralCode;

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
                <div className={`flex-1 px-4 py-3 rounded-xl border font-mono text-sm overflow-hidden text-ellipsis whitespace-nowrap ${
                    hasCode 
                    ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300' 
                    : 'bg-gray-100 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-400 italic'
                }`}>
                    {hasCode ? referralLink || '...' : (t('noReferralCode') || 'Código não disponível')}
                </div>
                <button
                    onClick={copyToClipboard}
                    disabled={!hasCode}
                    className={`px-6 py-3 rounded-xl font-bold text-sm transition-all active:scale-95 ${
                        !hasCode
                        ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                        : copied
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
