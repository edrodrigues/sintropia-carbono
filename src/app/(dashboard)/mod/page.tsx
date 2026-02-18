import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ReportsList } from "@/components/mod/ReportsList";
import { UsersList } from "@/components/mod/UsersList";

export default async function ModDashboard() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || !["moderator", "admin"].includes(profile.role)) {
    redirect("/");
  }

  const { data: pendingReports } = await supabase
    .from("reports")
    .select(
      `
      *,
      reporter:profiles!reports_reporter_id_fkey(username)
    `
    )
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(20);

  const { data: resolvedReports } = await supabase
    .from("reports")
    .select(
      `
      *,
      reporter:profiles!reports_reporter_id_fkey(username)
    `
    )
    .neq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(20);

  const { data: recentBans } = await supabase
    .from("bans")
    .select(
      `
      *,
      user:profiles!bans_user_id_fkey(username),
      moderator:profiles!bans_moderator_id_fkey(username)
    `
    )
    .order("created_at", { ascending: false })
    .limit(10);

  const { count: pendingCount } = await supabase
    .from("reports")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending");

  return (
    <div className="container mx-auto px-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Dashboard de Moderação
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Gerencie denúncias e mantenha a comunidade segura
        </p>
      </div>

      <div className="grid gap-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {pendingCount || 0}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Denúncias pendentes
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {resolvedReports?.length || 0}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Denúncias resolvidas
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6 text-purple-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {recentBans?.length || 0}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Banimentos recentes
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                Denúncias Pendentes
              </h2>
              <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs font-bold rounded-full">
                {pendingCount || 0} novas
              </span>
            </div>
            <ReportsList reports={pendingReports || []} />
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                Usários Recentes
              </h2>
            </div>
            <UsersList />
          </div>
        </div>

        {recentBans && recentBans.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                Banimentos Recentes
              </h2>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {recentBans.map((ban) => (
                <div
                  key={ban.id}
                  className="p-4 flex items-center justify-between"
                >
                  <div>
                    <Link href={`/u/${ban.user?.username}`} className="font-medium text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400">
                      @{ban.user?.username || "Usuário banido"}
                    </Link>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {ban.reason || "Sem motivo especificado"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      por <Link href={`/u/${ban.moderator?.username}`} className="hover:text-blue-600 dark:hover:text-blue-400">
                        @{ban.moderator?.username || "Moderador"}
                      </Link>
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {ban.expires_at
                        ? `Expira: ${new Date(ban.expires_at).toLocaleDateString(
                            "pt-BR"
                          )}`
                        : "Permanente"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
