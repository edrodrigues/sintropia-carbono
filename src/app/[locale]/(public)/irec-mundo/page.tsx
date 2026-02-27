export const revalidate = 3600;

import { Metadata } from "next";
import { getTranslations } from 'next-intl/server';
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { IrecMundoChart } from "@/components/charts/IrecMundoChart";
import { LastUpdated } from "@/components/ui/LastUpdated";
import { DataSources } from "@/components/ui/DataSources";
import { MobileTableWrapper } from "@/components/ui/MobileTable";
import { Card, Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from "@/components/ui/tremor";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'IRECMundo' });
  
  return {
    title: t('title'),
    description: t('subtitle'),
    keywords: locale === "pt" 
      ? ["energia renovável mundo", "maiores compradores energia", "Amazon energia renovável", "RE100 empresas", "TWh energia"]
      : ["renewable energy world", "top energy buyers", "Amazon renewable energy", "RE100 companies", "TWh energy"],
    alternates: {
        canonical: `https://sintropia.space/${locale}/irec-mundo`,
    },
  };
}

const energiaData = [
    { rank: 1, empresa: "Amazon", setor: "Tecnologia / E-commerce", vol2024: 78.4, vol2025: 91.2, delta: 16.33, badge: "bg-blue-600" },
    { rank: 2, empresa: "Microsoft", setor: "Tecnologia / Cloud", vol2024: 55.2, vol2025: 68.5, delta: 24.09, badge: "bg-blue-600" },
    { rank: 3, empresa: "Meta Platforms", setor: "Tecnologia / Social Media", vol2024: 42.1, vol2025: 48.9, delta: 16.15, badge: "bg-blue-600" },
    { rank: 4, empresa: "Google (Alphabet)", setor: "Tecnologia / Cloud", vol2024: 38.6, vol2025: 45.3, delta: 17.36, badge: "bg-blue-600" },
    { rank: 5, empresa: "Walmart", setor: "Varejo e Consumo", vol2024: 15.8, vol2025: 18.2, delta: 15.19, badge: "bg-cyan-700" },
    { rank: 6, empresa: "Apple", setor: "Tecnologia / Hardware", vol2024: 14.3, vol2025: 16.5, delta: 15.38, badge: "bg-blue-600" },
    { rank: 7, empresa: "Samsung Electronics", setor: "Manufatura / Eletrônicos", vol2024: 12.1, vol2025: 14.8, delta: 22.31, badge: "bg-violet-700" },
    { rank: 8, empresa: "TSMC", setor: "Semicondutores", vol2024: 11.5, vol2025: 13.9, delta: 20.87, badge: "bg-red-700" },
    { rank: 9, empresa: "T-Mobile USA", setor: "Telecomunicações", vol2024: 9.8, vol2025: 11.2, delta: 14.29, badge: "bg-amber-800" },
    { rank: 10, empresa: "Intel Corporation", setor: "Semicondutores", vol2024: 9.2, vol2025: 10.5, delta: 14.13, badge: "bg-red-700" },
    { rank: 11, empresa: "Rio Tinto", setor: "Mineração / Metais", vol2024: 8.7, vol2025: 12.4, delta: 42.53, badge: "bg-zinc-700" },
    { rank: 12, empresa: "Target Corporation", setor: "Varejo", vol2024: 7.9, vol2025: 9.1, delta: 15.19, badge: "bg-cyan-700" },
    { rank: 13, empresa: "Nestlé", setor: "Alimentos e Bebidas", vol2024: 7.5, vol2025: 8.6, delta: 14.67, badge: "bg-orange-700" },
    { rank: 14, empresa: "Starbucks", setor: "Alimentos e Bebidas", vol2024: 6.8, vol2025: 7.4, delta: 8.82, badge: "bg-orange-700" },
    { rank: 15, empresa: "General Motors", setor: "Automotivo", vol2024: 6.2, vol2025: 7.1, delta: 14.52, badge: "bg-blue-900" },
];

const dataSources = [
    { name: "I-TRACK Foundation", url: "https://trackingstandard.org" },
    { name: "RE100", url: "https://www.there100.org" },
    { name: "BloombergNEF", url: "https://about.bnef.com" },
    { name: "IRENA", url: "https://irena.org" },
];

export default async function IrecMundo({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'IRECMundo' });
  const tCards = await getTranslations({ locale, namespace: 'IRECMundo.cards' });
  const tTable = await getTranslations({ locale, namespace: 'IRECMundo.table' });
  const tInsights = await getTranslations({ locale, namespace: 'IRECMundo.insights' });
  
    return (
        <>
            <Header />
            <main className="max-w-7xl mx-auto px-8 lg:px-16 py-12">
                <Breadcrumb />
                <div className="mb-8">
                    <h2 className="text-4xl font-bold text-[#1e40af] mb-2">{t('pageTitle')}</h2>
                    <p className="text-gray-600 dark:text-gray-400">{t('pageSubtitle')}</p>
                </div>

                <IrecMundoChart />

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-12 mb-8">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">{tCards('volumeTitle')}</p>
                        <h3 className="text-3xl font-bold text-[#1e40af] dark:text-blue-400">380.3</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{tCards('volumeUnit')}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">{tCards('topBuyer')}</p>
                        <h3 className="text-2xl font-bold text-[#1e40af] dark:text-blue-400">Amazon</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">91.2 TWh</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">{tCards('topGrowth')}</p>
                        <h3 className="text-3xl font-bold text-green-600">+42.5%</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Rio Tinto</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">{tCards('dominantSector')}</p>
                        <h3 className="text-3xl font-bold text-[#1e40af] dark:text-blue-400">Tecnologia</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">5 {tCards('companies')}</p>
                    </div>
                </div>

                <Card>
                    <MobileTableWrapper
                        data={energiaData as unknown as Record<string, unknown>[]}
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
                        <h4 className="font-bold text-blue-900 dark:text-blue-200 mb-2">🌐 {tInsights('bigTechTitle')}</h4>
                        <p className="text-sm text-blue-800 dark:text-blue-300">{tInsights('bigTechDesc')}</p>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-6 rounded-r-xl">
                        <h4 className="font-bold text-green-900 dark:text-green-200 mb-2">📈 {tInsights('growthTitle')}</h4>
                        <p className="text-sm text-green-800 dark:text-green-300">{tInsights('growthDesc')}</p>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-500 p-6 rounded-r-xl">
                        <h4 className="font-bold text-purple-900 dark:text-purple-200 mb-2">⚡ {tInsights('diversityTitle')}</h4>
                        <p className="text-sm text-purple-800 dark:text-purple-300">{tInsights('diversityDesc')}</p>
                    </div>
                </div>

                <div className="mt-6 flex items-center justify-between">
                    <LastUpdated dataFile="irec-mundo" />
                </div>

                <DataSources sources={dataSources} downloadFile={{ name: "dados.md", path: "/dados/dados.md" }} />
            </main>
            <Footer />
        </>
    );
}
