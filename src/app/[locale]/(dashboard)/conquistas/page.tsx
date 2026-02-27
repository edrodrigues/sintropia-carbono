import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { calculateAchievements } from '@/lib/achievements';
import { AchievementList } from '@/components/profile/AchievementBadges';
import { getStreakBonus, getStreakEmoji } from '@/types/gamification';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    
    return {
        title: locale === 'pt' ? 'Conquistas | Sintropia' : 'Achievements | Sintropia',
    };
}

export default async function ConquistasPage() {
    const supabase = await createClient();
    const t = await getTranslations('Community.conquistas');

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

    const { count: higherKarmaCount } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .gt('karma', profile?.karma || 0);

    const userKarma = profile?.karma || 0;
    const ranking = higherKarmaCount !== null ? higherKarmaCount + 1 : 1;

    // Fetch streak data
    const { data: streakData } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', user.id)
        .single();

    const currentStreak = streakData?.current_streak || 0;
    const longestStreak = streakData?.longest_streak || 0;

    const achievements = calculateAchievements(profile || {}, {
        postCount: totalPosts || 0,
        commentCount: totalComments || 0,
        upvotesReceived: 0,
        hasLinkedIn: !!profile?.linkedin_url,
        createdAt: profile?.created_at || new Date().toISOString(),
        karma: userKarma,
    });

    const earnedCount = achievements.filter(a => a.earned).length;

    return (
        <div className="max-w-4xl mx-auto py-12 px-4">
            <div className="mb-8">
                <Link href="/dashboard" className="text-blue-600 dark:text-blue-400 hover:underline mb-4 inline-block">
                    {t('backToDashboard')}
                </Link>
                <h1 className="text-4xl font-bold text-[#1e40af] mb-2 dark:text-blue-400">
                    {t('pageTitle')}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    {t('pageSubtitle')}
                </p>
            </div>

            {/* Your Progress */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl border border-blue-100 dark:border-blue-800 p-6 mb-8">
                <h2 className="text-xl font-bold text-blue-900 dark:text-blue-200 mb-4">{t('progress')}</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-xl">
                        <span className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{userKarma}</span>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{t('karmaTotal')}</p>
                    </div>
                    <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-xl">
                        <span className="text-3xl font-bold text-orange-600 dark:text-orange-400">{currentStreak}</span>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{t('streakDays')}</p>
                    </div>
                    <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-xl">
                        <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">#{ranking}</span>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{t('ranking')}</p>
                    </div>
                    <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-xl">
                        <span className="text-3xl font-bold text-purple-600 dark:text-purple-400">{earnedCount}</span>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{t('achievementsCount')}</p>
                    </div>
                </div>
            </div>

            {/* How to Earn Karma */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 mb-8">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{t('howToEarn')}</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {t('karmaDescription')}
                </p>
                <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <span className="w-16 text-center py-1 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-700 dark:text-green-400 font-bold text-sm">+10</span>
                        <span className="text-gray-700 dark:text-gray-300">{t('earnActions.createPost')}</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <span className="w-16 text-center py-1 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-700 dark:text-green-400 font-bold text-sm">+5</span>
                        <span className="text-gray-700 dark:text-gray-300">{t('earnActions.comment')}</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <span className="w-16 text-center py-1 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-700 dark:text-green-400 font-bold text-sm">+3</span>
                        <span className="text-gray-700 dark:text-gray-300">{t('earnActions.likePost')}</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <span className="w-16 text-center py-1 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-700 dark:text-green-400 font-bold text-sm">+2</span>
                        <span className="text-gray-700 dark:text-gray-300">{t('earnActions.likeComment')}</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                        <span className="text-xl mr-2">🔥</span>
                        <span className="text-gray-700 dark:text-gray-300">{t('earnActions.streakBonus')}</span>
                    </div>
                </div>
            </div>

            {/* Badges */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 mb-8">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{t('badgesByLevel')}</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <span className="text-2xl">🥚</span>
                        <div>
                            <p className="font-bold">{t('badgeLevels.newbie.name')}</p>
                            <p className="text-xs text-gray-500">{t('badgeLevels.newbie.threshold')}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg">
                        <span className="text-2xl">🌱</span>
                        <div>
                            <p className="font-bold">{t('badgeLevels.beginner.name')}</p>
                            <p className="text-xs text-gray-500">{t('badgeLevels.beginner.threshold')}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-teal-50 dark:bg-teal-900/30 rounded-lg">
                        <span className="text-2xl">🌿</span>
                        <div>
                            <p className="font-bold">{t('badgeLevels.learner.name')}</p>
                            <p className="text-xs text-gray-500">{t('badgeLevels.learner.threshold')}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/30 rounded-lg">
                        <span className="text-2xl">🌟</span>
                        <div>
                            <p className="font-bold">{t('badgeLevels.contributor.name')}</p>
                            <p className="text-xs text-gray-500">{t('badgeLevels.contributor.threshold')}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                        <span className="text-2xl">💎</span>
                        <div>
                            <p className="font-bold">{t('badgeLevels.specialist.name')}</p>
                            <p className="text-xs text-gray-500">{t('badgeLevels.specialist.threshold')}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg">
                        <span className="text-2xl">👑</span>
                        <div>
                            <p className="font-bold">{t('badgeLevels.master.name')}</p>
                            <p className="text-xs text-gray-500">{t('badgeLevels.master.threshold')}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Streak Bonus */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 mb-8">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">🔥 {t('streakBonus')}</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {t('streakDescription')}
                </p>
                <div className="grid grid-cols-7 gap-2">
                    {[
                        { day: 1, bonus: 2 },
                        { day: 2, bonus: 3 },
                        { day: 3, bonus: 4 },
                        { day: 4, bonus: 5 },
                        { day: 5, bonus: 6 },
                        { day: 6, bonus: 8 },
                        { day: 7, bonus: 10 },
                    ].map(({ day, bonus }) => (
                        <div 
                            key={day}
                            className={`flex flex-col items-center p-3 rounded-xl ${
                                day <= currentStreak 
                                    ? 'bg-orange-400 text-white' 
                                    : 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
                            }`}
                        >
                            <span className="text-lg font-bold">{day} {t('day')}</span>
                            <span className="text-sm">+{bonus}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* All Achievements */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    🏆 {t('allAchievements')} ({earnedCount}/{achievements.length})
                </h2>
                <AchievementList achievements={achievements} />
            </div>
        </div>
    );
}
