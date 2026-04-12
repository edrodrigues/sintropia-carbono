'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { updateProfile } from '@/app/[locale]/(dashboard)/profile/actions';
import { StepIndicator } from './StepIndicator';

interface OnboardingFormProps {
    profile: {
        id?: string;
        username?: string | null;
        display_name?: string | null;
        bio?: string | null;
        user_type?: string | null;
        organization?: string | null;
        cargo?: string | null;
        linkedin_url?: string | null;
        twitter_url?: string | null;
    } | null;
    isNewUser: boolean;
}

const USER_TYPES = [
    { value: 'individual', icon: '👤' },
    { value: 'company', icon: '🏢' },
    { value: 'ong', icon: '🤝' },
    { value: 'government', icon: '🏛️' },
    { value: 'professor', icon: '🧑‍🏫' },
] as const;

export function OnboardingForm({ profile, isNewUser }: OnboardingFormProps) {
    const router = useRouter();
    const t = useTranslations('Onboarding');
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const [step1Data, setStep1Data] = useState({
        username: profile?.username || '',
        display_name: profile?.display_name || '',
        user_type: profile?.user_type || 'individual',
    });

    const [step2Data, setStep2Data] = useState({
        bio: profile?.bio || '',
        organization: profile?.organization || '',
        cargo: profile?.cargo || '',
        linkedin_url: profile?.linkedin_url || '',
        twitter_url: profile?.twitter_url || '',
    });

    const stepLabels = [t('step1Label'), t('step2Label'), t('step3Label')];

    const isStep1Valid = step1Data.username.length >= 3 && step1Data.display_name.trim().length > 0;

    async function handleStep1Submit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!isStep1Valid) return;
        setLoading(true);
        setMessage(null);

        const form = new FormData();
        form.set('username', step1Data.username);
        form.set('display_name', step1Data.display_name);
        form.set('user_type', step1Data.user_type);
        form.set('bio', step2Data.bio);
        form.set('organization', step2Data.organization);
        form.set('cargo', step2Data.cargo);
        form.set('linkedin_url', step2Data.linkedin_url);
        form.set('twitter_url', step2Data.twitter_url);

        const result = await updateProfile(form);
        setLoading(false);

        if (result.error) {
            setMessage({ type: 'error', text: result.error });
        } else {
            setStep(2);
        }
    }

    async function handleStep2Submit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        const form = new FormData();
        form.set('username', step1Data.username);
        form.set('display_name', step1Data.display_name);
        form.set('user_type', step1Data.user_type);
        form.set('bio', step2Data.bio);
        form.set('organization', step2Data.organization);
        form.set('cargo', step2Data.cargo);
        form.set('linkedin_url', step2Data.linkedin_url);
        form.set('twitter_url', step2Data.twitter_url);

        const result = await updateProfile(form);
        setLoading(false);

        if (result.error) {
            setMessage({ type: 'error', text: result.error });
        } else {
            setStep(3);
        }
    }

    function handleCompleteLater() {
        router.push('/dashboard');
    }

    if (step === 3) {
        return (
            <div className="space-y-6">
                <StepIndicator currentStep={3} labels={stepLabels} />
                <div className="text-center py-8">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/30">
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        {t('step3Title')}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-2">
                        {t('step3Subtitle')}
                    </p>
                    <p className="text-sm text-amber-600 dark:text-amber-400 font-semibold mb-8">
                        {t('karmaBonus')}
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="px-6 py-3 rounded-xl bg-[#1e40af] text-white font-bold shadow-lg shadow-blue-500/25 hover:bg-blue-700 active:scale-95 transition-all"
                        >
                            {t('step3CtaDashboard')}
                        </button>
                        <button
                            onClick={() => router.push('/feed')}
                            className="px-6 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                        >
                            {t('step3CtaFeed')}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (step === 2) {
        return (
            <div className="space-y-6">
                <StepIndicator currentStep={2} labels={stepLabels} />

                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        {t('step2Title')}
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                        {t('step2Subtitle')}
                    </p>
                </div>

                <form onSubmit={handleStep2Submit} className="space-y-5">
                    <div className="space-y-2">
                        <label htmlFor="onb-organization" className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">
                            {t('organizationLabel')}
                        </label>
                        <input
                            id="onb-organization"
                            name="organization"
                            type="text"
                            value={step2Data.organization}
                            onChange={(e) => setStep2Data({ ...step2Data, organization: e.target.value })}
                            placeholder={t('organizationPlaceholder')}
                            maxLength={100}
                            className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all dark:text-white"
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="onb-cargo" className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">
                            {t('cargoLabel')}
                        </label>
                        <input
                            id="onb-cargo"
                            name="cargo"
                            type="text"
                            value={step2Data.cargo}
                            onChange={(e) => setStep2Data({ ...step2Data, cargo: e.target.value })}
                            placeholder={t('cargoPlaceholder')}
                            maxLength={100}
                            className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all dark:text-white"
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="onb-bio" className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">
                            {t('bioLabel')}
                        </label>
                        <textarea
                            id="onb-bio"
                            name="bio"
                            rows={3}
                            value={step2Data.bio}
                            onChange={(e) => setStep2Data({ ...step2Data, bio: e.target.value })}
                            placeholder={t('bioPlaceholder')}
                            maxLength={1000}
                            className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all dark:text-white resize-none"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label htmlFor="onb-linkedin" className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">
                                LinkedIn
                            </label>
                            <input
                                id="onb-linkedin"
                                name="linkedin_url"
                                type="url"
                                value={step2Data.linkedin_url}
                                onChange={(e) => setStep2Data({ ...step2Data, linkedin_url: e.target.value })}
                                placeholder="https://linkedin.com/in/..."
                                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all dark:text-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="onb-twitter" className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">
                                Twitter / X
                            </label>
                            <input
                                id="onb-twitter"
                                name="twitter_url"
                                type="url"
                                value={step2Data.twitter_url}
                                onChange={(e) => setStep2Data({ ...step2Data, twitter_url: e.target.value })}
                                placeholder="https://x.com/..."
                                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all dark:text-white"
                            />
                        </div>
                    </div>

                    {message && (
                        <div className={`p-4 rounded-xl text-sm font-medium border ${message.type === 'success'
                            ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-100 dark:border-green-800'
                            : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-100 dark:border-red-800'
                        }`}>
                            {message.text}
                        </div>
                    )}

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={handleCompleteLater}
                            className="px-6 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                        >
                            {t('completeLater')}
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-3 px-4 rounded-xl bg-[#1e40af] text-white font-bold shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-700 active:scale-95 disabled:opacity-50 disabled:scale-100"
                        >
                            {loading ? t('saving') : t('saveAndContinue')}
                        </button>
                    </div>
                </form>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <StepIndicator currentStep={1} labels={stepLabels} />

            <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                    <span className="text-3xl">🌱</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {isNewUser ? t('step1TitleNew') : t('step1TitleReturning')}
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                    {isNewUser ? t('step1SubtitleNew') : t('step1SubtitleReturning')}
                </p>
            </div>

            <form onSubmit={handleStep1Submit} className="space-y-5">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">
                        {t('accountTypeLabel')}
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                        {USER_TYPES.map((type) => (
                            <label
                                key={type.value}
                                htmlFor={`onb-type-${type.value}`}
                                className={`relative flex flex-col items-center justify-center gap-1 p-3 rounded-xl border-2 cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-800 ${
                                    step1Data.user_type === type.value
                                        ? 'border-[#1e40af] bg-blue-50 dark:bg-blue-900/20'
                                        : 'border-gray-100 dark:border-gray-700'
                                }`}
                            >
                                <input
                                    id={`onb-type-${type.value}`}
                                    type="radio"
                                    name="user_type"
                                    value={type.value}
                                    checked={step1Data.user_type === type.value}
                                    onChange={() => setStep1Data({ ...step1Data, user_type: type.value })}
                                    className="hidden"
                                />
                                <span className="text-xl">{type.icon}</span>
                                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wide dark:text-gray-300">
                                    {t(`type_${type.value}`)}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="space-y-2">
                    <label htmlFor="onb-username" className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">
                        {t('usernameLabel')}
                        <span className="text-red-500 ml-1">*</span>
                    </label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">@</span>
                        <input
                            id="onb-username"
                            name="username"
                            type="text"
                            required
                            value={step1Data.username}
                            onChange={(e) => setStep1Data({ ...step1Data, username: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '') })}
                            placeholder="seu_nome"
                            maxLength={30}
                            className="w-full pl-8 pr-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all dark:text-white"
                        />
                    </div>
                    <p className="text-[10px] text-gray-400 px-1">
                        {t('usernameHint')}
                    </p>
                    {step1Data.username.length > 0 && step1Data.username.length < 3 && (
                        <p className="text-xs text-red-500 px-1">{t('usernameMinLength')}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <label htmlFor="onb-display-name" className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">
                        {t('displayNameLabel')}
                        <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                        id="onb-display-name"
                        name="display_name"
                        type="text"
                        required
                        value={step1Data.display_name}
                        onChange={(e) => setStep1Data({ ...step1Data, display_name: e.target.value })}
                        placeholder={t('displayNamePlaceholder')}
                        maxLength={50}
                        className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all dark:text-white"
                    />
                </div>

                {message && (
                    <div className={`p-4 rounded-xl text-sm font-medium border ${message.type === 'success'
                        ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-100 dark:border-green-800'
                        : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-100 dark:border-red-800'
                    }`}>
                        {message.text}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading || !isStep1Valid}
                    className="w-full py-3 px-4 rounded-xl bg-[#1e40af] text-white font-bold shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-700 active:scale-95 disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed"
                >
                    {loading ? t('saving') : t('continueButton')}
                </button>
            </form>
        </div>
    );
}