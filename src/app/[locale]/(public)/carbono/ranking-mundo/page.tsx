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
import { DataExportButton } from "@/components/ui/DataExportButton";
import { BarList } from "@/components/ui/tremor";
import {
  getCarbonStakeholders,
  getCarbonFullStats,
  getCarbonSectorDistribution,
} from "@/lib/queries/carbon";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  const titles: Record<string, string> = {
    pt: "Top 50 Carbono Mundo 2026 | Ranking Global Créditos de Carbono",
    en: "Top 50 Carbon World 2026 | Global Carbon Credits Ranking",
    es: "Top 50 Carbono Mundo 2026 | Ranking Global Créditos de Carbono",
  };

  const descriptions: Record<string, string> = {
    pt: "Ranking das 50 maiores corporações globais em créditos de carbono. Microsoft, Shell, Volkswagen e Amazon lideram.",
    en: "Ranking of the 50 largest global corporations in carbon credits. Microsoft, Shell, Volkswagen and Amazon lead.",
    es: "Ranking de las 50 mayores corporaciones globales en créditos de carbono. Microsoft, Shell, Volkswagen y Amazon lideran.",
  };

  return {
    title: titles[locale] || titles.pt,
    description: descriptions[locale] || descriptions.pt,
    keywords:
      locale === "pt"
        ? [
            "carbono global",
            "ranking créditos carbono mundial",
            "Big Tech carbono",
            "maiores compradores carbono mundo",
          ]
        : [
            "global carbon",
            "worldwide carbon credits ranking",
            "Big Tech carbon",
            "largest carbon buyers world",
          ],
    alternates: {
      canonical: `https://sintropia.space/${locale === "pt" ? "" : locale + "/"}carbono/ranking-mundo`,
    },
  };
}

const dataSources = [
  { name: "Verra Registry", url: "https://verra.org" },
  { name: "Gold Standard", url: "https://goldstandard.org" },
  { name: "Bloomberg NEF", url: "https://about.bnef.com" },
  { name: "CDP", url: "https://cdp.net" },
];

export default async function RankingMundoPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const [stakeholders, stats, sectorDistribution] = await Promise.all([
    getCarbonStakeholders("world"),
    getCarbonFullStats("world"),
    getCarbonSectorDistribution("world"),
  ]);

  const t = await getTranslations({ locale, namespace: "Carbono" });
  const tStats = await getTranslations({ locale, namespace: "Carbono.stats" });
  const tTable = await getTranslations({ locale, namespace: "Carbono.table" });
  const tRanking = await getTranslations({
    locale,
    namespace: "Carbono.ranking",
  });
  const tInsights = await getTranslations({
    locale,
    namespace: "Carbono.worldInsights",
  });
  const tDownload = await getTranslations({
    locale,
    namespace: "Carbono.download",
  });

  const formatVolume = (vol: number | null) => {
    if (vol === null) return "-";
    if (vol >= 1000000) return `${(vol / 1000000).toFixed(1)}M`;
    if (vol >= 1000) return `${(vol / 1000).toFixed(0)}K`;
    return vol.toFixed(0);
  };

  const tableData = stakeholders.map((s) => ({
    rank: s.ranking,
    empresa: s.empresa,
    setor: s.setor || "N/A",
    vol2024: formatVolume(s.volume_2024),
    vol2025: formatVolume(s.volume_2025),
    delta:
      s.delta_pct !== null
        ? (s.delta_pct > 0 ? "+" : "") + s.delta_pct.toFixed(1) + "%"
        : "-",
  }));

  const top10ForChart = stakeholders.slice(0, 10).map((s) => ({
    name: s.empresa,
    value: s.volume_2025 || 0,
  }));

  const exportData = stakeholders.map((s) => ({
    ranking: s.ranking,
    empresa: s.empresa,
    setor: s.setor || "",
    volume_2024: s.volume_2024 || 0,
    volume_2025: s.volume_2025 || 0,
    delta_pct: s.delta_pct || 0,
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
            value={formatVolume(stats.totalVolume)}
            subtitle={`${tStats("volumeUnit")} (Top 50)`}
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
                ? `${formatVolume(stats.leader.volume_2025)} ${tStats("volumeUnit")}`
                : ""
            }
          />
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Top 10 Chart */}
          <Card className="lg:col-span-1">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Top 10 Global ({tStats("volumeUnit")})
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
                    {formatVolume(sector.totalVolume)} {tStats("volumeUnit")}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Export Button */}
        <div className="flex justify-end mb-4">
          <DataExportButton
            data={exportData}
            filename="carbono-ranking-mundo"
            label={tDownload("button")}
            columns={[
              { key: "ranking", header: "Ranking" },
              { key: "empresa", header: "Company" },
              { key: "setor", header: "Sector" },
              { key: "volume_2024", header: "Volume 2024 (tCO2e)" },
              { key: "volume_2025", header: "Volume 2025 (tCO2e)" },
              { key: "delta_pct", header: "Delta %" },
            ]}
          />
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
          <LastUpdated dataFile="carbono-ranking-mundo" />
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
