import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { calculateAchievements } from '@/lib/achievements';
import { AchievementList } from '@/components/profile/AchievementBadges';
import { getWeekStart } from '@/lib/missions';
import { getStreakBonus, getStreakEmoji } from '@/types/gamification';
import { StreakBadge } from '@/components/gamification/StreakBadge';
import type { WeeklyMission } from '@/types/gamification';

export default async function DashboardPage() {
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

    // Fetch weekly missions
    const weekStart = getWeekStart();
    const { data: missionsData } = await supabase
        .from('weekly_missions')
        .select('*')
        .eq('user_id', user.id)
        .eq('week_start', weekStart);

    let missions: WeeklyMission[] = missionsData || [];
    
    // Generate dynamic missions if none exist for this week
    if (missions.length === 0) {
        // Get user stats for personalized missions
        const { count: userPostCount } = await supabase
            .from('posts')
            .select('id', { count: 'exact', head: true })
            .eq('author_id', user.id)
            .eq('is_deleted', false);
            
        const { count: userCommentCount } = await supabase
            .from('comments')
            .select('id', { count: 'exact', head: true })
            .eq('author_id', user.id)
            .eq('is_deleted', false);
            
        const karma = profile?.karma || 0;
        const postCount = userPostCount || 0;
        const commentCount = userCommentCount || 0;
        
        // Build dynamic missions
        const newMissions: Array<{
            user_id: string;
            mission_type: string;
            target: number;
            karma_reward: number;
            week_start: string;
            progress?: number;
            completed?: boolean;
        }> = [];
        
        // +1 Post mission
        if (postCount < 50) {
            newMissions.push({
                user_id: user.id,
                mission_type: 'post_1',
                target: 1,
                karma_reward: 15,
                week_start: weekStart,
            });
        }
        
        // +1 Comment mission
        if (commentCount < 100) {
            newMissions.push({
                user_id: user.id,
                mission_type: 'comment_1',
                target: 1,
                karma_reward: 10,
                week_start: weekStart,
            });
        }
        
        // Karma level mission
        const nextKarmaLevel = [10, 50, 100, 500, 1000].find(l => karma < l);
        if (nextKarmaLevel) {
            const karmaNeeded = Math.max(1, nextKarmaLevel - karma);
            newMissions.push({
                user_id: user.id,
                mission_type: 'karma_level',
                target: karmaNeeded,
                karma_reward: 30 + (karmaNeeded * 0.5),
                week_start: weekStart,
            });
        }
        
        // +3 Posts mission
        if (postCount >= 1 && postCount < 100) {
            newMissions.push({
                user_id: user.id,
                mission_type: 'post_3',
                target: 3,
                karma_reward: 40,
                week_start: weekStart,
            });
        }
        
        // +5 Comments mission
        if (commentCount >= 1 && commentCount < 150) {
            newMissions.push({
                user_id: user.id,
                mission_type: 'comment_5',
                target: 5,
                karma_reward: 30,
                week_start: weekStart,
            });
        }
        
        if (newMissions.length > 0) {
            await supabase.from('weekly_missions').insert(newMissions);
        }
        
        const { data: newMissionsData } = await supabase
            .from('weekly_missions')
            .select('*')
            .eq('user_id', user.id)
            .eq('week_start', weekStart);
        
        missions = newMissionsData || [];
    }

    const getBadge = (karma: number) => {
        if (karma >= 1000) return { emoji: '👑', label: 'Master', nextLevel: 2000, color: 'yellow' };
        if (karma >= 500) return { emoji: '💎', label: 'Especialista', nextLevel: 1000, color: 'blue' };
        if (karma >= 100) return { emoji: '🌟', label: 'Contribuidor', nextLevel: 500, color: 'green' };
        if (karma >= 50) return { emoji: '🌿', label: 'Aprendiz', nextLevel: 100, color: 'teal' };
        if (karma >= 10) return { emoji: '🌱', label: 'Iniciante', nextLevel: 50, color: 'emerald' };
        return { emoji: '🥚', label: 'Novato', nextLevel: 10, color: 'gray' };
    };

    const badge = getBadge(userKarma);
    const progressToNext = Math.min((userKarma / badge.nextLevel) * 100, 100);

    const achievements = calculateAchievements(profile || {}, {
        postCount: totalPosts || 0,
        commentCount: totalComments || 0,
        upvotesReceived: 0,
        hasLinkedIn: !!profile?.linkedin_url,
        createdAt: profile?.created_at || new Date().toISOString(),
        karma: userKarma,
    });

    return (
        <div className="max-w-5xl mx-auto py-12 px-4">
            <div className="mb-8">
                <h2 className="text-4xl font-bold text-[#1e40af] mb-2 dark:text-blue-400">
                    Minha Página
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                    Sua jornada na comunidade Sintropia
                </p>
            </div>

            {/* Profile & Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="md:col-span-2 bg-gradient-to-br from-[#1e40af] to-blue-700 p-6 rounded-2xl text-white shadow-lg">
                    <Link href={`/u/${profile?.username}`} className="flex items-center gap-4 hover:opacity-90 transition-opacity">
                        <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-2xl font-bold">
                            {profile?.display_name?.substring(0, 2).toUpperCase() || user.email?.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-xl font-bold truncate">{profile?.display_name || profile?.username || 'Usuário'}</h3>
                            <p className="text-blue-200">@{profile?.username || 'sem usuário'}</p>
                        </div>
                        <div className="text-right">
                            <span className="text-3xl">{badge.emoji}</span>
                            <p className="text-xs text-blue-200">{badge.label}</p>
                        </div>
                    </Link>
                    <div className="mt-6">
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-blue-200">Karma</span>
                            <span className="font-bold">{userKarma.toLocaleString()} / {badge.nextLevel}</span>
                        </div>
                        <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-white rounded-full transition-all"
                                style={{ width: `${progressToNext}%` }}
                            />
                        </div>
                        <p className="text-xs text-blue-200 mt-1">
                            {Math.round(progressToNext)}% para próximo nível
                        </p>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-xl">📝</div>
                        <h3 className="text-xs font-bold text-gray-400 uppercase">Posts</h3>
                    </div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">{totalPosts || 0}</div>
                    <p className="text-xs text-gray-500 mt-1">publicados</p>
                </div>

                <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-xl">💬</div>
                        <h3 className="text-xs font-bold text-gray-400 uppercase">Comentários</h3>
                    </div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">{totalComments || 0}</div>
                    <p className="text-xs text-gray-500 mt-1">realizados</p>
                </div>
            </div>

            {/* Streak Card - Destaque */}
            <div className="bg-gradient-to-br from-orange-50 via-yellow-50 to-amber-50 dark:from-orange-900/30 dark:via-yellow-900/20 dark:to-amber-900/30 rounded-2xl border-2 border-orange-300 dark:border-orange-700 p-6 mb-8">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
                            <span className="text-3xl">{getStreakEmoji(currentStreak)}</span>
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-orange-900 dark:text-orange-200">
                                {currentStreak} dias seguidos
                            </h3>
                            <p className="text-sm text-orange-700 dark:text-orange-300">
                                Recorde: {longestStreak} dias
                            </p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-orange-600 dark:text-orange-400">Bônus de hoje</p>
                        <p className="text-3xl font-black text-green-600 dark:text-green-400">+{getStreakBonus(currentStreak + 1)}</p>
                    </div>
                </div>
                
                {/* Progress bar dos dias */}
                <div className="mb-4">
                    <div className="flex justify-between text-xs text-orange-600 dark:text-orange-400 mb-2">
                        <span>Progresso da semana</span>
                        <span>{currentStreak}/7 dias</span>
                    </div>
                    <div className="w-full h-3 bg-orange-200 dark:bg-orange-800 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-gradient-to-r from-orange-400 to-yellow-400 rounded-full transition-all"
                            style={{ width: `${Math.min((currentStreak / 7) * 100, 100)}%` }}
                        />
                    </div>
                </div>
                
                {/* Dias da semana com bônus */}
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
                            className={`flex flex-col items-center p-2 rounded-xl transition-all ${
                                day <= currentStreak 
                                    ? 'bg-orange-400 text-white' 
                                    : day === currentStreak + 1
                                        ? 'bg-yellow-400 text-orange-900 animate-pulse'
                                        : 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
                            }`}
                        >
                            <span className="text-xs font-bold">{day}</span>
                            <span className="text-[10px]">+{bonus}</span>
                        </div>
                    ))}
                </div>
                
                {currentStreak >= 7 && (
                    <div className="mt-4 p-3 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-xl text-center">
                        <span className="font-bold text-white">🎉 streak Semanal Completo! Continue para manter o bônus!</span>
                    </div>
                )}
            </div>

            {/* Summary Card - Extended */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 mb-8">
                <div className="flex items-center gap-2 mb-4">
                    <span className="text-xl">⚡</span>
                    <h3 className="font-bold text-gray-900 dark:text-white">Resumo</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex flex-col items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                        <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">#{ranking}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">Ranking</span>
                    </div>
                    <div className="flex flex-col items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                        <span className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{userKarma.toLocaleString()}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">Karma</span>
                    </div>
                    <div className="flex flex-col items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                        <span className="text-2xl">{badge.emoji}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{badge.label}</span>
                    </div>
                    <div className="flex flex-col items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                        <span className="text-2xl font-bold text-green-600 dark:text-green-400">{totalPosts || 0}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">Posts</span>
                    </div>
                    <div className="flex flex-col items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                        <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">{totalComments || 0}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">Comentários</span>
                    </div>
                    <div className="flex flex-col items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                        <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">{currentStreak}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">Dias Seguidos</span>
                    </div>
                    <div className="flex flex-col items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                        <span className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">{longestStreak}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">Recorde</span>
                    </div>
                    <div className="flex flex-col items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                        <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{badge.nextLevel - userKarma}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">Para próximo</span>
                    </div>
                </div>
            </div>

            {/* Gamification Card */}
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-2xl border border-yellow-100 dark:border-yellow-800/50 p-6 mb-8">
                <div className="flex items-center gap-2 mb-6">
                    <span className="text-2xl">⭐</span>
                    <h3 className="text-xl font-bold text-yellow-900 dark:text-yellow-200">Como Funciona a Gamificação</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <p className="text-yellow-800 dark:text-yellow-300 mb-4">
                            Karma é sua reputação na comunidade. Quanto mais contribuições de qualidade, mais pontos você ganha!
                        </p>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <span className="w-16 text-center py-1 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-700 dark:text-green-400 font-bold text-sm">+10</span>
                                <span className="text-yellow-800 dark:text-yellow-300 text-sm">Criar um post</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="w-16 text-center py-1 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-700 dark:text-green-400 font-bold text-sm">+5</span>
                                <span className="text-yellow-800 dark:text-yellow-300 text-sm">Comentar no post de outra pessoa</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="w-16 text-center py-1 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-700 dark:text-green-400 font-bold text-sm">+3</span>
                                <span className="text-yellow-800 dark:text-yellow-300 text-sm">Quando alguém curte seu post</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="w-16 text-center py-1 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-700 dark:text-green-400 font-bold text-sm">+2</span>
                                <span className="text-yellow-800 dark:text-yellow-300 text-sm">Quando alguém curte seu comentário</span>
                            </div>
                            <div className="flex items-center gap-3 pt-2 border-t border-yellow-200 dark:border-yellow-700">
                                <span className="w-16 text-center py-1 bg-red-100 dark:bg-red-900/30 rounded-lg text-red-700 dark:text-red-400 font-bold text-sm">-3</span>
                                <span className="text-yellow-800 dark:text-yellow-300 text-sm">Quando alguém descurte seu post</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="w-16 text-center py-1 bg-red-100 dark:bg-red-900/30 rounded-lg text-red-700 dark:text-red-400 font-bold text-sm">-2</span>
                                <span className="text-yellow-800 dark:text-yellow-300 text-sm">Quando alguém descurte seu comentário</span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <p className="font-semibold text-yellow-900 dark:text-yellow-200 mb-3">Badges por nível de Karma:</p>
                        <div className="flex flex-wrap gap-2">
                            <span className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm">🥚 0+ Novato</span>
                            <span className="px-3 py-1.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-sm">🌱 10+ Iniciante</span>
                            <span className="px-3 py-1.5 bg-teal-100 dark:bg-teal-900/30 rounded-lg text-sm">🌿 50+ Aprendiz</span>
                            <span className="px-3 py-1.5 bg-green-100 dark:bg-green-900/30 rounded-lg text-sm">🌟 100+ Contribuidor</span>
                            <span className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-sm">💎 500+ Especialista</span>
                            <span className="px-3 py-1.5 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg text-sm">👑 1000+ Master</span>
                        </div>
                        <div className="mt-4 pt-4 border-t border-yellow-200 dark:border-yellow-800/50">
                            <p className="text-sm text-yellow-800 dark:text-yellow-300">
                                <strong>Seu ranking atual:</strong> #{ranking} no geral
                            </p>
                            <Link href="/leaderboard" className="inline-block mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline">
                                Ver ranking completo →
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Achievements Section */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 mb-8">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">🏆</span>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Conquistas</h3>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-500">
                            {achievements.filter(a => a.earned).length} / {achievements.length} conquistadas
                        </span>
                        <Link href="/conquistas" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                            Ver todas →
                        </Link>
                    </div>
                </div>
                <AchievementList achievements={achievements} maxVisible={6} />
            </div>

            {/* Contribution Section */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl border border-green-100 dark:border-green-800/50 p-6">
                <div className="flex items-center gap-2 mb-4">
                    <span className="text-2xl">🚀</span>
                    <h3 className="text-xl font-bold text-green-900 dark:text-green-200">Como Contribuir</h3>
                </div>

                <p className="text-green-800 dark:text-green-300 mb-6">
                    O Sintropia é um projeto colaborativo de código aberto. Sua contribuição ajuda a tornar o mercado de carbono mais transparente e acessível.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-xl">
                        <span className="text-xl">📝</span>
                        <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Compartilhe conhecimento</h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Publique posts e comente na comunidade</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-xl">
                        <span className="text-xl">💡</span>
                        <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Ajude novatos</h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Responda dúvidas e colabore</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-xl">
                        <span className="text-xl">📊</span>
                        <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Reportar dados</h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Informe dados incorretos do mercado</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-xl">
                        <span className="text-xl">💻</span>
                        <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Contribua com código</h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Fork no GitHub e envie PRs</p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap gap-3">
                    <Link 
                        href="/contribuir" 
                        className="px-5 py-2.5 bg-[#1e40af] hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors"
                    >
                        Ver como contribuir
                    </Link>
                    <a 
                        href="https://github.com/edrodrigues/sintropia-carbono"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-5 py-2.5 bg-gray-900 dark:bg-gray-700 hover:bg-gray-800 dark:hover:bg-gray-600 text-white text-sm font-bold rounded-xl transition-colors flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.1.27.253-.446-098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
                        </svg>
                        GitHub
                    </a>
                </div>
            </div>
        </div>
    );
}
