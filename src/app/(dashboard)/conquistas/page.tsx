import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { calculateAchievements } from '@/lib/achievements';
import { AchievementList } from '@/components/profile/AchievementBadges';
import { getStreakBonus, getStreakEmoji } from '@/types/gamification';
import { getWeekStart } from '@/lib/missions';

export default async function ConquistasPage() {
    const supabase = await createClient();

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
                    ← Voltar ao Dashboard
                </Link>
                <h1 className="text-4xl font-bold text-[#1e40af] mb-2 dark:text-blue-400">
                    Conquistas e Gamificação
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Entenda como funciona o sistema de recompensas do Sintropia
                </p>
            </div>

            {/* Your Progress */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl border border-blue-100 dark:border-blue-800 p-6 mb-8">
                <h2 className="text-xl font-bold text-blue-900 dark:text-blue-200 mb-4">Seu Progresso</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-xl">
                        <span className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{userKarma}</span>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Karma Total</p>
                    </div>
                    <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-xl">
                        <span className="text-3xl font-bold text-orange-600 dark:text-orange-400">{currentStreak}</span>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Dias Seguidos</p>
                    </div>
                    <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-xl">
                        <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">#{ranking}</span>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Ranking</p>
                    </div>
                    <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-xl">
                        <span className="text-3xl font-bold text-purple-600 dark:text-purple-400">{earnedCount}</span>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Conquistas</p>
                    </div>
                </div>
            </div>

            {/* How to Earn Karma */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 mb-8">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Como Ganhar Karma</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Karma é sua reputação na comunidade. Quanto mais contribuições de qualidade, mais pontos você ganha!
                </p>
                <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <span className="w-16 text-center py-1 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-700 dark:text-green-400 font-bold text-sm">+10</span>
                        <span className="text-gray-700 dark:text-gray-300">Criar um post</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <span className="w-16 text-center py-1 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-700 dark:text-green-400 font-bold text-sm">+5</span>
                        <span className="text-gray-700 dark:text-gray-300">Comentar no post de outra pessoa</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <span className="w-16 text-center py-1 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-700 dark:text-green-400 font-bold text-sm">+3</span>
                        <span className="text-gray-700 dark:text-gray-300">Quando alguém curte seu post</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <span className="w-16 text-center py-1 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-700 dark:text-green-400 font-bold text-sm">+2</span>
                        <span className="text-gray-700 dark:text-gray-300">Quando alguém curte seu comentário</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                        <span className="text-xl mr-2">🔥</span>
                        <span className="text-gray-700 dark:text-gray-300">Bônus de streak diário (até +10)</span>
                    </div>
                </div>
            </div>

            {/* Badges */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 mb-8">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Badges por Nível de Karma</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <span className="text-2xl">🥚</span>
                        <div>
                            <p className="font-bold">Novato</p>
                            <p className="text-xs text-gray-500">0+ Karma</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg">
                        <span className="text-2xl">🌱</span>
                        <div>
                            <p className="font-bold">Iniciante</p>
                            <p className="text-xs text-gray-500">10+ Karma</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-teal-50 dark:bg-teal-900/30 rounded-lg">
                        <span className="text-2xl">🌿</span>
                        <div>
                            <p className="font-bold">Aprendiz</p>
                            <p className="text-xs text-gray-500">50+ Karma</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/30 rounded-lg">
                        <span className="text-2xl">🌟</span>
                        <div>
                            <p className="font-bold">Contribuidor</p>
                            <p className="text-xs text-gray-500">100+ Karma</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                        <span className="text-2xl">💎</span>
                        <div>
                            <p className="font-bold">Especialista</p>
                            <p className="text-xs text-gray-500">500+ Karma</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg">
                        <span className="text-2xl">👑</span>
                        <div>
                            <p className="font-bold">Master</p>
                            <p className="text-xs text-gray-500">1000+ Karma</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Streak Bonus */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 mb-8">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">🔥 Bônus de Streak</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Acesse diariamente para ganhar bônus de karma progressivos:
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
                            <span className="text-lg font-bold">{day} dia</span>
                            <span className="text-sm">+{bonus}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* All Achievements */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    🏆 Todas as Conquistas ({earnedCount}/{achievements.length})
                </h2>
                <AchievementList achievements={achievements} />
            </div>
        </div>
    );
}
