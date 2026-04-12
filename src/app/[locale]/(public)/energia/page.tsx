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
    pt: "Mercado de Energia Renovável I-REC 2026 | Rankings Brasil e Mundial | Sintropia",
    en: "Renewable Energy I-REC Market 2026 | Brazil & Global Rankings | Sintropia",
    es: "Mercado de Energía Renovable I-REC 2026 | Rankings Brasil y Mundial | Sintropia",
  };

  const descriptions: Record<string, string> = {
    pt: "Dashboard completo do mercado de certificados I-REC com rankings atualizados do Brasil e mundo, preços por região, análise por setor e tendências do mercado de energia renovável em tempo real.",
    en: "Complete I-REC renewable energy certificate market dashboard featuring updated Brazil and global rankings, regional pricing, sector analysis, and real-time market trends for clean energy trading.",
    es: "Dashboard completo del mercado de certificados I-REC con rankings actualizados de Brasil y el mundo, precios por región, análisis sectorial y tendencias del mercado de energía renovable en tiempo real.",
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
            "preços I-REC",
            "setores energia",
            "transição energética",
            "certificação renovável",
            "mercado carbono neutro",
          ]
        : [
            "I-REC",
            "renewable energy",
            "energy certificates",
            "I-REC market Brazil",
            "renewable energy ranking",
            "I-REC pricing",
            "energy sectors",
            "energy transition",
            "renewable certification",
            "carbon neutral market",
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
                className="flex items-center gap-3 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
              >
                <RiPriceTag3Line className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-blue-800 dark:text-blue-300">
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

        {/* FAQ Section */}
        <Card className="mb-8">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
            {locale === "pt" ? "Perguntas Frequentes" : locale === "en" ? "Frequently Asked Questions" : "Preguntas Frecuentes"}
          </h3>
          <div className="space-y-4">
            <details className="group">
              <summary className="flex items-center justify-between cursor-pointer p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <span className="font-medium text-gray-900 dark:text-white">
                  {locale === "pt" ? "O que é I-REC?" : locale === "en" ? "What is I-REC?" : "¿Qué es I-REC?"}
                </span>
                <span className="transition group-open:rotate-180">
                  <svg fill="none" height="24" shape-rendering="geometricPrecision" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" viewBox="0 0 24 24" width="24">
                    <path d="M6 9l6 6 6-6"></path>
                  </svg>
                </span>
              </summary>
              <p className="text-gray-600 dark:text-gray-400 mt-3 px-4">
                {locale === "pt"
                  ? "I-REC (International Renewable Energy Certificate) é um certificado internacional que comprova a geração de energia renovável. Cada I-REC representa 1 MWh de energia limpa produzida, permitindo que empresas compensem suas emissões e declarem o uso de energia renovável."
                  : locale === "en"
                  ? "I-REC (International Renewable Energy Certificate) is an international certificate that proves renewable energy generation. Each I-REC represents 1 MWh of clean energy produced, allowing companies to offset their emissions and declare renewable energy usage."
                  : "I-REC (International Renewable Energy Certificate) es un certificado internacional que comprueba la generación de energía renovable. Cada I-REC representa 1 MWh de energía limpia producida, permitiendo que las empresas compensen sus emisiones y declaren el uso de energía renovable."}
              </p>
            </details>

            <details className="group">
              <summary className="flex items-center justify-between cursor-pointer p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <span className="font-medium text-gray-900 dark:text-white">
                  {locale === "pt" ? "Como funciona o mercado de I-REC?" : locale === "en" ? "How does the I-REC market work?" : "¿Cómo funciona el mercado de I-REC?"}
                </span>
                <span className="transition group-open:rotate-180">
                  <svg fill="none" height="24" shape-rendering="geometricPrecision" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" viewBox="0 0 24 24" width="24">
                    <path d="M6 9l6 6 6-6"></path>
                  </svg>
                </span>
              </summary>
              <p className="text-gray-600 dark:text-gray-400 mt-3 px-4">
                {locale === "pt"
                  ? "O mercado de I-REC funciona como um sistema de book-and-claim: geradoras de energia renovável emitem certificados, que são comprados por empresas que desejam comprovar o uso de energia limpa. O Brasil lidera o mercado global com mais de 8 bilhões de I-RECs comercializados anualmente."
                  : locale === "en"
                  ? "The I-REC market works as a book-and-claim system: renewable energy generators issue certificates, which are purchased by companies seeking to prove clean energy usage. Brazil leads the global market with over 8 billion I-RECs traded annually."
                  : "El mercado de I-REC funciona como un sistema de book-and-claim: generadoras de energía renovable emiten certificados, que son comprados por empresas que desean comprobar el uso de energía limpia. Brasil lidera el mercado global con más de 8 mil millones de I-RECs comercializados anualmente."}
              </p>
            </details>

            <details className="group">
              <summary className="flex items-center justify-between cursor-pointer p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <span className="font-medium text-gray-900 dark:text-white">
                  {locale === "pt" ? "Quais empresas podem comprar I-REC?" : locale === "en" ? "Which companies can buy I-RECs?" : "¿Qué empresas pueden comprar I-REC?"}
                </span>
                <span className="transition group-open:rotate-180">
                  <svg fill="none" height="24" shape-rendering="geometricPrecision" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" viewBox="0 0 24 24" width="24">
                    <path d="M6 9l6 6 6-6"></path>
                  </svg>
                </span>
              </summary>
              <p className="text-gray-600 dark:text-gray-400 mt-3 px-4">
                {locale === "pt"
                  ? "Qualquer empresa com conta de energia pode adquirir I-RECs para compensar seu consumo. Comerc Energia, Raízen Power e Engie Brasil são as maiores geradoras, enquanto empresas de tecnologia, mineração e manufatura são as principais compradoras para cumprir metas ESG."
                  : locale === "en"
                  ? "Any company with an energy account can acquire I-RECs to offset their consumption. Comerc Energia, Raízen Power, and Engie Brasil are the largest generators, while technology, mining, and manufacturing companies are the main buyers to meet ESG goals."
                  : "Cualquier empresa con cuenta de energía puede adquirir I-RECs para compensar su consumo. Comerc Energia, Raízen Power y Engie Brasil son las mayores generadoras, mientras empresas de tecnología, minería y manufactura son las principales compradoras para cumplir metas ESG."}
              </p>
            </details>
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

      {/* JSON-LD Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "Dataset",
                "@id": "https://sintropia.space/energia#dataset",
                "name": locale === "pt" ? "Rankings e Dados do Mercado I-REC" : locale === "en" ? "I-REC Market Rankings and Data" : "Rankings y Datos del Mercado I-REC",
                "description": locale === "pt" 
                  ? "Conjunto de dados abrangente sobre o mercado de certificados de energia renovável I-REC, incluindo rankings das principais empresas do Brasil e do mundo, volumes de comercialização, preços por região e análise setorial."
                  : locale === "en"
                  ? "Comprehensive dataset on the I-REC renewable energy certificate market, including rankings of leading companies in Brazil and worldwide, trading volumes, regional pricing, and sectoral analysis."
                  : "Conjunto de datos completo sobre el mercado de certificados de energía renovable I-REC, incluyendo rankings de las principales empresas de Brasil y el mundo, volúmenes de comercialización, precios por región y análisis sectorial.",
                "url": `https://sintropia.space/${locale === "pt" ? "" : locale + "/"}energia`,
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
                  locale === "pt" ? "Volume de I-RECs" : locale === "en" ? "I-REC Volume" : "Volumen de I-RECs",
                  locale === "pt" ? "Preço por MWh" : locale === "en" ? "Price per MWh" : "Precio por MWh",
                  locale === "pt" ? "Ranking Empresarial" : locale === "en" ? "Company Ranking" : "Ranking Empresarial"
                ]
              }
            ]
          })
        }}
      />
    </>
  );
}
