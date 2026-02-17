import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export default async function ProfilesPage() {
    const supabase = await createClient();

    // Fetch all profiles with their stats
    const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username, display_name, bio, user_type, karma, created_at')
        .order('karma', { ascending: false })
        .limit(50);

    // Fetch post counts for each profile
    const { data: postCounts } = await supabase
        .from('posts')
        .select('author_id')
        .eq('is_deleted', false);

    // Fetch comment counts for each profile
    const { data: commentCounts } = await supabase
        .from('comments')
        .select('author_id')
        .eq('is_deleted', false);

    // Calculate stats per user
    const postCountByUser = postCounts?.reduce((acc, p) => {
        acc[p.author_id] = (acc[p.author_id] || 0) + 1;
        return acc;
    }, {} as Record<string, number>) || {};

    const commentCountByUser = commentCounts?.reduce((acc, c) => {
        acc[c.author_id] = (acc[c.author_id] || 0) + 1;
        return acc;
    }, {} as Record<string, number>) || {};

    const getBadge = (karma: number) => {
        if (karma >= 1000) return { emoji: '👑', label: 'Master' };
        if (karma >= 500) return { emoji: '💎', label: 'Especialista' };
        if (karma >= 100) return { emoji: '🌟', label: 'Contribuidor' };
        if (karma >= 10) return { emoji: '🌱', label: 'Iniciante' };
        return { emoji: '🥚', label: 'Novato' };
    };

    const getUserTypeLabel = (type: string) => {
        switch (type) {
            case 'company': return '🏢 Empresa';
            case 'ong': return '🤝 ONG';
            case 'government': return '🏛️ Governo';
            default: return '👤 Indivíduo';
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="mb-8">
                <h2 className="text-4xl font-bold text-[#1e40af] mb-2 dark:text-blue-400">
                    Perfis da Comunidade
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                    Explore os membros da comunidade Sintropia e suas contribuições
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {profiles && profiles.length > 0 ? (
                    profiles.map((profile) => {
                        const badge = getBadge(profile.karma || 0);
                        const posts = postCountByUser[profile.id] || 0;
                        const comments = commentCountByUser[profile.id] || 0;

                        return (
                            <div
                                key={profile.id}
                                className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                            >
                                <div className="p-6">
                                    <div className="flex items-start gap-4 mb-4">
                                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                                            {profile.display_name?.substring(0, 2).toUpperCase() || profile.username?.substring(0, 2).toUpperCase() || '??'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-gray-900 dark:text-white truncate">
                                                {profile.display_name || profile.username || 'Usuário'}
                                            </h3>
                                            <p className="text-sm text-gray-500">@{profile.username || 'sem usuario'}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-xs">{badge.emoji}</span>
                                                <span className="text-xs text-gray-500">{badge.label}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {profile.bio && (
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                                            {profile.bio}
                                        </p>
                                    )}

                                    <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
                                            {getUserTypeLabel(profile.user_type || 'individual')}
                                        </span>
                                        <span className="font-bold text-yellow-600">
                                            ⭐ {profile.karma?.toLocaleString() || 0}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                                        <div className="text-center">
                                            <div className="text-lg font-bold text-gray-900 dark:text-white">{posts}</div>
                                            <div className="text-xs text-gray-500">Posts</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-lg font-bold text-gray-900 dark:text-white">{comments}</div>
                                            <div className="text-xs text-gray-500">Comentários</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="px-6 pb-4">
                                    <Link
                                        href={`/feed?author=${profile.username}`}
                                        className="block w-full text-center py-2 px-4 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl text-sm font-semibold hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                                    >
                                        Ver Atividades →
                                    </Link>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="col-span-full text-center py-12">
                        <div className="text-6xl mb-4 opacity-30">👥</div>
                        <h3 className="text-xl font-bold text-gray-400 mb-2">Nenhum perfil encontrado</h3>
                        <p className="text-gray-500">Seja o primeiro a participar da comunidade!</p>
                    </div>
                )}
            </div>

            {profiles && profiles.length >= 50 && (
                <div className="text-center mt-8">
                    <p className="text-gray-500 text-sm">Mostrando os top 50 membros por Karma</p>
                </div>
            )}
        </div>
    );
}
