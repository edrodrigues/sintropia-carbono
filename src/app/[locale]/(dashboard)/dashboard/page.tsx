import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { calculateAchievements } from '@/lib/achievements';
import { AchievementList } from '@/components/profile/AchievementBadges';
import { getTranslations } from 'next-intl/server';
import { InviteSection } from '@/components/dashboard/InviteSection';

// SVG Icon Components
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

const PlusIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
);

const UsersIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 108 0 4 4 0 00-8 0zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
    </svg>
);

const FeedIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9m11 6h-2m-4 0h-2m-4 0H6" />
    </svg>
);

const TrendingUpIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
);

const SparklesIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
);

const DocumentIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);

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
    const tProfile = await getTranslations('Dashboard.profile');
    const tStats = await getTranslations('Dashboard.stats');
    const tGamification = await getTranslations('Dashboard.gamification');
    const tAchievements = await getTranslations('Dashboard.achievements');
    const tContribute = await getTranslations('Dashboard.contribute');
    const tActions = await getTranslations('Dashboard.actions');

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

    const { count: higherKarmaCount } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .gt('karma', profile?.karma ?? 0);

    const { count: totalUsers } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true });

    const userKarma = profile?.karma ?? 0;
    const ranking = higherKarmaCount !== null ? higherKarmaCount + 1 : 1;
    const totalUsersCount = totalUsers ?? 1;
    const rankingPercentile = Math.round((1 - (ranking / totalUsersCount)) * 100);

    // Badges logic with SVG icons
    const getBadge = (karma: number) => {
        if (karma >= 1000) return { 
            name: 'Master', 
            icon: <CrownIcon className="w-10 h-10 sm:w-12 sm:h-12 text-yellow-500" />, 
            nextLevel: 5000,
            color: 'yellow'
        };
        if (karma >= 500) return { 
            name: 'Especialista', 
            icon: <DiamondIcon className="w-10 h-10 sm:w-12 sm:h-12 text-blue-500" />, 
            nextLevel: 1000,
            color: 'blue'
        };
        if (karma >= 100) return { 
            name: 'Contribuidor', 
            icon: <StarIcon className="w-10 h-10 sm:w-12 sm:h-12 text-amber-400" />, 
            nextLevel: 500,
            color: 'amber'
        };
        if (karma >= 50) return { 
            name: 'Aprendiz', 
            icon: <LeafIcon className="w-10 h-10 sm:w-12 sm:h-12 text-green-500" />, 
            nextLevel: 100,
            color: 'green'
        };
        if (karma >= 10) return { 
            name: 'Iniciante', 
            icon: <SeedlingIcon className="w-10 h-10 sm:w-12 sm:h-12 text-green-400" />, 
            nextLevel: 50,
            color: 'green'
        };
        return { 
            name: 'Novato', 
            icon: <EggIcon className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400" />, 
            nextLevel: 10,
            color: 'gray'
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
        createdAt: profile?.created_at || new Date().toISOString()
    });

return (
        <div className="max-w-5xl mx-auto px-4 py-6 sm:py-8 space-y-6">{/* Quick Actions - Moved to top for immediate engagement */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Link
                    href="/posts/new"
                    className="flex items-center justify-center gap-2 p-4 bg-gradient-to-br from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold text-sm transition-all shadow-lg shadow-blue-500/25 cursor-pointer min-h-[52px]"
                >
                    <PlusIcon className="w-5 h-5 shrink-0" />
                    <span className="hidden sm:inline">{tActions?.('createPost') || 'Criar Post'}</span>
                    <span className="sm:hidden">Post</span>
                </Link>
                <Link
                    href="/feed"
                    className="flex items-center justify-center gap-2 p-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl font-semibold text-sm transition-all cursor-pointer min-h-[52px]"
                >
                    <FeedIcon className="w-5 h-5 shrink-0" />
                    <span className="hidden sm:inline">{tActions?.('viewFeed') || 'Ver Feed'}</span>
                    <span className="sm:hidden">Feed</span>
                </Link>
                <Link
                    href="/leaderboard"
                    className="flex items-center justify-center gap-2 p-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl font-semibold text-sm transition-all cursor-pointer min-h-[52px]"
                >
                    <TrendingUpIcon className="w-5 h-5 shrink-0" />
                    <span className="hidden sm:inline">{tActions?.('leaderboard') || 'Ranking'}</span>
                    <span className="sm:hidden">Ranking</span>
                </Link>
                <Link
                    href="/profile"
                    className="flex items-center justify-center gap-2 p-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl font-semibold text-sm transition-all cursor-pointer min-h-[52px]"
                >
                    <UsersIcon className="w-5 h-5 shrink-0" />
                    <span className="hidden sm:inline">{tProfile('viewProfile')}</span>
                    <span className="sm:hidden">Perfil</span>
                </Link>
            </div>

            {/* Stats Overview - More prominent with icons */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4">
                <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl p-4 sm:p-6 text-white shadow-lg">
                    <div className="flex items-center gap-2 mb-2">
                        <SparklesIcon className="w-5 h-5 opacity-80" />
                        <span className="text-xs sm:text-sm font-medium opacity-90">{tStats('karma')}</span>
                    </div>
                    <p className="text-2xl sm:text-3xl font-extrabold">{userKarma.toLocaleString()}</p>
                    <p className="text-xs mt-1 opacity-80">Level: {badge.name}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-2 mb-2">
                        <DocumentIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        <span className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">{tStats('posts')}</span>
                    </div>
                    <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">{totalPosts || 0}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{tStats('published')}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-2 mb-2">
                        <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <span className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">{tStats('comments')}</span>
                    </div>
                    <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">{totalComments || 0}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{tStats('made')}</p>
                </div>
            </div>

            {/* Profile Card - Compact */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm">
                <div className="bg-gradient-to-r from-[#1e40af] to-blue-600 h-16 relative">
                    <div className="absolute -bottom-10 left-4 sm:left-6">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white dark:bg-gray-900 border-4 border-white dark:border-gray-800 flex items-center justify-center shadow-lg">
                            {badge.icon}
                        </div>
                    </div>
                </div>
                <div className="pt-12 sm:pt-14 pb-4 px-4 sm:px-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="ml-20 sm:ml-0 sm:ml-0">
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate">
                                {profile?.display_name || profile?.username}
                            </h2>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-blue-600 dark:text-blue-400 font-medium text-sm">@{profile?.username}</span>
                                <span className={`px-2 py-0.5 text-xs font-bold rounded uppercase tracking-wide ${
                                    badge.color === 'yellow' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                    badge.color === 'blue' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                    badge.color === 'amber' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                                    badge.color === 'green' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400':
                                    'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                                }`}>
                                    {badge.name}
                                </span>
                            </div>
                        </div>
                        <Link
                            href="/profile/edit"
                            className="px-4 py-2 min-h-[40px] bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 text-sm font-semibold rounded-xl transition-colors inline-flex items-center justify-center cursor-pointer"
                        >
                            {tProfile('editProfile') || 'Editar Perfil'}
                        </Link>
                    </div>
                </div>
            </div>

            {/* Karma Progress & Ranking - Side by side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {/* Karma Progress */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 sm:p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">{tGamification('title')}</h3>
                        <span className="px-3 py-1 bg-gradient-to-r from-yellow-100 to-amber-100 dark:from-yellow-900/30 dark:to-amber-900/30 text-yellow-700 dark:text-yellow-400 text-xs font-bold rounded-full">
                            {badge.name}
                        </span>
                    </div>

                    <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{tGamification('progress')}</span>
                            <span className="text-sm font-bold text-gray-900 dark:text-white">{userKarma.toLocaleString()} / {badge.nextLevel.toLocaleString()}</span>
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
                                className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full transition-all duration-500"
                                style={{ width: `${progressToNext}%` }}
                            ></div>
                        </div>
                        <p className="mt-2 text-xs text-gray-500 text-right">
                            {badge.nextLevel - userKarma} {tGamification('toNext')}
                        </p>
                    </div>

                    <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                        <p className="font-medium text-gray-700 dark:text-gray-300 text-xs mb-2">{tGamification('howToEarn')}</p>
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-600 dark:text-gray-400">{tGamification('actions.inviteFriend') || 'Convidar amigo'}</span>
                                <span className="font-bold text-green-600 dark:text-green-400">+50</span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-600 dark:text-gray-400">{tGamification('actions.createPost')}</span>
                                <span className="font-bold text-green-600 dark:text-green-400">+10</span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-600 dark:text-gray-400">{tGamification('actions.comment')}</span>
                                <span className="font-bold text-green-600 dark:text-green-400">+5</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Ranking */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 sm:p-6 shadow-sm">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4">{tGamification('rankingTitle') || 'SuaPosição'}</h3>

                    <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 dark:from-yellow-900/20 dark:via-amber-900/20 dark:to-orange-900/20 rounded-xl border border-yellow-100 dark:border-yellow-800/30 mb-4">
                        <div className="flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-lg">
                            <span className="text-xl sm:text-2xl font-black text-white">#{ranking}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-900 dark:text-white">
                                {tGamification('globalRanking') || 'Ranking Global'}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                                Top {rankingPercentile}% da comunidade
                            </p>
                        </div>
                    </div>

                    <Link
                        href="/leaderboard"
                        className="flex items-center justify-center gap-2 w-full py-3 min-h-[44px] bg-gray-900 dark:bg-gray-700 hover:bg-gray-800 dark:hover:bg-gray-600 text-white text-sm font-bold rounded-xl transition-all cursor-pointer"
                    >
                        <CrownIcon className="w-4 h-4" />
                        {tGamification('viewLeaderboard') || 'Ver Leaderboard'}
                    </Link>
                </div>
            </div>

            {/* Invite Section */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 rounded-2xl border border-blue-100 dark:border-blue-800/30 p-5">
                <InviteSection referralCode={profile?.referral_code || ''} />
            </div>

            {/* Achievements - Compact */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 sm:p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <TrophyIcon className="w-5 h-5 text-yellow-500" />
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">{tAchievements('title')}</h3>
                    </div>
                    <Link href="/conquistas" className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium cursor-pointer">
                        {tAchievements('viewAll')} →
                    </Link>
                </div>
                <div className="flex items-center gap-2 mb-4">
                    <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full transition-all duration-500"
                            style={{ width: `${(achievements.filter(a => a.earned).length / achievements.length) * 100}%` }}
                        ></div>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                        {achievements.filter(a => a.earned).length}/{achievements.length}
                    </span>
                </div>
                <AchievementList achievements={achievements} maxVisible={6} />
            </div>

            {/* Contribution CTA - Moved to bottom but more prominent */}
            <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl p-5 sm:p-6 text-white shadow-lg">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                        <h3 className="text-lg sm:text-xl font-bold mb-2">{tContribute('title')}</h3>
                        <p className="text-sm opacity-90 mb-4">{tContribute('description')}</p>
                        <div className="flex flex-wrap gap-2">
                            <Link
                                href="/contribuir"
                                className="px-4 py-2 bg-white text-green-700 font-bold text-sm rounded-xl hover:bg-gray-100 transition-colors cursor-pointer min-h-[40px]"
                            >
                                {tContribute('cta')}
                            </Link>
                            <a
                                href="https://github.com/edrodrigues/sintropia-carbono"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white font-bold text-sm rounded-xl transition-colors inline-flex items-center gap-2 cursor-pointer min-h-[40px]"
                            >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z" />
                                </svg>
                                GitHub
                            </a>
                        </div>
                    </div>
                    <RocketIcon className="w-8 h-8 opacity-50 hidden sm:block shrink-0" />
                </div>
            </div>
        </div>
    );
}
