export const revalidate = 3600;

import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { Card, Table, TableHead, TableBody, TableRow, TableHeader, TableCell, Badge } from "@/components/ui/tremor";
import { StatsCard } from "@/components/ui/StatsCard";
import { DataSources } from "@/components/ui/DataSources";
import { LastUpdated } from "@/components/ui/LastUpdated";
import { getMarketSummary, getMarketSnapshot, getPriceChanges } from "@/lib/queries/live-markets";
import { TrendingUp, TrendingDown, DollarSign, BarChart3 } from "lucide-react";

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
  if (item.price !== null) return `${item.currency || "$"}${item.price}`;
  if (item.price_low !== null && item.price_high !== null) return `${item.currency || "$"}${item.price_low} - ${item.currency || "$"}${item.price_high}`;
  return "—";
}

export default async function CarbonoLiveMarketsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "CarbonoLiveMarkets" });

  const [summary, snapshot, changes] = await Promise.all([
    getMarketSummary(),
    getMarketSnapshot(),
    getPriceChanges(),
  ]);

  const carbonItems = snapshot.filter((a) => a.asset_type === "carbon_credit");
  const irecItems = snapshot.filter((a) => a.asset_type === "irec" || a.asset_type === "go");
  const otherItems = snapshot.filter((a) => a.asset_type === "cbio");

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
      <main className="max-w-7xl mx-auto px-4 lg:px-8 lg:px-16 py-12">
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
            title="Referências de Preço"
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

        {/* Market Movements */}
        {topMovers.length > 0 && (
          <Card className="mb-8">
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Movimentações de Mercado
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {topMovers.map((m) => (
                  <div
                    key={m.asset_id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-800"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                        {m.asset_name}
                      </p>
                      <p className="text-xs text-gray-500">{m.asset_type === "carbon_credit" ? "Carbono" : "I-REC"}</p>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <p className="text-sm font-mono font-bold">{m.current_display || "—"}</p>
                      {m.change_pct !== null && (
                        <p className={`text-xs font-bold ${m.change_pct >= 0 ? "text-green-600" : "text-red-600"}`}>
                          {m.change_pct >= 0 ? "+" : ""}{m.change_pct.toFixed(1)}%
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* Carbon Prices Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-8 shadow-sm">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-900/10 dark:to-emerald-800/10">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              Preços de Carbono (Mercado Voluntário)
            </h3>
            <p className="text-sm text-gray-500 mt-1">Preços de referência por padrão e metodologia</p>
          </div>
          <div className="p-6">
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeader>Ativo</TableHeader>
                  <TableHeader>Registro</TableHeader>
                  <TableHeader>Categoria</TableHeader>
                  <TableHeader>Preço</TableHeader>
                  <TableHeader>Moeda</TableHeader>
                  <TableHeader>Data</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {carbonItems.map((item) => (
                  <TableRow key={item.asset_id}>
                    <TableCell className="font-bold">{item.asset_name}</TableCell>
                    <TableCell>
                      {item.registry ? (
                        <Badge color="gray">{item.registry}</Badge>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {item.project_category ? (
                        <span className="text-xs text-gray-600">{item.project_category}</span>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </TableCell>
                    <TableCell className="font-mono font-bold text-emerald-600">
                      {item.price !== null ? formatPrice(item) : (item.price_display || "—")}
                    </TableCell>
                    <TableCell className="text-xs text-gray-500">{item.currency || "—"}</TableCell>
                    <TableCell className="text-xs text-gray-500">{item.reference_date || "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Compliance Markets */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-8 shadow-sm">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              Mercados Regulados (Compliance)
            </h3>
            <p className="text-sm text-gray-500 mt-1">Preços dos principais sistemas de comércio de emissões</p>
          </div>
          <div className="p-6">
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeader>Mercado</TableHeader>
                  <TableHeader>Preço</TableHeader>
                  <TableHeader>Data</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {snapshot.filter((a) => a.asset_type === "carbon_credit" && a.project_category === "Compliance").map((item) => (
                  <TableRow key={item.asset_id}>
                    <TableCell className="font-bold">{item.asset_name}</TableCell>
                    <TableCell className="font-mono font-bold text-blue-600">{formatPrice(item)}</TableCell>
                    <TableCell className="text-xs text-gray-500">{item.reference_date || "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* I-REC Prices Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-8 shadow-sm">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-emerald-50 dark:from-blue-900/10 dark:to-emerald-900/10">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              Preços I-REC / Certificados de Energia
            </h3>
            <p className="text-sm text-gray-500 mt-1">Preços de referência por país e tecnologia</p>
          </div>
          <div className="p-6">
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeader>Ativo</TableHeader>
                  <TableHeader>País</TableHeader>
                  <TableHeader>Tecnologia</TableHeader>
                  <TableHeader>Preço</TableHeader>
                  <TableHeader>Unidade</TableHeader>
                  <TableHeader>Data</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {irecItems.map((item) => (
                  <TableRow key={item.asset_id}>
                    <TableCell className="font-bold text-sm">{item.asset_name}</TableCell>
                    <TableCell>
                      {item.country ? (
                        <Badge color="gray">{item.country}</Badge>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs">{item.technology || "—"}</TableCell>
                    <TableCell className="font-mono font-bold text-premium-blue dark:text-blue-400">
                      {item.price !== null ? formatPrice(item) : (item.price_display || "—")}
                    </TableCell>
                    <TableCell className="text-xs text-gray-500">{item.unit || "MWh"}</TableCell>
                    <TableCell className="text-xs text-gray-500">{item.reference_date || "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Other Assets (CBIO) */}
        {otherItems.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-8 shadow-sm">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/10 dark:to-yellow-900/10">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                Outros Ativos
              </h3>
            </div>
            <div className="p-6">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeader>Ativo</TableHeader>
                    <TableHeader>Preço</TableHeader>
                    <TableHeader>Data</TableHeader>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {otherItems.map((item) => (
                    <TableRow key={item.asset_id}>
                      <TableCell className="font-bold">{item.asset_name}</TableCell>
                      <TableCell className="font-mono font-bold text-amber-600">{formatPrice(item)}</TableCell>
                      <TableCell className="text-xs text-gray-500">{item.reference_date || "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

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

        <div className="mt-6 flex items-center justify-between">
          <LastUpdated dataFile="mercados-ao-vivo" />
        </div>

        <DataSources sources={dataSources} />
      </main>
      <Footer />
    </>
  );
}