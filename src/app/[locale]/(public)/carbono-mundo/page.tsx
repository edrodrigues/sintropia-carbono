export const revalidate = 3600;

import { Metadata } from "next";
import { getTranslations } from 'next-intl/server';
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { CarbonoMundoChart } from "@/components/charts/CarbonoMundoChart";
import { LastUpdated } from "@/components/ui/LastUpdated";
import { DataSources } from "@/components/ui/DataSources";
import { MobileTableWrapper } from "@/components/ui/MobileTable";
import { Card } from "@/components/ui/tremor";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'CarbonoMundo' });
  
  const keywords = locale === "pt" 
    ? ["carbono mundo", "maiores compradores carbono", "Microsoft carbono", "Big Tech carbono", "créditos carbono globais"]
    : ["carbon world", "top carbon buyers", "Microsoft carbon", "Big Tech carbon", "global carbon credits"];

  return {
    title: t('title'),
    description: t('subtitle'),
    keywords,
    alternates: {
        canonical: `https://sintropia.space/${locale}/carbono-mundo`,
    },
  };
}

const carbonoData = [
    { rank: 1, empresa: "Microsoft", setor: "Tecnologia", vol2024: 5.5, vol2025: 29.5, delta: 81.36, badge: "bg-blue-700" },
    { rank: 2, empresa: "Shell", setor: "Energia", vol2024: 14.5, vol2025: 9.75, delta: -48.72, badge: "bg-green-800" },
    { rank: 3, empresa: "AtmosClear", setor: "CDR Tech", vol2024: 0.32, vol2025: 6.75, delta: 95.26, badge: "bg-purple-700" },
    { rank: 4, empresa: "Eni", setor: "Energia", vol2024: 3.58, vol2025: 6.44, delta: 44.41, badge: "bg-green-800" },
    { rank: 5, empresa: "Banco Votorantim", setor: "Financeiro", vol2024: 3.8, vol2025: 5.2, delta: 26.92, badge: "bg-blue-900" },
    { rank: 6, empresa: "Netflix", setor: "Media/Tech", vol2024: 0.82, vol2025: 4.8, delta: 82.92, badge: "bg-cyan-700" },
    { rank: 7, empresa: "Stockholm Exergi", setor: "Energia", vol2024: 0.3, vol2025: 3.3, delta: 90.91, badge: "bg-green-800" },
    { rank: 8, empresa: "Guacolda Energía", setor: "Energia", vol2024: 1.8, vol2025: 3.1, delta: 41.94, badge: "bg-green-800" },
    { rank: 9, empresa: "Organizacion Terpel", setor: "Energia", vol2024: 1.6, vol2025: 2.4, delta: 33.33, badge: "bg-green-800" },
    { rank: 10, empresa: "CO280", setor: "CDR Tech", vol2024: 0.25, vol2025: 2.0, delta: 87.50, badge: "bg-purple-700" },
];

const dataSources = [
    { name: "Verra Registry", url: "https://verra.org" },
    { name: "Gold Standard", url: "https://goldstandard.org" },
    { name: "ACR", url: "https://americancarbonregistry.org" },
    { name: "CAR", url: "https://climateactionreserve.org" },
];

export default async function CarbonoMundo({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'CarbonoMundo' });
  const tCards = await getTranslations({ locale, namespace: 'CarbonoMundo.cards' });
  const tTable = await getTranslations({ locale, namespace: 'CarbonoMundo.table' });
  const tInsights = await getTranslations({ locale, namespace: 'CarbonoMundo.insights' });
  
    return (
        <>
            <Header />
            <main className="max-w-7xl mx-auto px-8 lg:px-16 py-12">
                <Breadcrumb />
                <div className="mb-8">
                    <h2 className="text-4xl font-bold text-[#1e40af] mb-2">{t('title')}</h2>
                    <p className="text-gray-600 dark:text-gray-400">{t('subtitle')}</p>
                </div>

                <CarbonoMundoChart />

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-12 mb-8">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">{tCards('totalVolume')}</p>
                        <h3 className="text-3xl font-bold text-[#1e40af] dark:text-blue-400">73.2M</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{tCards('volumeUnit')}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">{tCards('topBuyer')}</p>
                        <h3 className="text-2xl font-bold text-[#1e40af] dark:text-blue-400">Microsoft</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">29.5M tCO2e</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">{tCards('topGrowth')}</p>
                        <h3 className="text-3xl font-bold text-green-600">+95.3%</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">AtmosClear</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">{tCards('dominantSector')}</p>
                        <h3 className="text-3xl font-bold text-[#1e40af] dark:text-blue-400">Energia</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">50% {tCards('percentOfTop')}</p>
                    </div>
                </div>

                <Card>
                    <MobileTableWrapper
                        data={carbonoData as unknown as Record<string, unknown>[]}
                        defaultMobileColumns={["rank", "empresa", "delta"]}
                        columns={[
                            { key: "rank", header: tTable('rank'), align: "center" },
                            { key: "empresa", header: tTable('company') },
                            { key: "setor", header: tTable('sector'), mobileHidden: true },
                            { key: "vol2024", header: tTable('vol2024'), align: "right", mobileHidden: true },
                            { key: "vol2025", header: tTable('vol2025'), align: "right", mobileHidden: true },
                            { key: "delta", header: tTable('delta'), align: "right" },
                        ]}
                    />
                </Card>

                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-6 rounded-r-xl">
                        <h4 className="font-bold text-blue-900 dark:text-blue-200 mb-2">💻 {tInsights('microsoftTitle')}</h4>
                        <p className="text-sm text-blue-800 dark:text-blue-300">{tInsights('microsoftDesc')}</p>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-500 p-6 rounded-r-xl">
                        <h4 className="font-bold text-purple-900 dark:text-purple-200 mb-2">🚀 {tInsights('cdrTitle')}</h4>
                        <p className="text-sm text-purple-800 dark:text-purple-300">{tInsights('cdrDesc')}</p>
                    </div>
                    <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-6 rounded-r-xl">
                        <h4 className="font-bold text-red-900 dark:text-red-200 mb-2">📉 {tInsights('portfolioTitle')}</h4>
                        <p className="text-sm text-red-800 dark:text-red-300">{tInsights('portfolioDesc')}</p>
                    </div>
                </div>

                <div className="mt-6 flex items-center justify-between">
                    <LastUpdated dataFile="carbono-mundo" />
                </div>

                <DataSources sources={dataSources} downloadFile={{ name: "dados.md", path: "/dados/dados.md" }} />
            </main>
            <Footer />
        </>
    );
}
