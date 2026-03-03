import { useTranslations } from 'next-intl';

interface PasswordRequirementsProps {
    password: string;
}

export function PasswordRequirements({ password }: PasswordRequirementsProps) {
    const t = useTranslations('PasswordRequirements');

    const requirements = [
        { key: 'length', label: t('length'), test: (p: string) => p.length >= 8 },
        { key: 'uppercase', label: t('uppercase'), test: (p: string) => /[A-Z]/.test(p) },
        { key: 'lowercase', label: t('lowercase'), test: (p: string) => /[a-z]/.test(p) },
        { key: 'number', label: t('number'), test: (p: string) => /\d/.test(p) },
        { key: 'special', label: t('special'), test: (p: string) => /[!@#$%^&*(),.?":{}|<>]/.test(p) },
    ];

    return (
        <div className="mt-2 space-y-1.5">
            {requirements.map((req) => {
                const isMet = req.test(password);
                return (
                    <div
                        key={req.key}
                        className={`flex items-center gap-2 text-xs transition-colors ${isMet
                                ? 'text-green-600 dark:text-green-400'
                                : 'text-gray-400 dark:text-gray-500'
                            }`}
                    >
                        <svg
                            className={`w-3.5 h-3.5 flex-shrink-0 ${isMet ? 'opacity-100' : 'opacity-40'}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            {isMet ? (
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            ) : (
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
                            )}
                        </svg>
                        {req.label}
                    </div>
                );
            })}
        </div>
    );
}
