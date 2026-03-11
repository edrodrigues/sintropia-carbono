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
  getCarbonFullStats,
  getCarbonStakeholders,
} from "@/lib/queries/carbon";
import {
  RiLeafLine,
  RiGlobalLine,
  RiBarChartBoxLine,
  RiPriceTag3Line,
  RiFileList3Line,
} from "@remixicon/react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  const titles: Record<string, string> = {
    pt: "Mercado de Créditos de Carbono 2026 | Sintropia",
    en: "Carbon Credit Market 2026 | Sintropia",
    es: "Mercado de Créditos de Carbono 2026 | Sintropia",
  };

  const descriptions: Record<string, string> = {
    pt: "Dashboard completo do mercado de créditos de carbono - rankings Brasil e Mundo, volumes e tendências em tempo real.",
    en: "Complete carbon credit market dashboard - Brazil and World rankings, volumes and real-time trends.",
    es: "Dashboard completo del mercado de créditos de carbono - rankings Brasil y Mundo, volúmenes y tendencias en tiempo real.",
  };

  return {
    title: titles[locale] || titles.pt,
    description: descriptions[locale] || descriptions.pt,
    keywords:
      locale === "pt"
        ? [
            "créditos de carbono",
            "mercado de carbono",
            "compensação ambiental",
            "carbono Brasil",
            "ranking carbono",
          ]
        : [
            "carbon credits",
            "carbon market",
            "environmental offset",
            "carbon Brazil",
            "carbon ranking",
          ],
    alternates: {
      canonical: `https://sintropia.space/${locale === "pt" ? "" : locale + "/"}carbono`,
    },
  };
}

const dataSources = [
  { name: "Verra Registry", url: "https://verra.org" },
  { name: "Gold Standard", url: "https://goldstandard.org" },
  { name: "ACR", url: "https://americancarbonregistry.org" },
  { name: "CAR", url: "https://climateactionreserve.org" },
];

export default async function CarbonoPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const [brasilStats, mundoStats, brasilTop5, mundoTop5] = await Promise.all([
    getCarbonFullStats("brazil"),
    getCarbonFullStats("world"),
    getCarbonStakeholders("brazil").then((data) => data.slice(0, 5)),
    getCarbonStakeholders("world").then((data) => data.slice(0, 5)),
  ]);

  const t = await getTranslations({ locale, namespace: "Carbono" });
  const tStats = await getTranslations({ locale, namespace: "Carbono.stats" });
  const tQuickLinks = await getTranslations({
    locale,
    namespace: "Carbono.quickLinks",
  });
  const tRanking = await getTranslations({
    locale,
    namespace: "Carbono.ranking",
  });
  const tComparison = await getTranslations({
    locale,
    namespace: "Carbono.comparison",
  });

  const comparisonData = [
    {
      name: "2024",
      brasil: brasilStats.totalVolume * 0.78,
      mundo: mundoStats.totalVolume * 0.75,
    },
    {
      name: "2025",
      brasil: brasilStats.totalVolume,
      mundo: mundoStats.totalVolume,
    },
    {
      name: "2026 (proj.)",
      brasil: brasilStats.totalVolume * 1.2,
      mundo: mundoStats.totalVolume * 1.15,
    },
  ];

  const formatVolume = (vol: number) => {
    if (vol >= 1000000) return `${(vol / 1000000).toFixed(1)}M`;
    if (vol >= 1000) return `${(vol / 1000).toFixed(0)}K`;
    return vol.toFixed(0);
  };

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-8 lg:py-12">
        <Breadcrumb />

        {/* Hero Section */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
              <RiLeafLine className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
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
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>{t("lastUpdated")}:</span>
            <span className="font-medium">Mar 2026</span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          <StatsCard
            title={`${tStats("totalVolume")} Brasil`}
            value={formatVolume(brasilStats.totalVolume)}
            subtitle={tStats("volumeUnit")}
            trend="up"
            trendValue={`+${brasilStats.crescimento.toFixed(1)}%`}
          />
          <StatsCard
            title={`${tStats("totalVolume")} Mundo`}
            value={formatVolume(mundoStats.totalVolume)}
            subtitle={tStats("volumeUnit")}
            trend="up"
            trendValue={`+${mundoStats.crescimento.toFixed(1)}%`}
          />
          <StatsCard
            title={tStats("sectors")}
            value={brasilStats.totalSectors + mundoStats.totalSectors}
            subtitle={tStats("vsLastYear")}
          />
          <StatsCard
            title={tStats("leaders")}
            value={brasilStats.totalStakeholders + mundoStats.totalStakeholders}
            subtitle="Top 50 Brasil + Mundo"
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
                href={`/${locale}/carbono/ranking-brasil`}
                className="flex items-center gap-3 p-4 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors"
              >
                <RiBarChartBoxLine className="w-5 h-5 text-emerald-600" />
                <span className="font-medium text-emerald-800 dark:text-emerald-300">
                  {tQuickLinks("rankingBrasil")}
                </span>
              </Link>
              <Link
                href={`/${locale}/carbono/ranking-mundo`}
                className="flex items-center gap-3 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
              >
                <RiGlobalLine className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-blue-800 dark:text-blue-300">
                  {tQuickLinks("rankingMundo")}
                </span>
              </Link>
              <Link
                href={`/${locale}/carbono/setores`}
                className="flex items-center gap-3 p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
              >
                <RiBarChartBoxLine className="w-5 h-5 text-amber-600" />
                <span className="font-medium text-amber-800 dark:text-amber-300">
                  {tQuickLinks("setores")}
                </span>
              </Link>
              <Link
                href={`/${locale}/carbono/projetos`}
                className="flex items-center gap-3 p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
              >
                <RiFileList3Line className="w-5 h-5 text-purple-600" />
                <span className="font-medium text-purple-800 dark:text-purple-300">
                  {tQuickLinks("projetos")}
                </span>
              </Link>
              <Link
                href={`/${locale}/carbono/precos`}
                className="flex items-center gap-3 p-4 rounded-lg bg-rose-50 dark:bg-rose-900/20 hover:bg-rose-100 dark:hover:bg-rose-900/30 transition-colors col-span-2"
              >
                <RiPriceTag3Line className="w-5 h-5 text-rose-600" />
                <span className="font-medium text-rose-800 dark:text-rose-300">
                  {tQuickLinks("precos")}
                </span>
              </Link>
            </div>
          </Card>

          {/* Top Companies Preview - Brasil */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Top 5 Brasil
              </h3>
              <Link
                href={`/${locale}/carbono/ranking-brasil`}
                className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
              >
                {tRanking("viewAll")}
              </Link>
            </div>
            <div className="space-y-3">
              {brasilTop5.map((company, index) => (
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
                    {formatVolume(company.volume_2025 || 0)} tCO2e
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
              href={`/${locale}/carbono/ranking-mundo`}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              {tRanking("viewAll")}
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {mundoTop5.map((company, index) => (
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
                  {formatVolume(company.volume_2025 || 0)} tCO2e
                </p>
              </div>
            ))}
          </div>
        </Card>

        <div className="mt-6 flex items-center justify-between">
          <LastUpdated dataFile="carbono" />
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
