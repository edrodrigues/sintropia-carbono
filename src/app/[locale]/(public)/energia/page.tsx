export const revalidate = 3600;

import { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { Card } from "@/components/ui/tremor";
import { StatsCard } from "@/components/ui/StatsCard";
import { ComparisonChart } from "@/components/charts/ComparisonChart";
import { LastUpdated } from "@/components/ui/LastUpdated";
import { DataSources } from "@/components/ui/DataSources";
import {
  getIrecFullStats,
  getIrecStakeholders,
  getIrecStats,
  Stakeholder,
} from "@/lib/queries/irec";
import {
  RiFlashlightLine,
  RiGlobalLine,
  RiBarChartBoxLine,
  RiPriceTag3Line,
} from "@remixicon/react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  const titles: Record<string, string> = {
    pt: "Mercado de Energia Renovável I-REC 2026 | Sintropia",
    en: "Renewable Energy I-REC Market 2026 | Sintropia",
    es: "Mercado de Energía Renovable I-REC 2026 | Sintropia",
  };

  const descriptions: Record<string, string> = {
    pt: "Dashboard completo do mercado de certificados I-REC - rankings Brasil e Mundo, preços e tendências em tempo real.",
    en: "Complete I-REC certificate market dashboard - Brazil and World rankings, prices and real-time trends.",
    es: "Dashboard completo del mercado de certificados I-REC - rankings Brasil y Mundo, precios y tendencias en tiempo real.",
  };

  return {
    title: titles[locale] || titles.pt,
    description: descriptions[locale] || descriptions.pt,
    keywords:
      locale === "pt"
        ? [
            "I-REC",
            "energia renovável",
            "certificados energia",
            "mercado I-REC Brasil",
            "ranking energia renovável",
          ]
        : [
            "I-REC",
            "renewable energy",
            "energy certificates",
            "I-REC market Brazil",
            "renewable energy ranking",
          ],
    alternates: {
      canonical: `https://sintropia.space/${locale === "pt" ? "" : locale + "/"}energia`,
    },
  };
}

const dataSources = [
  { name: "I-REC Standard", url: "https://www.irecstandard.org" },
  { name: "I-TRACK Foundation", url: "https://trackingstandard.org" },
  { name: "CCEE Brasil", url: "https://ccee.org.br" },
];

export default async function EnergiaPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const [brasilStats, mundoStats, mundoStatsTotal, brasilTop5, mundoTop5] = await Promise.all([
    getIrecFullStats("brazil"),
    getIrecFullStats("world"), // Top 50 global (excl Brazil)
    getIrecStats("world_total"), // True global total (incl Brazil)
    getIrecStakeholders("brazil").then((data) => data.slice(0, 5)),
    getIrecStakeholders("world").then((data) => data.slice(0, 5)),
  ]);

  const t = await getTranslations({ locale, namespace: "Energia" });
  const tStats = await getTranslations({ locale, namespace: "Energia.stats" });
  const tQuickLinks = await getTranslations({
    locale,
    namespace: "Energia.quickLinks",
  });
  const tRanking = await getTranslations({
    locale,
    namespace: "Energia.ranking",
  });
  const tComparison = await getTranslations({
    locale,
    namespace: "Energia.comparison",
  });

  const comparisonData = [
    {
      name: "2024",
      brasil: brasilStats.totalVolume * 0.78, // Estimated 2024 based on growth
      mundo: mundoStatsTotal.total2024,
    },
    {
      name: "2025",
      brasil: brasilStats.totalVolume,
      mundo: mundoStatsTotal.total2025,
    },
    {
      name: "2026 (proj.)",
      brasil: brasilStats.totalVolume * 1.15,
      mundo: mundoStatsTotal.total2026 || (mundoStatsTotal.total2025 * 1.12), // Use projected if available
    },
  ];

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-8 lg:py-12">
        <Breadcrumb />

        {/* Hero Section */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
              <RiFlashlightLine className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
                {t("heroTitle")}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {t("heroSubtitle")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <span>{t("lastUpdated")}:</span>
            <span className="font-medium">11 de Março de 2026</span>
          </div>
          {/* Unit Explanation */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800/30">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Unidade:</strong> 1 I-REC (International Renewable Energy Certificate) = 1 MWh de energia renovável. 
              Os volumes mostrados representam certificados de energia renovável comercializados em 2025.
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          <StatsCard
            title={`${tStats("totalVolume")} Brasil`}
            value={`${(brasilStats.totalVolume / 1000000).toFixed(1)}M`}
            subtitle="I-RECs (≈ MWh)"
            trend="up"
            trendValue={`+${brasilStats.crescimento.toFixed(1)}%`}
          />
          <StatsCard
            title={`${tStats("totalVolume")} Mundial`}
            value={`${(mundoStatsTotal.total2025 / 1000000).toFixed(1)}M`}
            subtitle="I-RECs (≈ MWh) • Inclui Brasil"
            trend="up"
            trendValue={`+${mundoStatsTotal.crescimento.toFixed(1)}%`}
          />
          <StatsCard
            title={tStats("sectors")}
            value={brasilStats.totalSectors + mundoStats.totalSectors}
            subtitle={tStats("vsLastYear")}
          />
          <StatsCard
            title={tStats("leaders")}
            value={brasilStats.totalStakeholders + mundoStats.totalStakeholders}
            subtitle="Top 50 Brasil + Top 50 Mundial"
          />
        </div>

        {/* Comparison Chart */}
        <Card className="mb-12">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {tComparison("title")}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            {tComparison("subtitle")}
          </p>
          <ComparisonChart
            data={comparisonData}
            brasilLabel="Brasil"
            mundoLabel="Mundo"
          />
        </Card>

        {/* Quick Links & Top Companies Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Quick Links */}
          <Card>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              {tQuickLinks("title")}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <Link
                href={`/${locale}/energia/ranking-brasil`}
                className="flex items-center gap-3 p-4 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors"
              >
                <RiBarChartBoxLine className="w-5 h-5 text-emerald-600" />
                <span className="font-medium text-emerald-800 dark:text-emerald-300">
                  {tQuickLinks("rankingBrasil")}
                </span>
              </Link>
              <Link
                href={`/${locale}/energia/ranking-mundo`}
                className="flex items-center gap-3 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
              >
                <RiGlobalLine className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-blue-800 dark:text-blue-300">
                  {tQuickLinks("rankingMundo")}
                </span>
              </Link>
              <Link
                href={`/${locale}/energia/setores`}
                className="flex items-center gap-3 p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
              >
                <RiBarChartBoxLine className="w-5 h-5 text-amber-600" />
                <span className="font-medium text-amber-800 dark:text-amber-300">
                  {tQuickLinks("setores")}
                </span>
              </Link>
              <Link
                href={`/${locale}/irec-precos`}
                className="flex items-center gap-3 p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
              >
                <RiPriceTag3Line className="w-5 h-5 text-purple-600" />
                <span className="font-medium text-purple-800 dark:text-purple-300">
                  {tQuickLinks("precos")}
                </span>
              </Link>
            </div>
          </Card>

          {/* Top Companies Preview */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Top 5 Brasil
              </h3>
              <Link
                href={`/${locale}/energia/ranking-brasil`}
                className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
              >
                {tRanking("viewAll")}
              </Link>
            </div>
            <div className="space-y-3">
              {brasilTop5.map((company: Stakeholder, index: number) => (
                <div
                  key={company.id}
                  className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 flex items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-sm font-bold">
                      {index + 1}
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {company.empresa}
                    </span>
                  </div>
                   <span className="text-sm text-gray-500">
                    {((company.volume_2025 || 0) / 1000000).toFixed(1)}M I-RECs
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* World Top Companies */}
        <Card className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Top 5 Mundo
            </h3>
            <Link
              href={`/${locale}/energia/ranking-mundo`}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              {tRanking("viewAll")}
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {mundoTop5.map((company: Stakeholder, index: number) => (
              <div
                key={company.id}
                className="text-center p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50"
              >
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-bold mb-2">
                  {index + 1}
                </span>
                <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
                  {company.empresa}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {((company.volume_2025 || 0) / 1000000).toFixed(1)}M I-RECs
                </p>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-xs text-gray-600 dark:text-gray-400">
            <strong>Nota:</strong> O &quot;Top 5 Mundial&quot; mostra as maiores empresas globais fora do Brasil. 
            O volume total mundial (card acima) já inclui o Brasil. 
            O Brasil representa {((brasilStats.totalVolume / mundoStatsTotal.total2025) * 100).toFixed(1)}% do mercado global.
          </div>
        </Card>

        <div className="mt-6 flex items-center justify-between">
          <LastUpdated dataFile="energia" />
        </div>

        <DataSources
          sources={dataSources}
          downloadFile={{ name: "dados.md", path: "/dados/dados.md" }}
        />
      </main>
      <Footer />
    </>
  );
}
