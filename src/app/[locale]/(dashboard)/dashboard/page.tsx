import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { calculateAchievements } from '@/lib/achievements';
import { AchievementList } from '@/components/profile/AchievementBadges';
import { getStreakBonus } from '@/types/gamification';
import { getTranslations } from 'next-intl/server';
import { InviteSection } from '@/components/dashboard/InviteSection';

// SVG Icon Components (replacing emojis)
const CrownIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3l2.5 5 5.5 1-4 4 1 5.5-5-2.5-5 2.5 1-5.5-4-4 5.5-1L12 3z" />
    </svg>
);

const DiamondIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 2L4 8l8 12 8-12-8-6z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 8h16M12 2v6" />
    </svg>
);

const StarIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
);

const LeafIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c5.5 0 10-4.5 10-10S17.5 2 12 2zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v12M8 10c2-2 4-2 8 0" />
    </svg>
);

const SeedlingIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 2a10 10 0 00-10 10c0 5.5 4.5 10 10 10s10-4.5 10-10S17.5 2 12 2z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 12v8M8 14c2-2 4-2 8 0" />
    </svg>
);

const EggIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4C8 4 5 8 5 13c0 3.5 2.5 6 7 6s7-2.5 7-6c0-5-3-9-7-9z" />
    </svg>
);

const FireIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z" />
    </svg>
);

const SleepingIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 12h-6M17 9v6M4 14h2a2 2 0 002-2v-2a2 2 0 00-2-2H4v6z" />
    </svg>
);

const TrophyIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 21h8M12 17v4M7 4h10v5a5 5 0 01-10 0V4z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 4H5a2 2 0 00-2 2v2a2 2 0 002 2h2M17 4h2a2 2 0 012 2v2a2 2 0 01-2 2h-2" />
    </svg>
);

const RocketIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 2c0 0-7 4-7 11v3l-2 2h18l-2-2v-3c0-7-7-11-7-11z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14a2 2 0 100-4 2 2 0 000 4z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 22h14" />
    </svg>
);

const DocumentIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);

const LightbulbIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
);

const ChartIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
);

const CodeIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
);

// Get SVG icon based on streak
const getStreakIcon = (streak: number) => {
    if (streak === 0) return <SleepingIcon className="w-8 h-8 text-gray-400" />;
    if (streak < 3) return <FireIcon className="w-8 h-8 text-orange-500" />;
    if (streak < 7) return <FireIcon className="w-8 h-8 text-orange-500" />;
    if (streak < 14) return <FireIcon className="w-8 h-8 text-red-500" />;
    if (streak < 30) return <FireIcon className="w-8 h-8 text-red-600" />;
    return <TrophyIcon className="w-8 h-8 text-yellow-500" />;
};

// Type definition for profile
interface Profile {
    id: string;
    username: string;
    display_name?: string | null;
    karma: number;
    linkedin_url?: string | null;
    created_at: string;
    referral_code?: string | null;
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    
    return {
        title: locale === 'pt' ? 'Painel | Sintropia' : 'Dashboard | Sintropia',
        robots: {
            index: false,
            follow: false,
        },
    };
}

export default async function DashboardPage() {
    const supabase = await createClient();
    const t = await getTranslations('Dashboard');
    const tProfile = await getTranslations('Dashboard.profile');
    const tStats = await getTranslations('Dashboard.stats');
    const tStreak = await getTranslations('Dashboard.streak');
    const tGamification = await getTranslations('Dashboard.gamification');
    const tAchievements = await getTranslations('Dashboard.achievements');
    const tContribute = await getTranslations('Dashboard.contribute');

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single<Profile>();

    const { count: totalPosts } = await supabase
        .from('posts')
        .select('id', { count: 'exact', head: true })
        .eq('author_id', user.id)
        .eq('is_deleted', false);

    const { count: totalComments } = await supabase
        .from('comments')
        .select('id', { count: 'exact', head: true })
        .eq('author_id', user.id)
        .eq('is_deleted', false);

    const { data: streakData } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', user.id)
        .single();

    const { count: higherKarmaCount } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .gt('karma', profile?.karma ?? 0);

    const userKarma = profile?.karma ?? 0;
    const ranking = higherKarmaCount !== null ? higherKarmaCount + 1 : 1;

    // Badges logic with SVG icons
    const getBadge = (karma: number) => {
        if (karma >= 1000) return { 
            name: 'Master', 
            icon: <CrownIcon className="w-10 h-10 sm:w-12 sm:h-12 text-yellow-500" />, 
            nextLevel: 5000 
        };
        if (karma >= 500) return { 
            name: 'Especialista', 
            icon: <DiamondIcon className="w-10 h-10 sm:w-12 sm:h-12 text-blue-500" />, 
            nextLevel: 1000 
        };
        if (karma >= 100) return { 
            name: 'Contribuidor', 
            icon: <StarIcon className="w-10 h-10 sm:w-12 sm:h-12 text-amber-400" />, 
            nextLevel: 500 
        };
        if (karma >= 50) return { 
            name: 'Aprendiz', 
            icon: <LeafIcon className="w-10 h-10 sm:w-12 sm:h-12 text-green-500" />, 
            nextLevel: 100 
        };
        if (karma >= 10) return { 
            name: 'Iniciante', 
            icon: <SeedlingIcon className="w-10 h-10 sm:w-12 sm:h-12 text-green-400" />, 
            nextLevel: 50 
        };
        return { 
            name: 'Novato', 
            icon: <EggIcon className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400" />, 
            nextLevel: 10 
        };
    };

    const badge = getBadge(userKarma);
    const progressToNext = Math.min((userKarma / badge.nextLevel) * 100, 100);

    const achievements = calculateAchievements({
        karma: userKarma,
        linkedin_url: profile?.linkedin_url || undefined,
        created_at: profile?.created_at || undefined
    }, {
        postCount: totalPosts || 0,
        commentCount: totalComments || 0,
        upvotesReceived: 0,
        hasLinkedIn: !!profile?.linkedin_url,
        createdAt: profile?.created_at || new Date().toISOString(),
        streakDays: streakData?.current_streak || 0
    });

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-8">{t('title')}</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Profile Summary Card */}
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm flex flex-col">
                    <div className="bg-gradient-to-r from-[#1e40af] to-blue-600 h-20 sm:h-24 shrink-0"></div>
                    <div className="px-4 sm:px-6 pb-6 -mt-8 sm:-mt-12 flex-1 flex flex-col">
                        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                            <div className="flex items-end gap-3 sm:gap-4 min-w-0">
                                <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-2xl bg-white dark:bg-gray-900 border-4 border-white dark:border-gray-800 flex items-center justify-center shadow-md">
                                    {badge.icon}
                                </div>
                                <div className="mb-2 min-w-0">
                                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white leading-tight truncate">
                                        {profile?.display_name || profile?.username}
                                    </h2>
                                    <div className="flex flex-wrap items-center gap-2 mt-1 sm:mt-2">
                                        <span className="text-blue-600 dark:text-blue-400 font-medium text-sm sm:text-base truncate">@{profile?.username}</span>
                                        <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-[9px] sm:text-[10px] rounded uppercase tracking-wider font-bold border border-gray-200 dark:border-gray-600 whitespace-nowrap">
                                            {badge.name}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <Link
                                href="/profile"
                                className="px-6 py-3 min-h-[44px] bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 text-sm font-bold rounded-xl transition-colors mb-2 text-center inline-flex items-center justify-center"
                                aria-label={tProfile('viewProfile')}
                            >
                                {tProfile('viewProfile')}
                            </Link>
                        </div>

                        <div className="mt-8 grid grid-cols-3 gap-2 sm:gap-4 border-t border-gray-100 dark:border-gray-700 pt-6">
                            <div className="text-center min-w-0">
                                <p className="text-[10px] sm:text-xs text-gray-500 uppercase font-bold tracking-wider mb-1 truncate">{tStats('karma')}</p>
                                <p className="text-lg sm:text-xl font-extrabold text-[#1e40af] dark:text-blue-400 truncate">{userKarma.toLocaleString()}</p>
                            </div>
                            <div className="text-center min-w-0">
                                <p className="text-[10px] sm:text-xs text-gray-500 uppercase font-bold tracking-wider mb-1 truncate">{tStats('posts')}</p>
                                <p className="text-lg sm:text-xl font-extrabold text-gray-900 dark:text-white truncate">{totalPosts || 0}</p>
                            </div>
                            <div className="text-center min-w-0">
                                <p className="text-[10px] sm:text-xs text-gray-500 uppercase font-bold tracking-wider mb-1 truncate">{tStats('comments')}</p>
                                <p className="text-lg sm:text-xl font-extrabold text-gray-900 dark:text-white truncate">{totalComments || 0}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Streak Card */}
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 rounded-2xl border border-orange-100 dark:border-orange-900/50 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        {getStreakIcon(streakData?.current_streak || 0)}
                        <span className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-widest">{tStreak('current')}</span>
                    </div>
                    <p className="text-4xl font-black text-orange-700 dark:text-orange-400 mb-1">
                        {streakData?.current_streak || 0}
                    </p>
                    <p className="text-sm font-medium text-orange-600 dark:text-orange-400 mb-4">
                        {tStreak('days')}
                    </p>
                    
                    {/* 7-Day Streak Visual Progress */}
                    <div className="mb-4">
                        <div className="flex justify-between items-center gap-1">
                            {[1, 2, 3, 4, 5, 6, 7].map((day) => {
                                const isCompleted = day <= (streakData?.current_streak || 0);
                                const isCurrent = day === (streakData?.current_streak || 0) + 1;
                                return (
                                    <div
                                        key={day}
                                        className={`flex-1 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                                            isCompleted
                                                ? 'bg-orange-500 text-white shadow-sm'
                                                : isCurrent
                                                ? 'bg-orange-200 dark:bg-orange-800 text-orange-700 dark:text-orange-300 ring-2 ring-orange-400'
                                                : 'bg-orange-100 dark:bg-orange-900/30 text-orange-300 dark:text-orange-600'
                                        }`}
                                        aria-label={`Dia ${day}${isCompleted ? ' completado' : ''}`}
                                    >
                                        {day === 7 ? '🎁' : day}
                                    </div>
                                );
                            })}
                        </div>
                        <p className="text-center text-[10px] text-orange-600 dark:text-orange-400 mt-2">
                            {(streakData?.current_streak || 0) < 7 
                                ? `${7 - (streakData?.current_streak || 0)} ${t('daysToBonus') || 'dias para o bônus especial!'}`
                                : t('bonusUnlocked') || 'Bônus especial desbloqueado!'
                            }
                        </p>
                    </div>
                    
                    <div className="bg-white/50 dark:bg-orange-900/20 rounded-xl p-3 border border-orange-100 dark:border-orange-900/30">
                        <p className="text-[10px] text-orange-800 dark:text-orange-300 uppercase font-bold tracking-wider mb-1">
                            {tStreak('nextBonus')}
                        </p>
                        <p className="text-sm font-bold text-orange-900 dark:text-orange-200">
                            +{getStreakBonus((streakData?.current_streak || 0) + 1)} Karma
                        </p>
                    </div>
                </div>
            </div>

            {/* Referral Section */}
            <div className="mb-8">
                <InviteSection referralCode={profile?.referral_code || ''} />
            </div>

            {/* Karma & Ranking Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-8">
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{tGamification('title')}</h3>
                        <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs font-bold rounded-full border border-yellow-200 dark:border-yellow-800">
                            Level {badge.name}
                        </span>
                    </div>

                    <div className="mb-6">
                        <div className="flex justify-between items-end mb-2">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{tGamification('progress')}</span>
                            <span className="font-bold text-gray-900 dark:text-white">{userKarma.toLocaleString()} / {badge.nextLevel}</span>
                        </div>
                        <div 
                            className="w-full bg-gray-100 dark:bg-gray-700 h-3 rounded-full overflow-hidden"
                            role="progressbar"
                            aria-valuenow={userKarma}
                            aria-valuemin={0}
                            aria-valuemax={badge.nextLevel}
                            aria-label={`${tGamification('progress')}: ${userKarma} de ${badge.nextLevel} Karma`}
                        >
                            <div
                                className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full transition-all duration-1000"
                                style={{ width: `${progressToNext}%` }}
                            ></div>
                        </div>
                        <p className="mt-2 text-xs text-gray-500 text-right">
                            {badge.nextLevel - userKarma} {tGamification('toNext')}
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800/50">
                            <p className="font-semibold text-blue-900 dark:text-blue-200 text-sm mb-3">{tGamification('howToEarn')}</p>
                            <div className="grid grid-cols-1 gap-2">
                                <div className="flex items-center gap-3">
                                    <span className="w-16 text-center py-1 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-700 dark:text-green-400 font-bold text-sm">+50</span>
                                    <span className="text-blue-800 dark:text-blue-300 text-sm">{tGamification('actions.inviteFriend') || 'Convidar amigo (após completar perfil)'}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="w-16 text-center py-1 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-700 dark:text-green-400 font-bold text-sm">+10</span>
                                    <span className="text-blue-800 dark:text-blue-300 text-sm">{tGamification('actions.createPost')}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="w-16 text-center py-1 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-700 dark:text-green-400 font-bold text-sm">+5</span>
                                    <span className="text-blue-800 dark:text-blue-300 text-sm">{tGamification('actions.comment')}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="w-16 text-center py-1 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-700 dark:text-green-400 font-bold text-sm">+3</span>
                                    <span className="text-blue-800 dark:text-blue-300 text-sm">{tGamification('actions.likePost')}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="w-16 text-center py-1 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-700 dark:text-green-400 font-bold text-sm">+2</span>
                                    <span className="text-blue-800 dark:text-blue-300 text-sm">{tGamification('actions.likeComment')}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">{tGamification('rankingTitle') || 'Sua Posição'}</h3>

                    {/* Horizontal Ranking Card */}
                    <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-xl border border-yellow-100 dark:border-yellow-800/30 mb-6">
                        <div className="flex-shrink-0 w-16 h-16 rounded-full bg-yellow-500 flex items-center justify-center shadow-lg shadow-yellow-500/30">
                            <span className="text-2xl font-black text-white">#{ranking}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-yellow-800 dark:text-yellow-200">
                                {tGamification('globalRanking') || 'Ranking Global'}
                            </p>
                            <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                                {tGamification('rankingDesc') || 'Aumente seu Karma participando ativamente da comunidade e convidando novos membros.'}
                            </p>
                        </div>
                    </div>

                    <Link
                        href="/leaderboard"
                        className="flex items-center justify-center gap-2 w-full py-3 min-h-[44px] bg-gray-900 dark:bg-gray-700 hover:bg-gray-800 dark:hover:bg-gray-600 text-white text-sm font-bold rounded-xl transition-all"
                    >
                        <CrownIcon className="w-4 h-4" /> {tGamification('viewLeaderboard') || 'Ver Leaderboard'}
                    </Link>
                </div>
            </div>

            {/* Achievements Section */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 mb-8 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <TrophyIcon className="w-6 h-6 text-yellow-500" />
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{tAchievements('title')}</h3>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-500">
                            {achievements.filter(a => a.earned).length} / {achievements.length} {tAchievements('earned')}
                        </span>
                        <Link href="/conquistas" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                            {tAchievements('viewAll')}
                        </Link>
                    </div>
                </div>
                <AchievementList achievements={achievements} maxVisible={6} />
            </div>

            {/* Contribution Section */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 rounded-2xl border border-green-100 dark:border-green-800/50 p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                    <RocketIcon className="w-6 h-6 text-green-600" />
                    <h3 className="text-xl font-bold text-green-900 dark:text-green-200">{tContribute('title')}</h3>
                </div>

                <p className="text-green-800 dark:text-green-300 mb-6">
                    {tContribute('description')}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="flex items-start gap-3 p-3 bg-white/80 dark:bg-gray-800/80 rounded-xl backdrop-blur-sm">
                        <DocumentIcon className="w-5 h-5 text-blue-500 shrink-0" />
                        <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{tContribute('actions.shareKnowledge.title')}</h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{tContribute('actions.shareKnowledge.desc')}</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-white/80 dark:bg-gray-800/80 rounded-xl backdrop-blur-sm">
                        <LightbulbIcon className="w-5 h-5 text-yellow-500 shrink-0" />
                        <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{tContribute('actions.helpNewbies.title')}</h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{tContribute('actions.helpNewbies.desc')}</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-white/80 dark:bg-gray-800/80 rounded-xl backdrop-blur-sm">
                        <ChartIcon className="w-5 h-5 text-blue-500 shrink-0" />
                        <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{tContribute('actions.reportData.title')}</h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{tContribute('actions.reportData.desc')}</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-white/80 dark:bg-gray-800/80 rounded-xl backdrop-blur-sm">
                        <CodeIcon className="w-5 h-5 text-green-500 shrink-0" />
                        <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{tContribute('actions.contributeCode.title')}</h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{tContribute('actions.contributeCode.desc')}</p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap gap-3">
                    <Link
                        href="/contribuir"
                        className="px-5 py-2.5 bg-[#1e40af] hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors shadow-lg shadow-blue-500/25"
                    >
                        {tContribute('cta')}
                    </Link>
                    <a
                        href="https://github.com/edrodrigues/sintropia-carbono"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-5 py-2.5 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-900 dark:text-white text-sm font-bold rounded-xl border border-gray-200 dark:border-gray-600 transition-colors flex items-center gap-2 shadow-sm"
                    >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z" />
                        </svg>
                        GitHub
                    </a>
                </div>
            </div>
        </div>
    );
}
