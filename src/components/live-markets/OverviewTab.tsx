import { getMarketSnapshot, getPriceChanges } from "@/lib/queries/live-markets";
import { getMarketOverviewStats } from "@/lib/queries/live-markets";
import { convertPrice, getCurrencySymbol, formatConvertedPrice } from "@/lib/services/currency-converter";
import type { ConversionRates } from "@/lib/services/currency-converter";
import type { Database } from "@/types/supabase";

type SnapshotRow = Database["public"]["Views"]["v_market_snapshot"]["Row"];

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

function convertStatPrice(value: string, toCurrency: string, rates?: ConversionRates): string {
  if (value === "—" || !value.startsWith("$")) return value;
  const num = parseFloat(value.replace("$", "").replace(",", "."));
  if (isNaN(num)) return value;
  return formatConvertedPrice(num, "USD", toCurrency, rates);
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
  const snapshot = await getMarketSnapshot(true);
  const recentAssetIds = snapshot.map((a) => a.asset_id).filter(Boolean) as string[];
  const idParam = recentAssetIds.length > 0 ? recentAssetIds : undefined;
  const [stats, changes] = await Promise.all([
    getMarketOverviewStats(idParam),
    getPriceChanges(idParam),
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
            value={convertStatPrice(stats.avgCarbonPrice, displayCurrency, rates)}
            sub={`${displayCurrency} / tCO2e (média)`}
            change={stats.carbonChange}
            color="text-emerald-600"
          />
          <KPICard
            label="I-REC"
            value={convertStatPrice(stats.avgIrecPrice, displayCurrency, rates)}
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
                        <span className="text-sm font-mono font-bold text-gray-900">{m.current_display || "—"}</span>
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
                    <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-400">
                      Nenhuma movimentação disponível
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
          <div className="px-4 py-3 space-y-3">
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center shrink-0 mt-0.5">
                <svg className="w-3.5 h-3.5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-800">EUA Carbon acima de €12.50</p>
                <p className="text-[10px] text-gray-400 mt-0.5">2 horas atrás</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-sky-50 flex items-center justify-center shrink-0 mt-0.5">
                <svg className="w-3.5 h-3.5 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-800">Novo dado I-REC disponível</p>
                <p className="text-[10px] text-gray-400 mt-0.5">5 horas atrás</p>
              </div>
            </div>
          </div>
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
