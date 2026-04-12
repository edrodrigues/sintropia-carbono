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
  getCarbonStakeholders,
  getCarbonSectorDistribution,
} from "@/lib/queries/carbon";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  const titles: Record<string, string> = {
    pt: "Análise por Setor Carbono 2026 | Créditos de Carbono por Indústria",
    en: "Carbon Sector Analysis 2026 | Carbon Credits by Industry",
    es: "Análisis por Sector Carbono 2026 | Créditos de Carbono por Industria",
  };

  const descriptions: Record<string, string> = {
    pt: "Distribuição do mercado de carbono por setor econômico. Tecnologia, energia e automotivo lideram a compensação de carbono.",
    en: "Carbon market distribution by economic sector. Technology, energy and automotive lead carbon offset.",
    es: "Distribución del mercado de carbono por sector económico. Tecnología, energía y automotriz lideran la compensación de carbono.",
  };

  return {
    title: titles[locale] || titles.pt,
    description: descriptions[locale] || descriptions.pt,
    keywords:
      locale === "pt"
        ? [
            "carbono setores",
            "análise setor carbono",
            "compensação carbono setorial",
            "créditos carbono indústria",
          ]
        : [
            "carbon sectors",
            "carbon sector analysis",
            "sectoral carbon offset",
            "carbon credits industry",
          ],
    alternates: {
      canonical: `https://sintropia.space/${locale === "pt" ? "" : locale + "/"}carbono/setores`,
    },
  };
}

const dataSources = [
  { name: "Verra Registry", url: "https://verra.org" },
  { name: "Gold Standard", url: "https://goldstandard.org" },
  { name: "CDP", url: "https://cdp.net" },
];

export default async function SetoresPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const [brasilStakeholders, _mundoStakeholders, brasilSectors, mundoSectors] =
    await Promise.all([
      getCarbonStakeholders("brazil"),
      getCarbonStakeholders("world"),
      getCarbonSectorDistribution("brazil"),
      getCarbonSectorDistribution("world"),
    ]);

  const tSetores = await getTranslations({
    locale,
    namespace: "Carbono.setoresPage",
  });
  const tTable = await getTranslations({ locale, namespace: "Carbono.table" });
  const tStats = await getTranslations({ locale, namespace: "Carbono.stats" });

  const formatVolume = (vol: number) => {
    if (vol >= 1000000) return `${(vol / 1000000).toFixed(1)}M`;
    if (vol >= 1000) return `${(vol / 1000).toFixed(0)}K`;
    return vol.toFixed(0);
  };

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

    return {
      name:
        sector.setor.length > 12
          ? sector.setor.substring(0, 12) + "..."
          : sector.setor,
      vol2024: vol2024 / 1000,
      vol2025: vol2025 / 1000,
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
      vol2025: formatVolume(c.volume_2025 || 0),
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
              Volume por setor em {tStats("volumeUnit")}
            </p>
            <SectorPieChart data={brasilSectors.slice(0, 8)} />
          </Card>

          {/* Pie Chart - Mundo */}
          <Card>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              {tSetores("distribution")} - Mundo
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Volume por setor em {tStats("volumeUnit")}
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
            Evolução do volume de créditos de carbono por setor (em milhares de{" "}
            {tStats("volumeUnit")})
          </p>
          <VolumeBarChart data={sectorVolumeData} />
        </Card>

        {/* Sector Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {brasilSectors.slice(0, 4).map((sector, index) => {
            const bgColors = [
              "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800",
              "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
              "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800",
              "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
            ];
            const textColors = [
              "text-emerald-800 dark:text-emerald-200",
              "text-blue-800 dark:text-blue-200",
              "text-emerald-800 dark:text-emerald-200",
              "text-blue-800 dark:text-blue-200",
            ];
            const numColors = [
              "text-emerald-700 dark:text-emerald-300",
              "text-blue-700 dark:text-blue-300",
              "text-emerald-700 dark:text-emerald-300",
              "text-blue-700 dark:text-blue-300",
            ];
            const subColors = [
              "text-emerald-600 dark:text-emerald-400",
              "text-blue-600 dark:text-blue-400",
              "text-emerald-600 dark:text-emerald-400",
              "text-blue-600 dark:text-blue-400",
            ];

            return (
              <div
                key={sector.setor}
                className={`p-6 rounded-xl border ${bgColors[index]}`}
              >
                <p className={`text-sm font-medium ${textColors[index]}`}>
                  {sector.setor}
                </p>
                <p className={`text-3xl font-bold ${numColors[index]} mt-2`}>
                  {sector.count}
                </p>
                <p className={`text-sm ${subColors[index]}`}>empresas</p>
                <p className={`text-xs ${subColors[index]} mt-2`}>
                  {formatVolume(sector.totalVolume)} {tStats("volumeUnit")}
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
              { key: "vol2025", header: tTable("vol2025"), align: "right" },
              { key: "delta", header: tTable("delta"), align: "right" },
            ]}
          />
        </Card>

        {/* Insights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-emerald-50 dark:bg-emerald-900/20 border-l-4 border-emerald-500 p-6 rounded-r-xl">
            <h4 className="font-bold text-emerald-900 dark:text-emerald-200 mb-2">
              💻 Tecnologia Lidera Globalmente
            </h4>
            <p className="text-sm text-emerald-800 dark:text-emerald-300">
              Microsoft, Amazon e Google são os maiores compradores de créditos
              de carbono, focando em remoção de carbono (CDR) e projetos de alta
              integridade.
            </p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-6 rounded-r-xl">
            <h4 className="font-bold text-blue-900 dark:text-blue-200 mb-2">
              ⚡ Energia em Transição
            </h4>
            <p className="text-sm text-blue-800 dark:text-blue-300">
              Petroleiras como Shell, BP e TotalEnergies investem pesadamente em
              compensação de carbono como parte de suas estratégias de transição
              energética.
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <LastUpdated dataFile="carbono-setores" />
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
