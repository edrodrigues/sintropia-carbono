import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { calculateAchievements } from '@/lib/achievements';
import { AchievementList } from '@/components/profile/AchievementBadges';
import { getStreakBonus, getStreakEmoji } from '@/types/gamification';
import { getUserTypeIcon } from '@/lib/utils/user';
import { getTranslations } from 'next-intl/server';
import { InviteSection } from '@/components/dashboard/InviteSection';

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
    const tSummary = await getTranslations('Dashboard.summary');
    const tGamification = await getTranslations('Dashboard.gamification');
    const tAchievements = await getTranslations('Dashboard.achievements');
    const tContribute = await getTranslations('Dashboard.contribute');

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const { data: profile }: any = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

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

    // Badges logic
    const getBadge = (karma: number) => {
        if (karma >= 1000) return { name: 'Master', icon: '👑', nextLevel: 5000 };
        if (karma >= 500) return { name: 'Especialista', icon: '💎', nextLevel: 1000 };
        if (karma >= 100) return { name: 'Contribuidor', icon: '🌟', nextLevel: 500 };
        if (karma >= 50) return { name: 'Aprendiz', icon: '🌿', nextLevel: 100 };
        if (karma >= 10) return { name: 'Iniciante', icon: '🌱', nextLevel: 50 };
        return { name: 'Novato', icon: '🥚', nextLevel: 10 };
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Profile Summary Card */}
                <div className="md:col-span-2 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm">
                    <div className="bg-[#1e40af] h-24"></div>
                    <div className="px-6 pb-6 -mt-12">
                        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                            <div className="flex items-end gap-4">
                                <div className="w-24 h-24 rounded-2xl bg-white dark:bg-gray-900 border-4 border-white dark:border-gray-800 flex items-center justify-center text-4xl shadow-md">
                                    {badge.icon}
                                </div>
                                <div className="mb-2">
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white leading-none">
                                        {profile?.display_name || profile?.username}
                                    </h2>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="text-blue-600 dark:text-blue-400 font-medium">@{profile?.username}</span>
                                        <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-[10px] rounded uppercase tracking-wider font-bold border border-gray-200 dark:border-gray-600">
                                            {badge.name}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <Link
                                href="/profile"
                                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 text-sm font-bold rounded-xl transition-colors mb-2"
                            >
                                {tProfile('viewProfile')}
                            </Link>
                        </div>

                        <div className="mt-8 grid grid-cols-3 gap-4 border-t border-gray-100 dark:border-gray-700 pt-6">
                            <div className="text-center">
                                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">{tStats('karma')}</p>
                                <p className="text-xl font-extrabold text-[#1e40af] dark:text-blue-400">{userKarma.toLocaleString()}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">{tStats('posts')}</p>
                                <p className="text-xl font-extrabold text-gray-900 dark:text-white">{totalPosts || 0}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">{tStats('comments')}</p>
                                <p className="text-xl font-extrabold text-gray-900 dark:text-white">{totalComments || 0}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Streak Card */}
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 rounded-2xl border border-orange-100 dark:border-orange-900/50 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-3xl">{getStreakEmoji(streakData?.current_streak || 0)}</span>
                        <span className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-widest">{tStreak('current')}</span>
                    </div>
                    <p className="text-4xl font-black text-orange-700 dark:text-orange-400 mb-1">
                        {streakData?.current_streak || 0}
                    </p>
                    <p className="text-sm font-medium text-orange-600 dark:text-orange-400 mb-6">
                        {tStreak('days')}
                    </p>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
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
                        <div className="w-full bg-gray-100 dark:bg-gray-700 h-3 rounded-full overflow-hidden">
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

                    <div className="flex flex-col items-center justify-center py-6 border-b border-gray-100 dark:border-gray-700 mb-6">
                        <div className="relative">
                            <div className="w-32 h-32 rounded-full border-8 border-yellow-100 dark:border-yellow-900/30 flex items-center justify-center">
                                <span className="text-4xl font-black text-yellow-600 dark:text-yellow-400">#{ranking}</span>
                            </div>
                            <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-4 py-1 bg-yellow-500 text-white text-xs font-bold rounded-full">
                                {tGamification('globalRanking') || 'Ranking Global'}
                            </span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400 text-center px-4">
                            {tGamification('rankingDesc') || 'Aumente seu Karma participando ativamente da comunidade e convidando novos membros.'}
                        </p>
                        <Link
                            href="/leaderboard"
                            className="flex items-center justify-center gap-2 w-full py-3 bg-gray-900 dark:bg-gray-700 hover:bg-gray-800 dark:hover:bg-gray-600 text-white text-sm font-bold rounded-xl transition-all"
                        >
                            <span>👑</span> {tGamification('viewLeaderboard') || 'Ver Leaderboard'}
                        </Link>
                    </div>
                </div>
            </div>

            {/* Achievements Section */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 mb-8 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">🏆</span>
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
                    <span className="text-2xl">🚀</span>
                    <h3 className="text-xl font-bold text-green-900 dark:text-green-200">{tContribute('title')}</h3>
                </div>

                <p className="text-green-800 dark:text-green-300 mb-6">
                    {tContribute('description')}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="flex items-start gap-3 p-3 bg-white/80 dark:bg-gray-800/80 rounded-xl backdrop-blur-sm">
                        <span className="text-xl">📝</span>
                        <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{tContribute('actions.shareKnowledge.title')}</h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{tContribute('actions.shareKnowledge.desc')}</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-white/80 dark:bg-gray-800/80 rounded-xl backdrop-blur-sm">
                        <span className="text-xl">💡</span>
                        <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{tContribute('actions.helpNewbies.title')}</h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{tContribute('actions.helpNewbies.desc')}</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-white/80 dark:bg-gray-800/80 rounded-xl backdrop-blur-sm">
                        <span className="text-xl">📊</span>
                        <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{tContribute('actions.reportData.title')}</h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{tContribute('actions.reportData.desc')}</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-white/80 dark:bg-gray-800/80 rounded-xl backdrop-blur-sm">
                        <span className="text-xl">💻</span>
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
