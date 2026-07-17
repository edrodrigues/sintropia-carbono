import { getMarketSnapshot, getPriceChanges } from "@/lib/queries/live-markets";
import { getMarketOverviewStats } from "@/lib/queries/live-markets";
import { convertPrice, getCurrencySymbol, formatConvertedPrice } from "@/lib/services/currency-utils";
import { createClient } from "@/lib/supabase/server";
import { getUserMarketNotifications } from "@/lib/queries/user-market-data";
import type { ConversionRates } from "@/lib/services/currency-utils";
import type { Database } from "@/types/supabase";

type SnapshotRow = Database["public"]["Views"]["v_market_snapshot"]["Row"];
type PriceChangeRow = Database["public"]["Views"]["v_price_changes"]["Row"];

function assetTypeLabel(type: string | null) {
  switch (type) {
    case "carbon_credit": return { label: "Carbono", color: "bg-emerald-50 text-emerald-700" };
    case "irec": return { label: "I-REC", color: "bg-sky-50 text-sky-700" };
    case "go": return { label: "GO", color: "bg-sky-50 text-sky-700" };
    case "cbio": return { label: "CBIO", color: "bg-amber-50 text-amber-700" };
    default: return { label: type || "Outro", color: "bg-gray-100 text-gray-600" };
  }
}

function referenceBadge(type: string | null) {
  switch (type) {
    case "trade": return { label: "Negócio realizado", color: "bg-emerald-50 text-emerald-700" };
    case "bid": return { label: "Bid", color: "bg-sky-50 text-sky-700" };
    case "ask": return { label: "Ask", color: "bg-sky-50 text-sky-700" };
    case "closing": return { label: "Fechamento", color: "bg-gray-100 text-gray-600" };
    case "indicative": return { label: "Indicativo", color: "bg-gray-100 text-gray-600" };
    default: return { label: "—", color: "bg-gray-100 text-gray-600" };
  }
}

function formatPrice(item: SnapshotRow, toCurrency: string, rates?: ConversionRates): string {
  if (item.price_display && toCurrency === (item.currency || "USD")) return item.price_display;
  if (item.price !== null) return formatConvertedPrice(item.price, item.currency, toCurrency, rates);
  if (item.price_low !== null && item.price_high !== null) {
    if (rates && item.currency && item.currency !== toCurrency) {
      const low = convertPrice(Number(item.price_low), item.currency, toCurrency, rates);
      const high = convertPrice(Number(item.price_high), item.currency, toCurrency, rates);
      const sym = getCurrencySymbol(toCurrency);
      return `${sym}${low.toFixed(2)} - ${sym}${high.toFixed(2)}`;
    }
    return `${item.price_low} - ${item.price_high}`;
  }
  return "—";
}

function formatAvgPrice(
  byCurr: Record<string, { avg: number; count: number }> | undefined,
  toCurrency: string,
  rates?: ConversionRates,
): string {
  if (!byCurr || Object.keys(byCurr).length === 0) return "—";
  let totalCount = 0;
  let weightedSum = 0;
  for (const [fromCurr, { avg, count }] of Object.entries(byCurr)) {
    const converted = convertPrice(avg, fromCurr, toCurrency, rates);
    weightedSum += converted * count;
    totalCount += count;
  }
  const weightedAvg = weightedSum / totalCount;
  const sym = getCurrencySymbol(toCurrency);
  return `${sym}${weightedAvg.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 4 })}`;
}

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return "—";
  const now = new Date();
  const ref = new Date(dateStr);
  const diffMs = now.getTime() - ref.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "agora";
  if (diffMins < 60) return `${diffMins} min`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d`;
}

export async function OverviewTab({
  locale: _locale,
  displayCurrency = "USD",
  rates,
}: {
  locale: string;
  displayCurrency?: string;
  rates?: ConversionRates;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const snapshot = await getMarketSnapshot(true);
  const recentAssetIds = snapshot.map((a) => a.asset_id).filter(Boolean) as string[];
  const idParam = recentAssetIds.length > 0 ? recentAssetIds : undefined;
  const [stats, changes, notifications] = await Promise.all([
    getMarketOverviewStats(idParam),
    getPriceChanges(idParam),
    user ? getUserMarketNotifications(user.id, 5) : Promise.resolve([]),
  ]);

  const topMovers = changes.filter((c) => c.change_pct !== null).slice(0, 8);
  const allAssets = snapshot.filter((a) => a.price !== null).slice(0, 20);

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="flex-1 min-w-0 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            label="Ativos com preço"
            value={String(stats.totalAssets)}
            sub="referências ativas"
            color="text-emerald-600"
          />
          <KPICard
            label="Créditos Carbono"
            value={formatAvgPrice((stats as any).avgCarbonByCurr, displayCurrency, rates)}
            sub={`${displayCurrency} / tCO2e (média)`}
            change={stats.carbonChange}
            color="text-emerald-600"
          />
          <KPICard
            label="I-REC"
            value={formatAvgPrice((stats as any).avgIrecByCurr, displayCurrency, rates)}
            sub={`${displayCurrency} / MWh (média)`}
            change={stats.irecChange}
            color="text-sky-600"
          />
          <KPICard
            label="Última atualização"
            value={stats.lastUpdate ? new Date(stats.lastUpdate).toLocaleDateString("pt-BR") : "—"}
            sub="fonte mais recente"
            color="text-gray-600"
          />
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-base font-semibold text-gray-900">
              Movimentações do mercado
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">Ativos com maior variação de preço</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Ativo</th>
                  <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Tipo</th>
                  <th className="text-right px-4 py-2.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Preço</th>
                  <th className="text-right px-4 py-2.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Variação</th>
                  <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Fonte</th>
                  <th className="text-right px-4 py-2.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Atualizado</th>
                </tr>
              </thead>
              <tbody>
                {topMovers.map((m) => {
                  const type = assetTypeLabel(m.asset_type);
                  const pct = m.change_pct !== null ? Number(m.change_pct) : null;
                  return (
                    <tr key={m.asset_id} className="border-b border-gray-50 hover:bg-sky-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <span className="text-sm font-semibold text-gray-900">{m.asset_name}</span>
                        <span className="block text-[11px] text-gray-400">{m.country || m.technology || ""}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 text-[11px] font-semibold rounded-full ${type.color}`}>
                          {type.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-sm font-mono font-bold text-gray-900">{formatConvertedPrice(m.current_price, m.currency, displayCurrency, rates)}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {pct !== null ? (
                          <span className={`text-sm font-mono font-bold ${pct >= 0 ? "text-emerald-700" : "text-red-700"}`}>
                            {pct >= 0 ? "+" : ""}{pct.toFixed(1)}%
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 hidden md:table-cell">
                        {m.country || m.technology || "—"}
                      </td>
                      <td className="px-4 py-3 text-right text-xs text-gray-400 font-mono hidden md:table-cell">
                        {m.current_date ? timeAgo(m.current_date) : "—"}
                      </td>
                    </tr>
                  );
                })}
                {topMovers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                          </svg>
                        </div>
                        <p className="text-sm text-gray-500 font-medium">Nenhuma movimentação disponível</p>
                        <p className="text-xs text-gray-400">Os dados de movimentação do mercado aparecerão aqui quando houver atualizações</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-base font-semibold text-gray-900">Referências de preço</h3>
            <p className="text-xs text-gray-500 mt-0.5">Todas as referências de mercado disponíveis</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Ativo</th>
                  <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Tipo</th>
                  <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Registro</th>
                  <th className="text-right px-4 py-2.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Preço</th>
                  <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Geografia</th>
                  <th className="text-right px-4 py-2.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Atualizado</th>
                </tr>
              </thead>
              <tbody>
                {allAssets.map((item) => {
                  const type = assetTypeLabel(item.asset_type);
                  const refType = referenceBadge(item.reference_type);
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
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {item.registry && (
                            <span className="inline-flex px-1.5 py-0.5 text-[10px] font-medium bg-gray-100 text-gray-600 rounded">
                              {item.registry}
                            </span>
                          )}
                          <span className={`inline-flex px-1.5 py-0.5 text-[10px] font-semibold rounded-full ${refType.color}`}>
                            {refType.label}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-sm font-mono font-bold text-emerald-600">{formatPrice(item, displayCurrency, rates)}</span>
                        <span className="block text-[10px] text-gray-400">{item.currency || "—"} / {item.unit || "—"}</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600 hidden sm:table-cell">
                        {item.country || item.technology || "—"}
                      </td>
                      <td className="px-4 py-3 text-right text-xs text-gray-400 font-mono hidden md:table-cell">
                        {item.reference_date || "—"}
                      </td>
                    </tr>
                  );
                })}
                {allAssets.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <p className="text-sm text-gray-500 font-medium">Nenhuma referência de preço disponível</p>
                        <p className="text-xs text-gray-400">As referências de mercado serão exibidas aqui quando os dados estiverem disponíveis</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <aside className="w-full lg:w-72 shrink-0 space-y-4">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <h4 className="text-sm font-semibold text-gray-900">Alertas</h4>
          </div>
          {notifications.length > 0 ? (
            <div className="px-4 py-3 space-y-3">
              {notifications.slice(0, 3).map((notification) => (
                <div key={notification.id} className="flex items-start gap-2.5">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                    notification.type === "achievement" ? "bg-amber-50" : "bg-sky-50"
                  }`}>
                    {notification.type === "achievement" ? (
                      <svg className="w-3.5 h-3.5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ) : (
                      <svg className="w-3.5 h-3.5 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-gray-800 truncate">{notification.title}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{notification.created_at ? timeAgo(notification.created_at) : "—"}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-4 py-6">
              <div className="flex flex-col items-center gap-2">
                <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <p className="text-[11px] text-gray-400 text-center">
                  {user ? "Nenhum alerta recente" : "Faça login para ver alertas"}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <h4 className="text-sm font-semibold text-gray-900">Watchlist</h4>
          </div>
          <div className="px-4 py-3 space-y-3">
            {snapshot.slice(0, 4).map((item) => (
              <div key={item.asset_id} className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-gray-900 truncate">{item.asset_name}</p>
                  <p className="text-[10px] text-gray-400">{item.registry || item.country || "—"}</p>
                </div>
                <span className="text-xs font-mono font-bold text-gray-900 ml-2 shrink-0">
                  {formatPrice(item, displayCurrency, rates)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}

function KPICard({
  label,
  value,
  sub,
  change,
  color,
}: {
  label: string;
  value: string;
  sub?: string;
  change?: number | null;
  color?: string;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
      <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-2">{label}</p>
      <p className={`text-2xl font-bold font-mono ${color || "text-gray-900"}`}>{value}</p>
      {change !== null && change !== undefined && (
        <p className={`text-xs font-semibold mt-1 ${change >= 0 ? "text-emerald-700" : "text-red-700"}`}>
          {change >= 0 ? "↑" : "↓"} {change >= 0 ? "+" : ""}{change.toFixed(1)}% média
        </p>
      )}
      {sub && <p className="text-[11px] text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}
