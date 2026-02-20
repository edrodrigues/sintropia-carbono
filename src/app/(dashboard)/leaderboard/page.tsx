import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Tooltip } from "@/components/ui/Tooltip";

export default async function LeaderboardPage() {
  const supabase = await createClient();

  const { data: users } = await supabase
    .from("profiles")
    .select("username, display_name, karma, avatar_url")
    .order("karma", { ascending: false })
    .limit(50);

  const getRankStyle = (rank: number) => {
    if (rank === 1) return "bg-yellow-50/50 dark:bg-yellow-900/10 border-l-4 border-l-yellow-400";
    if (rank === 2) return "bg-gray-50/50 dark:bg-gray-800/30 border-l-4 border-l-gray-300";
    if (rank === 3) return "bg-orange-50/50 dark:bg-orange-900/10 border-l-4 border-l-orange-400";
    return "";
  };

  const getMedal = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return `#${rank}`;
  };

  const getBadges = (karma: number) => {
    const badges = [];
    if (karma >= 1000) badges.push("👑 Master");
    else if (karma >= 500) badges.push("💎 Especialista");
    else if (karma >= 100) badges.push("🌟 Contribuidor");
    else if (karma >= 50) badges.push("🌿 Aprendiz");
    else if (karma >= 10) badges.push("🌱 Iniciante");
    return badges;
  };

  return (
    <div className="max-w-7xl mx-auto px-8 lg:px-16">
      <div className="mb-12">
        <h1 className="text-5xl font-black text-gray-900 dark:text-gray-100 mb-4 tracking-tight">
          Ranking dos Mais Ativos
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl leading-relaxed">
          Os membros mais ativos que contribuem para a comunidade.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                <th className="px-8 py-6 text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">
                  Rank
                </th>
                <th className="px-8 py-6 text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">
                  Usuário
                </th>
                <th className="px-8 py-6 text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">
                  Conquistas
                </th>
                <th className="px-8 py-6 text-right text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">
                  <Tooltip content="Pontos ganhos com contribuições na comunidade">
                    Pontos
                  </Tooltip>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
              {users?.map((user, index) => {
                const rank = index + 1;
                const badges = getBadges(user.karma || 0);

                return (
                  <tr
                    key={user.username}
                    className={`group transition-all hover:bg-blue-50/30 dark:hover:bg-blue-900/10 ${getRankStyle(rank)}`}
                  >
                    <td className="px-8 py-6">
                      <span className={`text-2xl font-black ${rank <= 3 ? "" : "text-gray-300 dark:text-gray-600 font-mono"}`}>
                        {getMedal(rank)}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <Link href={`/u/${user.username}`} className="flex items-center gap-4 hover:opacity-80 transition-opacity">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 p-0.5 shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                          <div className="w-full h-full rounded-[0.9rem] bg-white dark:bg-gray-900 flex items-center justify-center text-blue-600 font-black text-lg">
                            {user.avatar_url ? (
                              <>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={user.avatar_url} alt={user.username} className="w-full h-full rounded-[0.9rem] object-cover" />
                              </>
                            ) : (
                              (user.display_name || user.username).substring(0, 2).toUpperCase()
                            )}
                          </div>
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 dark:text-gray-100 text-lg">
                            {user.display_name || user.username}
                          </p>
                          <p className="text-sm text-gray-500">@{user.username}</p>
                        </div>
                      </Link>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-wrap gap-2">
                        {badges.length > 0 ? (
                          badges.map((badge) => (
                            <span
                              key={badge}
                              className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-[10px] font-black uppercase tracking-wider rounded-lg border border-gray-200 dark:border-gray-700"
                            >
                              {badge}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-400 text-xs italic">Sem conquistas ainda</span>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <span className="text-2xl font-black text-blue-600 dark:text-blue-400 tabular-nums">
                        {(user.karma || 0).toLocaleString()}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {(!users || users.length === 0) && (
            <div className="text-center py-24">
              <div className="text-6xl mb-6 opacity-20">🌫️</div>
              <h3 className="text-xl font-bold text-gray-400">Nenhum dado disponível</h3>
              <p className="text-gray-500">Comece a participar para aparecer no ranking!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
