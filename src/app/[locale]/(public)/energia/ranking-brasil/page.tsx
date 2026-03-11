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
import { Badge } from "@/components/ui/tremor";
import {
  getIrecStakeholders,
  getIrecFullStats,
  getIrecSectorDistribution,
} from "@/lib/queries/irec";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  const titles: Record<string, string> = {
    pt: "Top 50 I-REC Brasil 2026 | Ranking Energia Renovável",
    en: "Top 50 I-REC Brazil 2026 | Renewable Energy Ranking",
    es: "Top 50 I-REC Brasil 2026 | Ranking Energía Renovable",
  };

  const descriptions: Record<string, string> = {
    pt: "Ranking das 50 maiores empresas brasileiras em certificados I-REC. Volume, crescimento e análise por setor.",
    en: "Ranking of the 50 largest Brazilian companies in I-REC certificates. Volume, growth and sector analysis.",
    es: "Ranking de las 50 mayores empresas brasileñas en certificados I-REC. Volumen, crecimiento y análisis por sector.",
  };

  return {
    title: titles[locale] || titles.pt,
    description: descriptions[locale] || descriptions.pt,
    keywords:
      locale === "pt"
        ? [
            "I-REC Brasil",
            "ranking energia renovável",
            "certificados I-REC",
            "maiores compradores I-REC",
          ]
        : [
            "I-REC Brazil",
            "renewable energy ranking",
            "I-REC certificates",
            "largest I-REC buyers",
          ],
    alternates: {
      canonical: `https://sintropia.space/${locale === "pt" ? "" : locale + "/"}energia/ranking-brasil`,
    },
  };
}

const dataSources = [
  { name: "I-REC Standard", url: "https://www.irecstandard.org" },
  { name: "I-TRACK Foundation", url: "https://trackingstandard.org" },
  { name: "CCEE Brasil", url: "https://ccee.org.br" },
];

export default async function RankingBrasilPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const [stakeholders, stats, sectorDistribution] = await Promise.all([
    getIrecStakeholders("brazil"),
    getIrecFullStats("brazil"),
    getIrecSectorDistribution("brazil"),
  ]);

  const t = await getTranslations({ locale, namespace: "Energia" });
  const tStats = await getTranslations({ locale, namespace: "Energia.stats" });
  const tTable = await getTranslations({ locale, namespace: "Energia.table" });
  const tRanking = await getTranslations({
    locale,
    namespace: "Energia.ranking",
  });

  const formatVolume = (vol: number | null) => {
    if (vol === null) return "-";
    if (vol >= 1000000) return `${(vol / 1000000).toFixed(1)}M`;
    if (vol >= 1000) return `${(vol / 1000).toFixed(0)}K`;
    return vol.toString();
  };

  const tableData = stakeholders.map((s) => ({
    rank: s.ranking,
    empresa: s.empresa,
    setor: s.setor || "N/A",
    papel: s.papel_mercado || "N/A",
    vol2024: formatVolume(s.volume_2024),
    vol2025: formatVolume(s.volume_2025),
    delta: s.delta_pct !== null ? (s.delta_pct > 0 ? "+" : "") + s.delta_pct.toFixed(1) + "%" : "-",
  }));

  const uniqueSectors = Array.from(
    new Set(stakeholders.map((s) => s.setor).filter(Boolean))
  ) as string[];

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-8 lg:py-12">
        <Breadcrumb />

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-[#059669] mb-2">
            {tRanking("brasilTitle")}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {tRanking("brasilSubtitle")}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard
            title={tStats("totalVolume")}
            value={`${(stats.totalVolume / 1000000).toFixed(1)}M`}
            subtitle="I-RECs 2025"
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
            subtitle="setores ativos"
          />
          <StatsCard
            title="Líder"
            value={stats.leader?.empresa || "-"}
            subtitle={
              stats.leader?.volume_2025
                ? `${formatVolume(stats.leader.volume_2025)} I-RECs`
                : ""
            }
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
              { key: "papel", header: tTable("role") },
              { key: "vol2024", header: tTable("vol2024"), align: "right" },
              { key: "vol2025", header: tTable("vol2025"), align: "right" },
              { key: "delta", header: tTable("delta"), align: "right" },
            ]}
          />
        </Card>

        {/* Sector Badges */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            Setores Representados
          </h3>
          <div className="flex flex-wrap gap-2">
            {sectorDistribution.slice(0, 10).map((sector) => (
              <Badge
                key={sector.setor}
                className="px-3 py-1 text-sm bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"
              >
                {sector.setor} ({sector.count})
              </Badge>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="mb-8 bg-gray-50 dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4">
            Legenda - Papel no Mercado
          </h3>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold text-white bg-green-600">
                Vendedor
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Gera e vende I-RECs
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold text-white bg-blue-600">
                Comprador
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Adquire I-RECs para compensação
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold text-white bg-purple-600">
                Ambos
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Atua em ambos os lados do mercado
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <LastUpdated dataFile="energia-ranking-brasil" />
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
