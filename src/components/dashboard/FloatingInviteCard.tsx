'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';

// SVG Icon Components
const CloseIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const GiftIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
    </svg>
);

const CheckIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
);

const CopyIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
);

interface FloatingInviteCardProps {
    referralCode: string;
    variant?: 'compact' | 'inline' | 'sidebar';
    onDismiss?: () => void;
    dismissible?: boolean;
}

export function FloatingInviteCard({ 
    referralCode, 
    variant = 'compact',
    onDismiss,
    dismissible = false 
}: FloatingInviteCardProps) {
    const t = useTranslations('Dashboard');
    const [copied, setCopied] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [isDismissed, setIsDismissed] = useState(false);

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

    const handleDismiss = () => {
        setIsDismissed(true);
        onDismiss?.();
    };

    const hasCode = !!referralCode;

    if (isDismissed) return null;

    // Compact variant - for sidebars, between content sections
    if (variant === 'compact') {
        return (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800/50 p-4 relative">
                {dismissible && (
                    <button 
                        onClick={handleDismiss}
                        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                        <CloseIcon className="w-4 h-4" />
                    </button>
                )}
                <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center shrink-0">
                        <GiftIcon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-900 dark:text-white text-sm">
                            {t('inviteTitle') || 'Convide Amigos'}
                        </h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                            Ganhe <span className="font-bold text-green-600 dark:text-green-400">+50 Karma</span> por indicação
                        </p>
                    </div>
                </div>
                
                {hasCode && (
                    <div className="mt-3 flex gap-2">
                        <div className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-xs font-mono text-gray-600 dark:text-gray-300 truncate">
                            {referralLink}
                        </div>
                        <button
                            onClick={copyToClipboard}
                            className={`px-3 py-2 rounded-lg transition-all ${
                                copied 
                                    ? 'bg-green-500 text-white' 
                                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                            }`}
                        >
                            {copied ? <CheckIcon className="w-4 h-4" /> : <CopyIcon className="w-4 h-4" />}
                        </button>
                    </div>
                )}
            </div>
        );
    }

    // Inline variant - for between content sections, full width
    if (variant === 'inline') {
        return (
            <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 dark:from-blue-900/10 dark:via-indigo-900/10 dark:to-blue-900/10 rounded-2xl border border-blue-200 dark:border-blue-800/50 p-6 relative">
                {dismissible && (
                    <button 
                        onClick={handleDismiss}
                        className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                        <CloseIcon className="w-5 h-5" />
                    </button>
                )}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <GiftIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 dark:text-white">
                                {t('inviteTitle') || 'Convide Amigos'}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Ganhe <span className="font-bold text-green-600 dark:text-green-400">50 pontos</span> por amigo que se juntar!
                            </p>
                        </div>
                    </div>
                    
                    {hasCode && (
                        <div className="flex-1 sm:max-w-md flex gap-2">
                            <div className="flex-1 px-4 py-2.5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-mono text-gray-600 dark:text-gray-300 truncate">
                                {referralLink}
                            </div>
                            <button
                                onClick={copyToClipboard}
                                className={`px-4 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 ${
                                    copied 
                                        ? 'bg-green-500 text-white' 
                                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25'
                                }`}
                            >
                                {copied ? (
                                    <><CheckIcon className="w-4 h-4" /> Copiado</>
                                ) : (
                                    <><CopyIcon className="w-4 h-4" /> Copiar</>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Sidebar variant - for right/left sidebars, very compact
    return (
        <div className="bg-gradient-to-b from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800/50 p-3 relative">
            {dismissible && (
                <button 
                    onClick={handleDismiss}
                    className="absolute top-1 right-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                    <CloseIcon className="w-3 h-3" />
                </button>
            )}
            <div className="text-center">
                <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center mx-auto mb-2">
                    <GiftIcon className="w-4 h-4 text-white" />
                </div>
                <h4 className="font-bold text-gray-900 dark:text-white text-xs">
                    Convide Amigos
                </h4>
                <p className="text-[10px] text-gray-600 dark:text-gray-400 mt-1">
                    +50 Karma
                </p>
            </div>
            
            {hasCode && (
                <div className="mt-2 flex gap-1">
                    <div className="flex-1 px-2 py-1.5 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 text-[10px] font-mono text-gray-600 dark:text-gray-300 truncate">
                        {referralCode}
                    </div>
                    <button
                        onClick={copyToClipboard}
                        className={`px-2 py-1.5 rounded transition-all ${
                            copied 
                                ? 'bg-green-500 text-white' 
                                : 'bg-blue-500 hover:bg-blue-600 text-white'
                        }`}
                    >
                        {copied ? <CheckIcon className="w-3 h-3" /> : <CopyIcon className="w-3 h-3" />}
                    </button>
                </div>
            )}
        </div>
    );
}

export default FloatingInviteCard;
