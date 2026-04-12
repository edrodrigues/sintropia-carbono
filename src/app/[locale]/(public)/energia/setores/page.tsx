export const revalidate = 3600;

import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { Card } from "@/components/ui/tremor";
import { MobileTableWrapper } from "@/components/ui/MobileTable";
import { LastUpdated } from "@/components/ui/LastUpdated";
import { DataSources } from "@/components/ui/DataSources";
import { SectorPieChart } from "@/components/charts/SectorPieChart";
import { VolumeBarChart } from "@/components/charts/VolumeBarChart";
import {
  getIrecStakeholders,
  getIrecSectorDistribution,
} from "@/lib/queries/irec";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  const titles: Record<string, string> = {
    pt: "Análise por Setor I-REC 2026 | Energia Renovável por Indústria",
    en: "I-REC Sector Analysis 2026 | Renewable Energy by Industry",
    es: "Análisis por Sector I-REC 2026 | Energía Renovable por Industria",
  };

  const descriptions: Record<string, string> = {
    pt: "Distribuição do mercado I-REC por setor econômico. Energia, tecnologia, mineração e financeiro lideram a transição energética.",
    en: "I-REC market distribution by economic sector. Energy, technology, mining and finance lead the energy transition.",
    es: "Distribución del mercado I-REC por sector económico. Energía, tecnología, minería y finanzas lideran la transición energética.",
  };

  return {
    title: titles[locale] || titles.pt,
    description: descriptions[locale] || descriptions.pt,
    keywords:
      locale === "pt"
        ? [
            "I-REC setores",
            "análise setor energia",
            "transição energética setorial",
            "I-REC por indústria",
          ]
        : [
            "I-REC sectors",
            "energy sector analysis",
            "sectoral energy transition",
            "I-REC by industry",
          ],
    alternates: {
      canonical: `https://sintropia.space/${locale === "pt" ? "" : locale + "/"}energia/setores`,
    },
  };
}

const dataSources = [
  { name: "I-REC Standard", url: "https://www.irecstandard.org" },
  { name: "CCEE Brasil", url: "https://ccee.org.br" },
  { name: "RE100", url: "https://www.there100.org" },
];

export default async function SetoresPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const [brasilStakeholders, _mundoStakeholders, brasilSectors, mundoSectors] =
    await Promise.all([
      getIrecStakeholders("brazil"),
      getIrecStakeholders("world"),
      getIrecSectorDistribution("brazil"),
      getIrecSectorDistribution("world"),
    ]);

  const tSetores = await getTranslations({
    locale,
    namespace: "Energia.setoresPage",
  });
  const tTable = await getTranslations({ locale, namespace: "Energia.table" });

  // Prepare volume by sector data for bar chart
  const sectorVolumeData = brasilSectors.slice(0, 8).map((sector) => {
    const brasilCompanies = brasilStakeholders.filter(
      (s) => s.setor === sector.setor
    );
    const vol2024 = brasilCompanies.reduce(
      (sum, s) => sum + (Number(s.volume_2024) || 0),
      0
    );
    const vol2025 = brasilCompanies.reduce(
      (sum, s) => sum + (Number(s.volume_2025) || 0),
      0
    );
    const vol2026 = brasilCompanies.reduce(
      (sum, s) => sum + (Number(s.volume_2026) || 0),
      0
    );

    return {
      name: sector.setor.length > 12 ? sector.setor.substring(0, 12) + "..." : sector.setor,
      vol2024: vol2024 / 1000,
      vol2025: vol2025 / 1000,
      vol2026: vol2026 / 1000,
    };
  });

  // Prepare table data - companies by sector
  const topCompaniesBySector = brasilSectors.slice(0, 5).flatMap((sector) => {
    const companies = brasilStakeholders
      .filter((s) => s.setor === sector.setor)
      .slice(0, 3);
    return companies.map((c) => ({
      setor: sector.setor,
      empresa: c.empresa,
      vol2024: c.volume_2024
        ? (c.volume_2024 / 1000).toFixed(0) + "K"
        : "-",
      vol2025: c.volume_2025
        ? (c.volume_2025 / 1000).toFixed(0) + "K"
        : "-",
      delta:
        c.delta_pct !== null
          ? (c.delta_pct > 0 ? "+" : "") + c.delta_pct.toFixed(1) + "%"
          : "-",
    }));
  });

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-8 lg:py-12">
        <Breadcrumb />

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            {tSetores("title")}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {tSetores("subtitle")}
          </p>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Pie Chart - Brasil */}
          <Card>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              {tSetores("distribution")} - Brasil
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Volume por setor em I-RECs
            </p>
            <SectorPieChart data={brasilSectors.slice(0, 8)} />
          </Card>

          {/* Pie Chart - Mundo */}
          <Card>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              {tSetores("distribution")} - Mundo
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Volume por setor em TWh
            </p>
            <SectorPieChart data={mundoSectors.slice(0, 8)} />
          </Card>
        </div>

        {/* Volume by Year Bar Chart */}
        <Card className="mb-12">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
            {tSetores("volumeByYear")} - Brasil
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Evolução do volume de I-RECs por setor (em milhares)
          </p>
          <VolumeBarChart data={sectorVolumeData} />
        </Card>

        {/* Sector Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {brasilSectors.slice(0, 4).map((sector, index) => {
            const colors = [
              "emerald",
              "blue",
              "emerald",
              "blue",
            ] as const;
            const color = colors[index];
            return (
              <div
                key={sector.setor}
                className={`p-6 rounded-xl border bg-${color}-50 dark:bg-${color}-900/20 border-${color}-200 dark:border-${color}-800`}
              >
                <p className={`text-sm font-medium text-${color}-800 dark:text-${color}-200`}>
                  {sector.setor}
                </p>
                <p className={`text-3xl font-bold text-${color}-700 dark:text-${color}-300 mt-2`}>
                  {sector.count}
                </p>
                <p className={`text-sm text-${color}-600 dark:text-${color}-400`}>
                  empresas
                </p>
                <p className={`text-xs text-${color}-500 dark:text-${color}-500 mt-2`}>
                  {(sector.totalVolume / 1000).toFixed(0)}K I-RECs
                </p>
              </div>
            );
          })}
        </div>

        {/* Companies by Sector Table */}
        <Card className="mb-8">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            {tSetores("companiesBySector")}
          </h3>
          <MobileTableWrapper
            data={topCompaniesBySector as unknown as Record<string, unknown>[]}
            defaultMobileColumns={["setor", "empresa", "vol2025"]}
            columns={[
              { key: "setor", header: tTable("sector") },
              { key: "empresa", header: tTable("company") },
              { key: "vol2024", header: tTable("vol2024"), align: "right" },
              { key: "vol2025", header: tTable("vol2025"), align: "right" },
              { key: "delta", header: tTable("delta"), align: "right" },
            ]}
          />
        </Card>

        {/* Insights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-emerald-50 dark:bg-emerald-900/20 border-l-4 border-emerald-500 p-6 rounded-r-xl">
            <h4 className="font-bold text-emerald-900 dark:text-emerald-200 mb-2">
              ⚡ Setor Energia Lidera
            </h4>
            <p className="text-sm text-emerald-800 dark:text-emerald-300">
              Geradoras e comercializadoras de energia representam a maior fatia do mercado I-REC brasileiro, tanto como vendedores quanto compradores.
            </p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-6 rounded-r-xl">
            <h4 className="font-bold text-blue-900 dark:text-blue-200 mb-2">
              🏭 Indústria em Ascensão
            </h4>
            <p className="text-sm text-blue-800 dark:text-blue-300">
              Mineração, siderurgia e manufatura mostram crescimento acelerado na adoção de certificados de energia renovável.
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <LastUpdated dataFile="energia-setores" />
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
