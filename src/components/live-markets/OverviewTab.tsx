import Image from "next/image";
import { getMarketOverviewStats, getMarketByAssetIds } from "@/lib/queries/live-markets";
import { createClient } from "@/lib/supabase/server";
import { getUserMarketNotifications, getUserWatchlist } from "@/lib/queries/user-market-data";
import { getTranslations } from "next-intl/server";
import { CadTrustScore } from "./CadTrustScore";
import { LastUpdatedCard } from "./LastUpdatedCard";
import { Tooltip } from "@/components/ui/Tooltip";
import { formatPrice, formatAvgPrice, timeAgo, assetTypeLabel, referenceBadge } from "@/lib/utils/market-helpers";
import type { ConversionRates } from "@/lib/services/currency-utils";
import type { Database } from "@/types/supabase";

type SnapshotRow = Database["public"]["Views"]["v_market_snapshot"]["Row"];

const MARKET_SOURCES = [
  {
    name: "Carbonmark",
    url: "https://carbonmark.com",
    logo: "/images/sources/carbonmark.png",
    description: "Marketplace global de créditos de carbono, conectando compradores, vendedores e desenvolvedores de projetos a múltiplos registros com liquidação on-chain instantânea.",
  },
  {
    name: "KlimaDAO",
    url: "https://www.klimadao.finance",
    logo: "/images/sources/klimadao.png",
    description: "Protocolo on-chain que tokeniza créditos de carbono (TCO2) e mantém pools de liquidez com preços de mercado em tempo real para ativos ambientais.",
  },
];

export async function OverviewTab({
  locale,
  displayCurrency = "USD",
  rates,
  snapshot,
}: {
  locale: string;
  displayCurrency?: string;
  rates?: ConversionRates;
  snapshot: SnapshotRow[];
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const t = await getTranslations({ locale, namespace: "CarbonoLiveMarkets" });

  const recentAssetIds = snapshot.map((a) => a.asset_id).filter(Boolean) as string[];
  const idParam = recentAssetIds.length > 0 ? recentAssetIds : undefined;
  const [stats, notifications, watchlistAssets] = await Promise.all([
    getMarketOverviewStats(idParam),
    user ? getUserMarketNotifications(user.id, 5) : Promise.resolve([]),
    user
      ? getUserWatchlist(user.id).then((items) => {
        const ids = items.map((i) => i.asset_id).filter(Boolean) as string[];
        return ids.length > 0 ? getMarketByAssetIds(ids, true) : [];
      })
      : Promise.resolve([]),
  ]);

  const allAssets = snapshot.filter((a) => a.price !== null).slice(0, 20);

  const sourceCounts = new Map<string, number>();
  for (const s of snapshot) {
    if (s.source_name) {
      sourceCounts.set(s.source_name, (sourceCounts.get(s.source_name) ?? 0) + 1);
    }
  }

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
            tooltip="Média dos preços de cada crédito de carbono, ponderada pelo estoque (volume) disponível de cada um — créditos com mais volume disponível pesam mais no cálculo. Valores em outras moedas são convertidos para a moeda selecionada antes da ponderação."
          />
          <KPICard
            label="I-REC"
            value={formatAvgPrice((stats as any).avgIrecByCurr, displayCurrency, rates)}
            sub={`${displayCurrency} / MWh (média)`}
            change={stats.irecChange}
            color="text-sky-600"
          />
          <LastUpdatedCard initialLastUpdate={stats.lastUpdate || null} />
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-base font-semibold text-gray-900">
              Mercados conectados
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">De onde vêm os preços exibidos nesta página</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
            {MARKET_SOURCES.map((source) => (
              <a
                key={source.name}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex gap-4 p-6 hover:bg-gray-50/50 transition-colors"
              >
                <Image
                  src={source.logo}
                  alt={source.name}
                  width={48}
                  height={48}
                  className="w-12 h-12 rounded-full object-cover shrink-0 border border-gray-100"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-sm font-semibold text-gray-900">{source.name}</h4>
                    {sourceCounts.get(source.name) ? (
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                        {sourceCounts.get(source.name)} ativos
                      </span>
                    ) : null}
                  </div>
                  <p className="text-xs text-blue-600 truncate">{source.url.replace(/^https?:\/\//, "")}</p>
                  <p className="text-xs text-gray-500 mt-2 leading-relaxed">{source.description}</p>
                </div>
              </a>
            ))}
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
                  <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">{t("asset")}</th>
                  <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">{t("type")}</th>
                  <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">{t("registry")}</th>
                  <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">{t("score")}</th>
                  <th className="text-right px-4 py-2.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">{t("price")}</th>
                  <th className="text-right px-4 py-2.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">{t("volume")}</th>
                  <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">{t("geography")}</th>
                  <th className="text-right px-4 py-2.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">{t("updated")}</th>
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
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <CadTrustScore
                          ratingBezero={item.rating_bezero}
                          ratingSylvera={item.rating_sylvera}
                          ratingRenoster={item.rating_renoster}
                          isCcpAligned={item.is_ccp_aligned}
                          variant="compact"
                        />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-sm font-mono font-bold text-emerald-600">{formatPrice(item, displayCurrency, rates)}</span>
                        <span className="block text-[10px] text-gray-500">{item.currency || "—"} / {item.unit || "—"}</span>
                      </td>
                      <td className="px-4 py-3 text-right hidden sm:table-cell">
                        <span className="text-sm font-mono text-gray-900">
                          {item.volume != null ? Number(item.volume).toLocaleString("pt-BR") : "—"}
                        </span>
                        {item.volume != null && (
                          <span className="block text-[10px] text-gray-500">{item.unit || ""}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600 hidden sm:table-cell">
                        {item.country || item.technology || "—"}
                      </td>
                      <td className="px-4 py-3 text-right text-xs text-gray-500 font-mono hidden md:table-cell">
                        {timeAgo(item.reference_date, t)}
                      </td>
                    </tr>
                  );
                })}
                {allAssets.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <p className="text-sm text-gray-500 font-medium">Nenhuma referência de preço disponível</p>
                        <p className="text-xs text-gray-500">As referências de mercado serão exibidas aqui quando os dados estiverem disponíveis</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <aside className="w-full lg:w-72 shrink-0 space-y-4 lg:sticky lg:top-24 lg:self-start">
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
                    <p className="text-[10px] text-gray-500 mt-0.5">{notification.created_at ? timeAgo(notification.created_at, t) : "—"}</p>
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
                <p className="text-[11px] text-gray-500 text-center">
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
          {watchlistAssets.length > 0 ? (
            <div className="px-4 py-3 space-y-3">
              {watchlistAssets.slice(0, 4).map((item) => (
                <div key={item.asset_id} className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-gray-900 truncate">{item.asset_name}</p>
                    <p className="text-[10px] text-gray-500">{item.registry || item.country || "—"}</p>
                  </div>
                  <span className="text-xs font-mono font-bold text-gray-900 ml-2 shrink-0">
                    {formatPrice(item, displayCurrency, rates)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-4 py-6">
              <div className="flex flex-col items-center gap-2">
                <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <p className="text-[11px] text-gray-500 text-center">
                  {user ? "Sua watchlist está vazia" : "Faça login para ver sua watchlist"}
                </p>
              </div>
            </div>
          )}
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
  tooltip,
}: {
  label: string;
  value: string;
  sub?: string;
  change?: number | null;
  color?: string;
  tooltip?: string;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
      <div className="flex items-center gap-1 mb-2">
        <h3 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">{label}</h3>
        {tooltip && (
          <Tooltip content={tooltip}>
            <button
              type="button"
              aria-label="Como este preço é calculado"
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          </Tooltip>
        )}
      </div>
      <p className={`text-2xl font-bold font-mono ${color || "text-gray-900"}`}>{value}</p>
      {change !== null && change !== undefined && (
        <p className={`inline-flex items-center gap-0.5 text-xs font-semibold mt-1 ${change >= 0 ? "text-emerald-700" : "text-red-700"}`}>
          <svg className={`w-3 h-3 ${change >= 0 ? "" : "rotate-180"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 17l9.2-9.2M17 17V7H7" />
          </svg>
          {change >= 0 ? "+" : ""}{change.toFixed(1)}% média
        </p>
      )}
      {sub && <p className="text-[11px] text-gray-500 mt-1">{sub}</p>}
    </div>
  );
}
