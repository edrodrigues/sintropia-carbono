import Link from "next/link";
import { getMarketByAssetIds } from "@/lib/queries/live-markets";
import { createClient } from "@/lib/supabase/server";
import { Info, Bell, Eye, AlertTriangle } from "lucide-react";
import { formatConvertedPrice } from "@/lib/services/currency-utils";
import { getUserAlerts, getUserWatchlist, getUserMarketNotifications } from "@/lib/queries/user-market-data";
import { AlertToggle } from "./AlertToggle";
import type { ConversionRates } from "@/lib/services/currency-utils";
import type { Database } from "@/types/supabase";

type SnapshotRow = Database["public"]["Views"]["v_market_snapshot"]["Row"];

function formatPrice(item: SnapshotRow, toCurrency: string, rates?: ConversionRates): string {
  if (item.price_display && toCurrency === (item.currency || "USD")) return item.price_display;
  if (item.price !== null) return formatConvertedPrice(item.price, item.currency, toCurrency, rates);
  return "—";
}

function assetTypeLabel(type: string | null) {
  switch (type) {
    case "carbon_credit": return { label: "Carbono", color: "bg-emerald-50 text-emerald-700" };
    case "irec": return { label: "I-REC", color: "bg-sky-50 text-sky-700" };
    default: return { label: type || "Outro", color: "bg-gray-100 text-gray-600" };
  }
}

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return "—";
  const now = new Date();
  const ref = new Date(dateStr);
  const diffMs = now.getTime() - ref.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "agora";
  if (diffMins < 60) return `${diffMins} min atrás`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h atrás`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} dias atrás`;
}

function alertIcon(conditionType: string) {
  if (conditionType.includes("price") || conditionType.includes("above") || conditionType.includes("below")) {
    return { icon: <AlertTriangle className="w-4 h-4 text-amber-600" aria-hidden="true" />, bg: "bg-amber-50" };
  }
  if (conditionType.includes("new") || conditionType.includes("update")) {
    return { icon: <Info className="w-4 h-4 text-sky-600" aria-hidden="true" />, bg: "bg-sky-50" };
  }
  return { icon: <Info className="w-4 h-4 text-gray-600" aria-hidden="true" />, bg: "bg-gray-50" };
}

function notificationColor(type: string | null) {
  switch (type) {
    case "achievement": return "bg-amber-500";
    case "system": return "bg-sky-500";
    default: return "bg-gray-400";
  }
}

export async function WatchlistTab({
  locale = "pt",
  displayCurrency = "USD",
  rates,
}: {
  locale?: string;
  displayCurrency?: string;
  rates?: ConversionRates;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let watchlistAssets: SnapshotRow[] = [];
  let alerts: { id: string; name: string; condition_type: string; is_active: boolean | null }[] = [];
  let notifications: { id?: string; title: string; message: string; type: string | null; created_at: string | null }[] = [];

  if (user) {
    const [watchlistItems, userAlerts, userNotifications] = await Promise.all([
      getUserWatchlist(user.id),
      getUserAlerts(user.id),
      getUserMarketNotifications(user.id, 10),
    ]);

    if (watchlistItems.length > 0) {
      const assetIds = watchlistItems.map((item) => item.asset_id).filter(Boolean) as string[];
      if (assetIds.length > 0) {
        watchlistAssets = await getMarketByAssetIds(assetIds, true);
      }
    }

    alerts = userAlerts;
    notifications = userNotifications;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <Eye className="w-4 h-4 text-gray-400" aria-hidden="true" />
            Watchlist
          </h3>
          <span className="text-xs text-gray-400">{watchlistAssets.length} ativos</span>
        </div>
        {user ? (
          watchlistAssets.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Ativo</th>
                    <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Tipo</th>
                    <th className="text-right px-4 py-2.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Preço atual</th>
                    <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Fonte</th>
                    <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Última atualização</th>
                  </tr>
                </thead>
                <tbody>
                  {watchlistAssets.map((item) => {
                    const type = assetTypeLabel(item.asset_type);
                    return (
                      <tr key={item.asset_id} className="border-b border-gray-50 hover:bg-sky-50/50 transition-colors">
                        <td className="px-4 py-3">
                          <span className="text-sm font-semibold text-gray-900">{item.asset_name}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-0.5 text-[11px] font-semibold rounded-full ${type.color}`}>
                            {type.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="text-sm font-mono font-bold text-gray-900">{formatPrice(item, displayCurrency, rates)}</span>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500">
                          {item.source_name ? (
                            item.source_url ? (
                              <a
                                href={item.source_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                {item.source_name}
                              </a>
                            ) : (
                              item.source_name
                            )
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-400 font-mono hidden sm:table-cell">{timeAgo(item.reference_date)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-6 py-8">
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                  <Eye className="w-6 h-6 text-gray-400" aria-hidden="true" />
                </div>
                <p className="text-sm text-gray-500 font-medium">Sua watchlist está vazia</p>
                <p className="text-xs text-gray-400 text-center max-w-sm">
                  Explore os preços de mercado e adicione ativos à sua lista de acompanhamento
                </p>
              </div>
            </div>
          )
        ) : (
          <div className="px-6 py-8">
            <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 flex gap-3 items-start">
              <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <p className="text-sm text-sky-800 font-medium">
                  Faça login para acompanhar seus ativos favoritos e receber notificações.
                </p>
                <Link
                  href={`/${locale}/login`}
                  className="inline-block mt-2 text-sm font-semibold text-blue-700 hover:underline"
                >
                  Entrar / Registrar →
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <Bell className="w-4 h-4 text-gray-400" aria-hidden="true" />
            Alertas ativos
          </h3>
          <span className="text-xs text-gray-400">{alerts.length} alertas</span>
        </div>
        {user ? (
          alerts.length > 0 ? (
            <div className="divide-y divide-gray-50">
              {alerts.map((alert) => {
                const { icon, bg } = alertIcon(alert.condition_type);
                return (
                  <div key={alert.id} className="px-6 py-3.5 flex items-center gap-3 hover:bg-gray-50/50">
                    <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center shrink-0`}>
                      {icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{alert.name}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">{alert.condition_type}</p>
                    </div>
                    <div className="flex items-center gap-2.5 shrink-0">
                      <span className={`inline-flex px-2 py-0.5 text-[10px] font-semibold rounded-full ${alert.is_active ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                        {alert.is_active ? "Ativo" : "Pausado"}
                      </span>
                      <AlertToggle
                        alertId={alert.id}
                        alertName={alert.name}
                        initialActive={alert.is_active ?? false}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="px-6 py-8">
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                  <Bell className="w-6 h-6 text-gray-400" aria-hidden="true" />
                </div>
                <p className="text-sm text-gray-500 font-medium">Nenhum alerta configurado</p>
                <p className="text-xs text-gray-400 text-center max-w-sm">
                  Crie alertas de preço para ser notificado quando um ativo atingir seu valor desejado
                </p>
              </div>
            </div>
          )
        ) : (
          <div className="px-6 py-8">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                <Bell className="w-6 h-6 text-gray-400" aria-hidden="true" />
              </div>
              <p className="text-sm text-gray-500 font-medium">Faça login para configurar alertas</p>
              <p className="text-xs text-gray-400 text-center max-w-sm">
                Receba notificações quando os preços dos ativos que você acompanha mudarem
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-base font-semibold text-gray-900">Histórico de notificações</h3>
        </div>
        {user ? (
          notifications.length > 0 ? (
            <ol className="divide-y divide-gray-50">
              {notifications.map((item, idx) => (
                <li key={item.id || idx} className="px-6 py-3 flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full ${notificationColor(item.type)} mt-1.5 shrink-0`} aria-hidden="true" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{item.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{item.message}</p>
                  </div>
                  <time className="text-xs text-gray-400 whitespace-nowrap shrink-0" dateTime={item.created_at || undefined}>
                    {item.created_at ? timeAgo(item.created_at) : "—"}
                  </time>
                </li>
              ))}
            </ol>
          ) : (
            <div className="px-6 py-8">
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <p className="text-sm text-gray-500 font-medium">Nenhuma notificação ainda</p>
                <p className="text-xs text-gray-400 text-center max-w-sm">
                  As notificações de atualizações de preços e alertas aparecerão aqui
                </p>
              </div>
            </div>
          )
        ) : (
          <div className="px-6 py-8">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <p className="text-sm text-gray-500 font-medium">Faça login para ver notificações</p>
              <p className="text-xs text-gray-400 text-center max-w-sm">
                Configure alertas e receba notificações sobre mudanças nos preços do mercado
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
