export const revalidate = 3600;

import { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { Card, Table, TableHead, TableBody, TableRow, TableHeader, TableCell, Badge } from "@/components/ui/tremor";
import { StatsCard } from "@/components/ui/StatsCard";
import { DataSources } from "@/components/ui/DataSources";
import { LastUpdated } from "@/components/ui/LastUpdated";
import { getMarketSummary, getMarketSnapshot, getPriceChanges, getFeaturedPrices, getLatestChanges } from "@/lib/queries/live-markets";
import { createClient } from "@/lib/supabase/server";
import { TrendingUp, TrendingDown, DollarSign, BarChart3, AlertTriangle, Info, Eye } from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "CarbonoLiveMarkets" });

  const keywords = locale === "pt"
    ? ["mercados ao vivo", "preços carbono", "I-REC preços", "inteligência de mercado carbono", "agregador preços carbono"]
    : ["live markets", "carbon prices", "I-REC prices", "carbon market intelligence", "carbon price aggregator"];

  return {
    title: t("title"),
    description: t("subtitle"),
    keywords,
    alternates: {
      canonical: `https://sintropia.space/${locale}/carbono/mercados-ao-vivo`,
    },
  };
}

function formatPrice(item: { price: number | null; price_low: number | null; price_high: number | null; price_display: string | null; currency: string | null }): string {
  if (item.price_display) return item.price_display;
  if (item.price !== null) return `${item.currency || "$"}${Number(item.price)}`;
  if (item.price_low !== null && item.price_high !== null) return `${item.currency || "$"}${item.price_low} - ${item.currency || "$"}${item.price_high}`;
  return "—";
}

function assetTypeLabel(type: string | null): { label: string; color: "green" | "blue" | "amber" | "gray" } {
  switch (type) {
    case "carbon_credit": return { label: "Carbono", color: "green" };
    case "irec": return { label: "I-REC", color: "blue" };
    case "go": return { label: "GO", color: "blue" };
    case "cbio": return { label: "CBIO", color: "amber" };
    default: return { label: type || "Outro", color: "gray" };
  }
}

function referenceTypeBadge(type: string | null): { label: string; color: "green" | "blue" | "gray" | "amber" } {
  switch (type) {
    case "trade": return { label: "Negócio realizado", color: "green" };
    case "bid": return { label: "Bid", color: "blue" };
    case "ask": return { label: "Ask", color: "blue" };
    case "closing": return { label: "Fechamento", color: "gray" };
    case "indicative": return { label: "Indicativo", color: "gray" };
    case "rfq": return { label: "Sob consulta", color: "amber" };
    case "range": return { label: "Faixa", color: "amber" };
    default: return { label: "—", color: "gray" };
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
  return `${diffDays}d atrás`;
}

export default async function CarbonoLiveMarketsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "CarbonoLiveMarkets" });

  const [summary, snapshot, changes, featured, latestChanges] = await Promise.all([
    getMarketSummary(),
    getMarketSnapshot(),
    getPriceChanges(),
    getFeaturedPrices(),
    getLatestChanges(),
  ]);

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const topMovers = changes.filter((c) => c.change_pct !== null).slice(0, 6);

  const dataSources = [
    { name: "Sintropia Carbono", url: "https://sintropia.space" },
    { name: "I-TRACK Foundation", url: "https://trackingstandard.org" },
    { name: "BloombergNEF", url: "https://about.bnef.com" },
    { name: "World Bank Carbon Pricing", url: "https://carbonpricingdashboard.worldbank.org" },
  ];

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-12">
        <Breadcrumb />

        <div className="mb-8">
          <h2 className="text-4xl font-bold text-[#059669] mb-2 font-inter dark:text-emerald-400">
            {t("title")}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 font-inter">
            {t("subtitle")}
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard
            title={t("allReferences")}
            value={summary.totalAssets}
            subtitle="Ativos com preço disponível"
            icon={<DollarSign className="w-5 h-5" />}
          />
          <StatsCard
            title="Preço Médio Créditos Carbono"
            value={summary.avgCarbonPrice || "—"}
            subtitle="USD / tCO2e"
            icon={<TrendingUp className="w-5 h-5" />}
          />
          <StatsCard
            title="Preço Médio I-REC"
            value={summary.avgIrecPrice || "—"}
            subtitle="USD / MWh"
            icon={<BarChart3 className="w-5 h-5" />}
          />
          <StatsCard
            title="Última Atualização"
            value={summary.lastUpdate || "—"}
            subtitle="Referência mais recente"
            icon={<TrendingDown className="w-5 h-5" />}
          />
        </div>

        {/* Two-column layout: main + sidebar */}
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Main content */}
          <div className="flex-1 min-w-0">

            {/* Market Movements */}
            {topMovers.length > 0 && (
              <Card className="mb-8">
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                    {t("marketMovements")}
                  </h3>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableHeader>{t("asset")}</TableHeader>
                        <TableHeader>{t("type")}</TableHeader>
                        <TableHeader className="text-right">{t("price")}</TableHeader>
                        <TableHeader className="text-right">{t("change")}</TableHeader>
                        <TableHeader className="hidden md:table-cell">{t("source")}</TableHeader>
                        <TableHeader className="hidden md:table-cell">{t("updated")}</TableHeader>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {topMovers.map((m) => {
                        const type = assetTypeLabel(m.asset_type);
                        const pct = m.change_pct !== null ? Number(m.change_pct) : null;
                        return (
                          <TableRow key={m.asset_id}>
                            <TableCell>
                              <span className="font-semibold">{m.asset_name}</span>
                            </TableCell>
                            <TableCell>
                              <Badge color={type.color}>{type.label}</Badge>
                            </TableCell>
                            <TableCell className="text-right font-mono font-bold">
                              {m.current_display || "—"}
                            </TableCell>
                            <TableCell className="text-right">
                              {pct !== null ? (
                                <span className={`font-mono font-bold ${pct >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                                  {pct >= 0 ? "+" : ""}{pct.toFixed(1)}%
                                </span>
                              ) : (
                                <span className="text-gray-400">—</span>
                              )}
                            </TableCell>
                            <TableCell className="hidden md:table-cell text-gray-500 text-xs">
                              {m.country || m.technology || m.asset_type || "—"}
                            </TableCell>
                            <TableCell className="hidden md:table-cell text-gray-500 text-xs">
                              {m.current_date ? timeAgo(m.current_date) : "—"}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            )}

            {/* All Price References */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-8 shadow-sm">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-900/10 dark:to-emerald-800/10">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {t("allReferences")}
                </h3>
                <p className="text-sm text-gray-500 mt-1">{t("subtitle")}</p>
              </div>
              <div className="p-6">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableHeader>{t("asset")}</TableHeader>
                      <TableHeader>{t("type")}</TableHeader>
                      <TableHeader className="hidden sm:table-cell">Registro</TableHeader>
                      <TableHeader className="text-right">{t("price")}</TableHeader>
                      <TableHeader className="hidden sm:table-cell">{t("geography")}</TableHeader>
                      <TableHeader className="text-right hidden md:table-cell">{t("updated")}</TableHeader>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {snapshot.map((item) => {
                      const type = assetTypeLabel(item.asset_type);
                      const refType = referenceTypeBadge(item.reference_type);
                      return (
                        <TableRow key={item.asset_id}>
                          <TableCell>
                            <span className="font-semibold">{item.asset_name}</span>
                          </TableCell>
                          <TableCell>
                            <Badge color={type.color}>{type.label}</Badge>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <div className="flex flex-col gap-1">
                              {item.registry && (
                                <Badge color="gray">{item.registry}</Badge>
                              )}
                              <Badge color={refType.color}>{refType.label}</Badge>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                              {formatPrice(item)}
                            </span>
                            <div className="text-xs text-gray-500">{item.currency || "—"} / {item.unit || "—"}</div>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell text-gray-600 text-sm">
                            {item.country || item.technology || "—"}
                          </TableCell>
                          <TableCell className="text-right hidden md:table-cell text-xs text-gray-500">
                            {item.reference_date || "—"}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Scope Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <Card>
                <div className="p-6">
                  <h4 className="text-lg font-bold text-emerald-700 dark:text-emerald-400 mb-3">
                    {t("scope")}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t("scopeDesc")}
                  </p>
                </div>
              </Card>
              <Card>
                <div className="p-6">
                  <h4 className="text-lg font-bold text-gray-700 dark:text-gray-300 mb-3">
                    {t("notIncluded")}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t("notIncludedItems")}
                  </p>
                </div>
              </Card>
            </div>

            <div className="flex items-center justify-between">
              <LastUpdated dataFile="mercados-ao-vivo" />
            </div>

            <DataSources sources={dataSources} />
          </div>

          {/* Sidebar */}
          <aside className="w-full lg:w-80 shrink-0 space-y-6">

            {/* Featured Prices */}
            <Card>
              <div className="p-5">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide mb-4 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-emerald-600" />
                  {t("featuredPrices")}
                </h3>
                <div className="space-y-3">
                  {featured.map((item) => (
                    <div key={item.asset_id} className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                          {item.asset_name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {assetTypeLabel(item.asset_type).label} · {item.currency || "$"}
                        </p>
                      </div>
                      <div className="text-right shrink-0 ml-3">
                        <p className="text-sm font-mono font-bold text-gray-900 dark:text-white">
                          {formatPrice(item)}
                        </p>
                      </div>
                    </div>
                  ))}
                  {featured.length === 0 && (
                    <p className="text-sm text-gray-400">Nenhum preço disponível</p>
                  )}
                </div>
              </div>
            </Card>

            {/* Recent Changes */}
            <Card>
              <div className="p-5">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide mb-4 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  {t("recentChanges")}
                </h3>
                <div className="space-y-3">
                  {latestChanges.map((item) => (
                    <div key={item.asset_id} className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                          {item.asset_name}
                        </p>
                      </div>
                      <div className="text-right shrink-0 ml-3">
                        <p className="text-sm font-mono">{item.current_display || "—"}</p>
                        <p className={`text-xs font-bold ${(item.change_pct ?? 0) >= 0 ? "text-green-600" : "text-red-600"}`}>
                          {item.change_pct !== null
                            ? `${item.change_pct >= 0 ? "+" : ""}${item.change_pct.toFixed(1)}%`
                            : "—"}
                        </p>
                      </div>
                    </div>
                  ))}
                  {latestChanges.length === 0 && (
                    <p className="text-sm text-gray-400">Nenhuma variação disponível</p>
                  )}
                </div>
              </div>
            </Card>

            {/* Watchlist (auth gate) */}
            <Card>
              <div className="p-5">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide mb-4 flex items-center gap-2">
                  <Eye className="w-4 h-4 text-blue-600" />
                  {t("watchlist")}
                </h3>
                {user ? (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t("noWatchlist")}
                    </p>
                  </div>
                ) : (
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-blue-800 dark:text-blue-300 font-medium">
                          {t("loginToFollow")}
                        </p>
                        <Link
                          href={`/${locale}/login`}
                          className="inline-block mt-2 text-sm font-semibold text-blue-700 dark:text-blue-400 hover:underline"
                        >
                          {t("loginRegister")} →
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Alerts (auth gate) */}
            <Card>
              <div className="p-5">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  {t("alerts")}
                </h3>
                {user ? (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t("noAlerts")}
                    </p>
                  </div>
                ) : (
                  <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-amber-800 dark:text-amber-300 font-medium">
                          {t("loginToAlerts")}
                        </p>
                        <Link
                          href={`/${locale}/login`}
                          className="inline-block mt-2 text-sm font-semibold text-amber-700 dark:text-amber-400 hover:underline"
                        >
                          {t("loginRegister")} →
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>

          </aside>
        </div>
      </main>
      <Footer />
    </>
  );
}