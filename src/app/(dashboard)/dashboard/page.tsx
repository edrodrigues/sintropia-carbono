import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function DashboardPage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Fetch user profile with stats
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    // Fetch user's posts
    const { data: userPosts } = await supabase
        .from('posts')
        .select('id, title, category, karma, comment_count, created_at')
        .eq('author_id', user.id)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
        .limit(5);

    // Fetch user's comments
    const { data: userComments } = await supabase
        .from('comments')
        .select('id, content, post_id, karma, created_at')
        .eq('author_id', user.id)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
        .limit(5);

    // Fetch user's votes
    const { data: userVotes } = await supabase
        .from('votes')
        .select('target_id, target_type, vote_type, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

    // Calculate stats
    const totalPosts = userPosts?.length || 0;
    const totalComments = userComments?.length || 0;
    const userKarma = profile?.karma || 0;

    // Get badge based on karma
    const getBadge = (karma: number) => {
        if (karma >= 1000) return { emoji: '👑', label: 'Master', color: 'yellow' };
        if (karma >= 500) return { emoji: '💎', label: 'Especialista', color: 'blue' };
        if (karma >= 100) return { emoji: '🌟', label: 'Contribuidor', color: 'green' };
        if (karma >= 10) return { emoji: '🌱', label: 'Iniciante', color: 'emerald' };
        return { emoji: '🥚', label: 'Novato', color: 'gray' };
    };

    const badge = getBadge(userKarma);

    return (
        <div className="max-w-7xl mx-auto py-12 px-4">
            <div className="mb-8">
                <h2 className="text-4xl font-bold text-[#1e40af] mb-2 dark:text-blue-400">
                    Meu Dashboard
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                    Acompanhe sua atividade na comunidade Sintropia Carbono
                </p>
            </div>

            {/* Karma & Profile Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="md:col-span-2 bg-gradient-to-br from-[#1e40af] to-blue-700 p-6 rounded-2xl text-white shadow-lg">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-3xl font-bold">
                            {profile?.display_name?.substring(0, 2).toUpperCase() || user.email?.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                            <h3 className="text-xl font-bold">{profile?.display_name || profile?.username || 'Usuário'}</h3>
                            <p className="text-blue-200">@{profile?.username || 'sem usuario'}</p>
                        </div>
                    </div>
                    <div className="mt-6 flex items-center gap-3">
                        <span className="text-4xl">{badge.emoji}</span>
                        <div>
                            <div className="text-3xl font-black">{userKarma.toLocaleString()}</div>
                            <div className="text-blue-200 text-sm">Karma Total</div>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">📝</div>
                        <h3 className="text-sm font-bold text-gray-400 uppercase">Posts</h3>
                    </div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">{totalPosts}</div>
                    <p className="text-xs text-gray-500 mt-1">publicados</p>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">💬</div>
                        <h3 className="text-sm font-bold text-gray-400 uppercase">Comentários</h3>
                    </div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">{totalComments}</div>
                    <p className="text-xs text-gray-500 mt-1">realizados</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Activity Column */}
                <div className="lg:col-span-2 space-y-6">
                    {/* User's Posts */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                            <h3 className="font-bold text-gray-900 dark:text-white">Meus Posts</h3>
                            <Link href="/feed" className="text-sm text-blue-600 hover:underline">Ver todos →</Link>
                        </div>
                        <div className="divide-y divide-gray-50 dark:divide-gray-700">
                            {userPosts && userPosts.length > 0 ? (
                                userPosts.map((post) => (
                                    <div key={post.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <Link href={`/feed#post-${post.id}`} className="font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 block truncate">
                                                    {post.title}
                                                </Link>
                                                <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                                                    <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-full uppercase">{post.category}</span>
                                                    <span>•</span>
                                                    <span>{new Date(post.created_at).toLocaleDateString('pt-BR')}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 text-sm">
                                                <span className="text-orange-600 font-bold">⬆ {post.karma}</span>
                                                <span className="text-gray-500">💬 {post.comment_count}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-8 text-center">
                                    <div className="text-4xl mb-3 opacity-30">📝</div>
                                    <p className="text-gray-500">Você ainda não criou nenhum post</p>
                                    <Link href="/feed" className="mt-2 inline-block text-blue-600 hover:underline text-sm">Criar primeiro post</Link>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* User's Comments */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                            <h3 className="font-bold text-gray-900 dark:text-white">Meus Comentários</h3>
                            <Link href="/feed" className="text-sm text-blue-600 hover:underline">Ver todos →</Link>
                        </div>
                        <div className="divide-y divide-gray-50 dark:divide-gray-700">
                            {userComments && userComments.length > 0 ? (
                                userComments.map((comment) => (
                                    <div key={comment.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <p className="text-gray-700 dark:text-gray-300 text-sm line-clamp-2">{comment.content}</p>
                                        <div className="flex items-center justify-between mt-2">
                                            <Link href={`/feed#post-${comment.post_id}`} className="text-xs text-blue-600 hover:underline">
                                                Ver no post →
                                            </Link>
                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                <span className={comment.karma >= 0 ? 'text-orange-600' : 'text-blue-600'}>
                                                    {comment.karma >= 0 ? '⬆' : '⬇'} {Math.abs(comment.karma)}
                                                </span>
                                                <span>•</span>
                                                <span>{new Date(comment.created_at).toLocaleDateString('pt-BR')}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-8 text-center">
                                    <div className="text-4xl mb-3 opacity-30">💬</div>
                                    <p className="text-gray-500">Você ainda não comentou nada</p>
                                    <Link href="/feed" className="mt-2 inline-block text-blue-600 hover:underline text-sm">Participar da discussão</Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Karma Education Card */}
                    <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-2xl border border-yellow-100 dark:border-yellow-800/50 p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-2xl">⭐</span>
                            <h3 className="font-bold text-yellow-900 dark:text-yellow-200">Como funciona o Karma?</h3>
                        </div>

                        <div className="space-y-4 text-sm">
                            <p className="text-yellow-800 dark:text-yellow-300">
                                Karma é sua reputação na comunidade. Quanto mais contribuições de qualidade, mais Karma você ganha!
                            </p>

                            <div className="space-y-2">
                                <div className="flex items-start gap-2">
                                    <span className="text-orange-500 font-bold">⬆</span>
                                    <div>
                                        <span className="font-semibold text-yellow-900 dark:text-yellow-200">+10</span>
                                        <span className="text-yellow-700 dark:text-yellow-400"> quando alguém curte seu post</span>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2">
                                    <span className="text-orange-500 font-bold">⬆</span>
                                    <div>
                                        <span className="font-semibold text-yellow-900 dark:text-yellow-200">+5</span>
                                        <span className="text-yellow-700 dark:text-yellow-400"> quando alguém curte seu comentário</span>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2">
                                    <span className="text-blue-500 font-bold">⬇</span>
                                    <div>
                                        <span className="font-semibold text-yellow-900 dark:text-yellow-200">-2</span>
                                        <span className="text-yellow-700 dark:text-yellow-400"> quando alguém descurte</span>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-3 border-t border-yellow-200 dark:border-yellow-800/50">
                                <p className="font-semibold text-yellow-900 dark:text-yellow-200 mb-2">Badges:</p>
                                <div className="flex flex-wrap gap-2">
                                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs">🥚 0+ Novato</span>
                                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs">🌱 10+ Iniciante</span>
                                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs">🌟 100+ Contribuidor</span>
                                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs">💎 500+ Especialista</span>
                                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs">👑 1000+ Master</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-4">Ações Rápidas</h3>
                        <div className="space-y-2">
                            <Link href="/feed" className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                <span className="text-xl">📝</span>
                                <span className="text-gray-700 dark:text-gray-300">Criar novo post</span>
                            </Link>
                            <Link href="/leaderboard" className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                <span className="text-xl">🏆</span>
                                <span className="text-gray-700 dark:text-gray-300">Ver ranking</span>
                            </Link>
                            <Link href="/profile" className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                <span className="text-xl">👤</span>
                                <span className="text-gray-700 dark:text-gray-300">Editar perfil</span>
                            </Link>
                        </div>
                    </div>

                    {/* Profile Completion */}
                    {(!profile?.username || !profile?.display_name) && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-2xl border border-blue-100 dark:border-blue-800/50">
                            <h3 className="font-bold text-blue-900 dark:text-blue-200 mb-2">Complete seu perfil</h3>
                            <p className="text-blue-700 dark:text-blue-300 text-sm mb-4">
                                Adicione um nome de usuário para participar da comunidade.
                            </p>
                            <Link href="/profile" className="block text-center px-4 py-2 bg-[#1e40af] text-white font-bold rounded-xl hover:bg-blue-700 transition-colors">
                                Completar Perfil
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
