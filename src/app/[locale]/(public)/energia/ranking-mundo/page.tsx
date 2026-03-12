export const revalidate = 3600;

import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { Card } from "@/components/ui/tremor";
import { StatsCard } from "@/components/ui/StatsCard";
import { MobileTableWrapper } from "@/components/ui/MobileTable";
import { LastUpdated } from "@/components/ui/LastUpdated";
import { DataSources } from "@/components/ui/DataSources";
import { BarList } from "@/components/ui/tremor";
import {
  getIrecStakeholders,
  getIrecFullStats,
} from "@/lib/queries/irec";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  const titles: Record<string, string> = {
    pt: "Top 50 I-REC Mundo 2026 | Ranking Global Energia Renovável",
    en: "Top 50 I-REC World 2026 | Global Renewable Energy Ranking",
    es: "Top 50 I-REC Mundo 2026 | Ranking Global Energía Renovable",
  };

  const descriptions: Record<string, string> = {
    pt: "Ranking das 50 maiores corporações globais em certificados de energia renovável. Amazon, Microsoft, Google e Meta lideram.",
    en: "Ranking of the 50 largest global corporations in renewable energy certificates. Amazon, Microsoft, Google and Meta lead.",
    es: "Ranking de las 50 mayores corporaciones globales en certificados de energía renovable. Amazon, Microsoft, Google y Meta lideran.",
  };

  return {
    title: titles[locale] || titles.pt,
    description: descriptions[locale] || descriptions.pt,
    keywords:
      locale === "pt"
        ? [
            "I-REC global",
            "ranking energia renovável mundial",
            "Big Tech energia renovável",
            "maiores compradores energia",
          ]
        : [
            "I-REC global",
            "worldwide renewable energy ranking",
            "Big Tech renewable energy",
            "largest energy buyers",
          ],
    alternates: {
      canonical: `https://sintropia.space/${locale === "pt" ? "" : locale + "/"}energia/ranking-mundo`,
    },
  };
}

const dataSources = [
  { name: "I-REC Standard", url: "https://www.irecstandard.org" },
  { name: "RE100", url: "https://www.there100.org" },
  { name: "Bloomberg NEF", url: "https://about.bnef.com" },
];

export default async function RankingMundoPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const [stakeholders, stats] = await Promise.all([
    getIrecStakeholders("world"),
    getIrecFullStats("world"),
  ]);

  const { sectorDistribution } = stats;

  const tStats = await getTranslations({ locale, namespace: "Energia.stats" });
  const tTable = await getTranslations({ locale, namespace: "Energia.table" });
  const tRanking = await getTranslations({
    locale,
    namespace: "Energia.ranking",
  });
  const tInsights = await getTranslations({
    locale,
    namespace: "Energia.worldInsights",
  });

  const formatVolume = (vol: number | null) => {
    if (vol === null) return "-";
    // Volume is in millions of RECs (TWh)
    return `${(vol / 1000000).toFixed(1)}M`;
  };

  const tableData = stakeholders.map((s) => ({
    rank: s.ranking,
    empresa: s.empresa,
    setor: s.setor || "N/A",
    vol2024: formatVolume(s.volume_2024),
    vol2025: formatVolume(s.volume_2025),
    delta: s.delta_pct !== null ? (s.delta_pct > 0 ? "+" : "") + s.delta_pct.toFixed(1) + "%" : "-",
  }));

  const top10ForChart = stakeholders.slice(0, 10).map((s) => ({
    name: s.empresa,
    value: s.volume_2025 ? s.volume_2025 / 1000000 : 0,
  }));

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-8 lg:py-12">
        <Breadcrumb />

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-[#1e40af] mb-2">
            {tRanking("mundoTitle")}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {tRanking("mundoSubtitle")}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard
            title={tStats("totalVolume")}
            value={`${(stats.totalVolume / 1000000).toFixed(1)}M`}
            subtitle="I-RECs (Top 50)"
            trend="up"
            trendValue={`+${stats.crescimento.toFixed(1)}%`}
          />
          <StatsCard
            title={tStats("growth")}
            value={`+${stats.crescimento.toFixed(1)}%`}
            subtitle={tStats("vsLastYear")}
            trend="up"
          />
          <StatsCard
            title={tStats("sectors")}
            value={stats.totalSectors}
            subtitle="setores globais"
          />
          <StatsCard
            title="Líder Global"
            value={stats.leader?.empresa || "-"}
            subtitle={
              stats.leader?.volume_2025
                ? `${(stats.leader.volume_2025 / 1000000).toFixed(1)}M I-RECs`
                : ""
            }
          />
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Top 10 Chart */}
          <Card className="lg:col-span-1">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Top 10 Global (TWh)
            </h3>
            <BarList data={top10ForChart} />
          </Card>

          {/* Sector Distribution */}
          <Card className="lg:col-span-2">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Distribuição por Setor
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {sectorDistribution.slice(0, 6).map((sector) => (
                <div
                  key={sector.setor}
                  className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800"
                >
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-200">
                    {sector.setor}
                  </p>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                    {sector.count}
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    {sector.totalVolume.toFixed(1)} TWh
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Main Ranking Table */}
        <Card className="mb-8">
          <MobileTableWrapper
            data={tableData as unknown as Record<string, unknown>[]}
            defaultMobileColumns={["rank", "empresa", "setor", "delta"]}
            columns={[
              { key: "rank", header: tTable("rank"), align: "center" },
              { key: "empresa", header: tTable("company") },
              { key: "setor", header: tTable("sector") },
              { key: "vol2024", header: tTable("vol2024"), align: "right" },
              { key: "vol2025", header: tTable("vol2025"), align: "right" },
              { key: "delta", header: tTable("delta"), align: "right" },
            ]}
          />
        </Card>

        {/* Insights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-6 rounded-r-xl">
            <h4 className="font-bold text-blue-900 dark:text-blue-200 mb-2">
              🏢 {tInsights("leaderTitle")}
            </h4>
            <p className="text-sm text-blue-800 dark:text-blue-300">
              {tInsights("leaderDesc")}
            </p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-6 rounded-r-xl">
            <h4 className="font-bold text-green-900 dark:text-green-200 mb-2">
              📈 {tInsights("growthTitle")}
            </h4>
            <p className="text-sm text-green-800 dark:text-green-300">
              {tInsights("growthDesc")}
            </p>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-500 p-6 rounded-r-xl">
            <h4 className="font-bold text-purple-900 dark:text-purple-200 mb-2">
              🌍 {tInsights("sectorTitle")}
            </h4>
            <p className="text-sm text-purple-800 dark:text-purple-300">
              {tInsights("sectorDesc")}
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <LastUpdated dataFile="energia-ranking-mundo" />
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
