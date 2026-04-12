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
    pt: "Mercado de Créditos de Carbono 2026 | Rankings Brasil e Mundial | Sintropia",
    en: "Carbon Credit Market 2026 | Brazil & Global Rankings | Sintropia",
    es: "Mercado de Créditos de Carbono 2026 | Rankings Brasil y Mundial | Sintropia",
  };

  const descriptions: Record<string, string> = {
    pt: "Dashboard completo do mercado de créditos de carbono com rankings atualizados do Brasil e mundo, análise de projetos de compensação ambiental, preços por tonelada e tendências do mercado regulado e voluntário.",
    en: "Complete carbon credit market dashboard featuring updated Brazil and global rankings, environmental offset project analysis, pricing per tonne, and trends for both compliance and voluntary carbon markets.",
    es: "Dashboard completo del mercado de créditos de carbono con rankings actualizados de Brasil y el mundo, análisis de proyectos de compensación ambiental, precios por tonelada y tendencias de mercados regulados y voluntarios.",
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
            "preços carbono",
            "projetos carbono",
            "Verra",
            "Gold Standard",
            "neutralidade carbônica",
            "descarbonização",
          ]
        : [
            "carbon credits",
            "carbon market",
            "environmental offset",
            "carbon Brazil",
            "carbon ranking",
            "carbon pricing",
            "carbon projects",
            "Verra",
            "Gold Standard",
            "carbon neutrality",
            "decarbonization",
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
                className="flex items-center gap-3 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
              >
                <RiFileList3Line className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-blue-800 dark:text-blue-300">
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

        {/* FAQ Section */}
        <Card className="mb-8">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
            {locale === "pt" ? "Perguntas Frequentes" : locale === "en" ? "Frequently Asked Questions" : "Preguntas Frecuentes"}
          </h3>
          <div className="space-y-4">
            <details className="group">
              <summary className="flex items-center justify-between cursor-pointer p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <span className="font-medium text-gray-900 dark:text-white">
                  {locale === "pt" ? "O que são créditos de carbono?" : locale === "en" ? "What are carbon credits?" : "¿Qué son los créditos de carbono?"}
                </span>
                <span className="transition group-open:rotate-180">
                  <svg fill="none" height="24" shape-rendering="geometricPrecision" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" viewBox="0 0 24 24" width="24">
                    <path d="M6 9l6 6 6-6"></path>
                  </svg>
                </span>
              </summary>
              <p className="text-gray-600 dark:text-gray-400 mt-3 px-4">
                {locale === "pt"
                  ? "Créditos de carbono são certificados que representam a remoção ou evitação de 1 tonelada de CO2 equivalente da atmosfera. Empresas compram esses créditos para compensar emissões que não conseguem eliminar, alcançando neutralidade carbônica."
                  : locale === "en"
                  ? "Carbon credits are certificates representing the removal or avoidance of 1 tonne of CO2 equivalent from the atmosphere. Companies purchase these credits to offset emissions they cannot eliminate, achieving carbon neutrality."
                  : "Los créditos de carbono son certificados que representan la remoción o evitación de 1 tonelada de CO2 equivalente de la atmósfera. Las empresas compran estos créditos para compensar emisiones que no pueden eliminar, alcanzando neutralidad de carbono."}
              </p>
            </details>

            <details className="group">
              <summary className="flex items-center justify-between cursor-pointer p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <span className="font-medium text-gray-900 dark:text-white">
                  {locale === "pt" ? "Como funciona o mercado de carbono?" : locale === "en" ? "How does the carbon market work?" : "¿Cómo funciona el mercado de carbono?"}
                </span>
                <span className="transition group-open:rotate-180">
                  <svg fill="none" height="24" shape-rendering="geometricPrecision" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" viewBox="0 0 24 24" width="24">
                    <path d="M6 9l6 6 6-6"></path>
                  </svg>
                </span>
              </summary>
              <p className="text-gray-600 dark:text-gray-400 mt-3 px-4">
                {locale === "pt"
                  ? "O mercado de carbono pode ser regulado (compliance) ou voluntário. No regulado, empresas obrigadas por lei a reduzir emissões compram créditos. No voluntário, empresas adquirem créditos para metas ESG. Projetos de reflorestamento, energia renovável e captura de metano geram os créditos."
                  : locale === "en"
                  ? "The carbon market can be compliance or voluntary. In compliance markets, companies legally required to reduce emissions purchase credits. In voluntary markets, companies acquire credits for ESG goals. Reforestation, renewable energy, and methane capture projects generate the credits."
                  : "El mercado de carbono puede ser regulado (cumplimiento) o voluntario. En el regulado, empresas obligadas por ley a reducir emisiones compran créditos. En el voluntario, empresas adquieren créditos para metas ESG. Proyectos de reforestación, energía renovable y captura de metano generan los créditos."}
              </p>
            </details>

            <details className="group">
              <summary className="flex items-center justify-between cursor-pointer p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <span className="font-medium text-gray-900 dark:text-white">
                  {locale === "pt" ? "Quais são os principais certificadores?" : locale === "en" ? "Who are the main certifiers?" : "¿Quiénes son los principales certificadores?"}
                </span>
                <span className="transition group-open:rotate-180">
                  <svg fill="none" height="24" shape-rendering="geometricPrecision" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" viewBox="0 0 24 24" width="24">
                    <path d="M6 9l6 6 6-6"></path>
                  </svg>
                </span>
              </summary>
              <p className="text-gray-600 dark:text-gray-400 mt-3 px-4">
                {locale === "pt"
                  ? "Verra (VCS) e Gold Standard são os maiores certificadores globais. No Brasil, o RenovaBio regula o mercado de biocombustíveis. ACR (American Carbon Registry) e CAR (Climate Action Reserve) também atuam no mercado voluntário americano."
                  : locale === "en"
                  ? "Verra (VCS) and Gold Standard are the largest global certifiers. In Brazil, RenovaBio regulates the biofuel market. ACR (American Carbon Registry) and CAR (Climate Action Reserve) also operate in the American voluntary market."
                  : "Verra (VCS) y Gold Standard son los mayores certificadores globales. En Brasil, RenovaBio regula el mercado de biocombustibles. ACR (American Carbon Registry) y CAR (Climate Action Reserve) también operan en el mercado voluntario americano."}
              </p>
            </details>
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

      {/* JSON-LD Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "Dataset",
                "@id": "https://sintropia.space/carbono#dataset",
                "name": locale === "pt" ? "Rankings e Dados do Mercado de Carbono" : locale === "en" ? "Carbon Market Rankings and Data" : "Rankings y Datos del Mercado de Carbono",
                "description": locale === "pt"
                  ? "Conjunto de dados abrangente sobre o mercado de créditos de carbono, incluindo rankings das principais empresas e projetos do Brasil e do mundo, volumes de compensação, preços por tonelada de CO2 e análise por setor de atuação."
                  : locale === "en"
                  ? "Comprehensive dataset on the carbon credit market, including rankings of leading companies and projects in Brazil and worldwide, offset volumes, pricing per tonne of CO2, and sectoral analysis."
                  : "Conjunto de datos completo sobre el mercado de créditos de carbono, incluyendo rankings de las principales empresas y proyectos de Brasil y el mundo, volúmenes de compensación, precios por tonelada de CO2 y análisis sectorial.",
                "url": `https://sintropia.space/${locale === "pt" ? "" : locale + "/"}carbono`,
                "datePublished": "2025-01-01",
                "dateModified": new Date().toISOString().split("T")[0],
                "creator": {
                  "@type": "Organization",
                  "name": "Sintropia",
                  "url": "https://sintropia.space"
                },
                "publisher": {
                  "@type": "Organization",
                  "name": "Sintropia",
                  "url": "https://sintropia.space",
                  "logo": {
                    "@type": "ImageObject",
                    "url": "https://sintropia.space/logo.png"
                  }
                },
                "license": "https://creativecommons.org/licenses/by/4.0/",
                "distribution": {
                  "@type": "DataDownload",
                  "contentUrl": "https://sintropia.space/dados/dados.md",
                  "encodingFormat": "text/markdown"
                },
                "spatialCoverage": {
                  "@type": "Place",
                  "name": locale === "pt" ? "Brasil e Global" : locale === "en" ? "Brazil and Global" : "Brasil y Global"
                },
                "temporalCoverage": "2024/2026",
                "variableMeasured": [
                  locale === "pt" ? "Volume de Créditos de Carbono" : locale === "en" ? "Carbon Credit Volume" : "Volumen de Créditos de Carbono",
                  locale === "pt" ? "Preço por tCO2e" : locale === "en" ? "Price per tCO2e" : "Precio por tCO2e",
                  locale === "pt" ? "Ranking de Projetos" : locale === "en" ? "Project Ranking" : "Ranking de Proyectos"
                ]
              }
            ]
          })
        }}
      />
    </>
  );
}
