'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Link } from "@/i18n/routing";
import { createClient } from '@/lib/supabase/client';
import { PasswordRequirements } from './PasswordRequirements';

interface RegisterFormProps {
    error?: string;
}

export function RegisterForm({ error: initialError }: RegisterFormProps) {
    const router = useRouter();
    const supabase = createClient();
    const t = useTranslations('Auth');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(initialError);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(undefined);

        const { error: signupError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    user_type: 'individual',
                },
            },
        });

        if (signupError) {
            setError(signupError.message);
            setLoading(false);
            return;
        }

        router.push(`/login?message=${encodeURIComponent(t('signUpSuccessMessage'))}`);
    };

    const handleGoogleSignUp = async () => {
        setLoading(true);
        setError(undefined);

        await supabase.auth.signOut();

        const { error: googleError } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback?onboarding=true`,
            },
        });

        if (googleError) {
            setError(googleError.message);
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-xl text-xs text-center font-bold border border-red-100 dark:border-red-800">
                    ⚠️ {error}
                </div>
            )}

            <div className="space-y-4">
                <button
                    type="button"
                    onClick={handleGoogleSignUp}
                    disabled={loading}
                    className="group relative w-full flex justify-center items-center gap-3 py-3.5 px-4 border border-gray-300 dark:border-gray-700 text-sm font-bold rounded-xl text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#1e40af] focus:ring-offset-2"
                >
                    {loading ? (
                        <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                    ) : (
                        <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07 7.07l3.66-2.84C14.83 3.91 18 3 12 3z"/>
                        </svg>
                    )}
                    {loading ? t('wait') : t('continueWithGoogle')}
                </button>

                <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                    </div>
                    <div className="relative flex justify-center text-[10px] uppercase">
                        <span className="bg-white dark:bg-gray-900 px-3 text-gray-500 font-bold tracking-widest">{t('orWithEmail')}</span>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="email" className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 ml-1">
                        {t('emailLabel')}
                    </label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-gray-300 dark:border-gray-700 placeholder-gray-400 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1e40af] focus:border-transparent sm:text-sm dark:bg-gray-800 transition-all"
                        placeholder="seu@email.com"
                    />
                </div>

                <div>
                    <label htmlFor="password" className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 ml-1">
                        {t('passwordLabel')}
                    </label>
                    <div className="relative">
                        <input
                            id="password"
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            autoComplete="new-password"
                            required
                            minLength={8}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-gray-300 dark:border-gray-700 placeholder-gray-400 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1e40af] focus:border-transparent sm:text-sm dark:bg-gray-800 transition-all pr-12"
                            placeholder="••••••••"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        >
                            {showPassword ? (
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            )}
                        </button>
                    </div>
                    {password.length > 0 && <PasswordRequirements password={password} />}
                </div>

                <button
                    type="submit"
                    disabled={loading || password.length < 8}
                    className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-[#1e40af] hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all shadow-lg shadow-blue-500/25 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
                >
                    {loading ? t('creatingAccount') : t('createAccountFree')}
                </button>

                <p className="text-xs text-center text-green-600 dark:text-green-400 font-medium">
                    {t('noCreditCard')}
                </p>
            </form>

            <div className="text-center pt-4 border-t border-gray-50 dark:border-gray-800">
                <p className="text-xs text-gray-500 font-medium">
                    {t('alreadyHaveAccount')}{' '}
                    <Link href="/login" className="text-[#1e40af] dark:text-blue-400 hover:underline font-bold transition-all">
                        {t('loginNow')}
                    </Link>
                </p>
            </div>
        </div>
    );
}
