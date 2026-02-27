export const revalidate = 3600;

import { Metadata } from "next";
import { getTranslations } from 'next-intl/server';
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { IrecPrecosChart } from "@/components/charts/IrecPrecosChart";
import { LastUpdated } from "@/components/ui/LastUpdated";
import { DataSources } from "@/components/ui/DataSources";
import { Card, Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from "@/components/ui/tremor";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'IrecPrecos' });
  
  const keywords = locale === "pt"
    ? ["preços I-REC", "I-REC Brasil", "certificado energia preço", "MWh energia renovável", "I-REC global"]
    : ["I-REC prices", "I-REC Brazil", "energy certificate price", "MWh renewable energy", "I-REC global"];

  return {
    title: t('title'),
    description: t('subtitle'),
    keywords,
    alternates: {
        canonical: `https://sintropia.space/${locale}/irec-precos`,
    },
  };
}

export default async function IRECPrecos({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'IrecPrecos' });
  const tSummary = await getTranslations({ locale, namespace: 'IrecPrecos.summaryItems' });
  const tTable = await getTranslations({ locale, namespace: 'IrecPrecos.table' });
  const tLowPrice = await getTranslations({ locale, namespace: 'IrecPrecos.lowPriceItems' });
  const tTrends = await getTranslations({ locale, namespace: 'IrecPrecos.trendsItems' });
  const tProj = await getTranslations({ locale, namespace: 'IrecPrecos.projectionValues' });
  const tDrivers = await getTranslations({ locale, namespace: 'IrecPrecos.driversList' });
  
    const brasilData = [
        { tech: "Hidro", price: "$0.16 - $0.18", vintage: "2023-2024", date: "Fev 2025" },
        { tech: "Eólica", price: "$0.19 - $0.24", vintage: "2024-2025", date: "Fev 2025" },
        { tech: "Solar", price: "$0.19 - $0.236", vintage: "2024-2025", date: "Fev 2025" },
    ];

    const amLatinaData = [
        { country: "Brasil", tech: "Hidro", price: "$0.16 - $0.18", trend: "↔️ Estável" },
        { country: "México", tech: "Eólica", price: "$4.30 - $5.05", trend: "⬆️ +187%" },
        { country: "Chile", tech: "Eólica/Solar", price: "$2.40 - $3.00", trend: "↗️ Crescendo" },
        { country: "Colômbia", tech: "Hidro", price: "$1.05 - $1.15", trend: "↗️ Crescendo" },
    ];

    const globalData = [
        { country: "China", tech: "Eólica", price: "$0.70 - $0.95", note: "⚠️ Saiu do I-REC (31/03/25)" },
        { country: "Índia", tech: "Solar", price: "$0.79 - $0.86", note: "⬆️ Demanda crescendo" },
        { country: "Malásia", tech: "Solar", price: "$5.55", note: "↗️ Em desenvolvimento" },
        { country: "Singapura", tech: "Solar", price: "$75.00", note: "⬆️ Premium por escassez" },
    ];

    const dataSources = [
        { name: "I-TRACK Foundation", url: "https://trackingstandard.org" },
        { name: "I-REC Brasil", url: "https://irec-brazil.org" },
        { name: "CCEE", url: "https://cce.org.br" },
        { name: "BloombergNEF", url: "https://about.bnef.com" },
    ];

    return (
        <>
            <Header />
            <main className="max-w-7xl mx-auto px-8 lg:px-16 py-12">
                <Breadcrumb />
                <div className="mb-8">
                    <h2 className="text-4xl font-bold text-[#1e40af] mb-2 font-inter">{t('title')}</h2>
                    <p className="text-gray-600 dark:text-gray-400 font-inter">{t('subtitle')}</p>
                    <p className="text-sm text-gray-500 mt-2 font-mono">{t('lastUpdate')}</p>
                </div>

                <IrecPrecosChart />

                {/* Resumo Executivo */}
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl p-6 mt-12 mb-8 border border-gray-200 dark:border-gray-700 shadow-sm">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">📊 {t('summary')}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { label: tSummary('globalVolume'), value: tSummary('globalVolumeValue'), sub: tSummary('globalVolumeSub') },
                            { label: tSummary('brazilPrice'), value: tSummary('brazilPriceValue'), sub: tSummary('brazilPriceSub') },
                            { label: tSummary('singaporePrice'), value: tSummary('singaporePriceValue'), sub: tSummary('singaporePriceSub') },
                            { label: tSummary('difference'), value: tSummary('differenceValue'), sub: tSummary('differenceSub') }
                        ].map((item, i) => (
                            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
                                <p className="text-xs font-bold text-gray-500 uppercase mb-1">{item.label}</p>
                                <h4 className="text-2xl font-bold text-[#1e40af] dark:text-blue-400">{item.value}</h4>
                                <p className="text-[10px] text-gray-500 mt-1 font-semibold">{item.sub}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Brasil Section */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-8 shadow-sm">
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/10 dark:to-blue-900/10">
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">🇧🇷 {t('brazil')}</h3>
                    </div>
                    <div className="p-6">
                        <Card className="mb-6">
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableHeader>{tTable('technology')}</TableHeader>
                                        <TableHeader>{tTable('price')}</TableHeader>
                                        <TableHeader>{tTable('vintage')}</TableHeader>
                                        <TableHeader className="text-right">{tTable('date')}</TableHeader>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {brasilData.map((row, i) => (
                                        <TableRow key={i}>
                                            <TableCell className="font-bold">{row.tech}</TableCell>
                                            <TableCell className="font-mono text-green-600 font-bold">{row.price}</TableCell>
                                            <TableCell>{row.vintage}</TableCell>
                                            <TableCell className="text-right">{row.date}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Card>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                                <h5 className="font-bold text-yellow-800 dark:text-yellow-200 mb-2">📉 {t('lowPriceTitle')}</h5>
                                <ul className="text-xs text-yellow-900 dark:text-yellow-100 space-y-1">
                                    <li>• {tLowPrice('oversupply')}</li>
                                    <li>• {tLowPrice('renewable')}</li>
                                </ul>
                            </div>
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                                <h5 className="font-bold text-blue-800 dark:text-blue-200 mb-2">📈 {t('trendsTitle')}</h5>
                                <ul className="text-xs text-blue-900 dark:text-blue-100 space-y-1">
                                    <li>• {tTrends('ccee')}</li>
                                    <li>• {tTrends('esg')}</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Global Section */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-8 shadow-sm">
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/10 dark:to-purple-900/10">
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">🌍 {t('asiaPacific')}</h3>
                    </div>
                    <div className="p-6">
                        <Card>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableHeader>{tTable('country')}</TableHeader>
                                        <TableHeader>{tTable('price')}</TableHeader>
                                        <TableHeader className="text-right">{tTable('observation')}</TableHeader>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {globalData.map((row, i) => (
                                        <TableRow key={i}>
                                            <TableCell className="font-bold">{row.country}</TableCell>
                                            <TableCell className="font-mono font-bold text-orange-600">{row.price}</TableCell>
                                            <TableCell className="text-right">{row.note}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Card>
                    </div>
                </div>

                {/* América Latina Section */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-8 shadow-sm">
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/10 dark:to-yellow-900/10">
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">🌎 {t('latam')}</h3>
                    </div>
                    <div className="p-6">
                        <Card>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableHeader>{tTable('country')}</TableHeader>
                                        <TableHeader>{tTable('tech')}</TableHeader>
                                        <TableHeader>{tTable('price')}</TableHeader>
                                        <TableHeader className="text-right">{tTable('trend')}</TableHeader>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {amLatinaData.map((row, i) => (
                                        <TableRow key={i}>
                                            <TableCell className="font-bold">{row.country}</TableCell>
                                            <TableCell>{row.tech}</TableCell>
                                            <TableCell className="font-mono font-bold text-[#1e40af] dark:text-blue-400">{row.price}</TableCell>
                                            <TableCell className="text-right">{row.trend}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Card>
                    </div>
                </div>

                <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-xl border border-indigo-200 dark:border-indigo-800">
                    <h3 className="text-lg font-bold text-indigo-900 dark:text-indigo-200 mb-4">📈 {t('projection')}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                        <div>
                            <p className="text-sm text-indigo-800 dark:text-indigo-300 mb-4 font-inter">{t('projectionDesc')}</p>
                            <div className="flex gap-4">
                                <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded shadow-sm border border-indigo-100">
                                    <span className="block text-[10px] uppercase font-bold text-gray-500">{tProj('estimatedValue')}</span>
                                    <span className="text-xl font-bold text-[#1e40af] dark:text-blue-400">{tProj('value')}</span>
                                </div>
                                <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded shadow-sm border border-indigo-100">
                                    <span className="block text-[10px] uppercase font-bold text-gray-500">{tProj('cagr')}</span>
                                    <span className="text-xl font-bold text-green-600">{tProj('cagrValue')}</span>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-inner border border-indigo-100">
                            <h5 className="text-xs font-bold text-gray-500 uppercase mb-3">{t('drivers')}</h5>
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs border-b border-gray-50 dark:border-gray-700 pb-1"><span>{tDrivers('re100')}</span><span className="font-bold text-green-600">Alto</span></div>
                                <div className="flex justify-between text-xs border-b border-gray-50 dark:border-gray-700 pb-1"><span>{tDrivers('scarcity')}</span><span className="font-bold text-orange-600">Médio</span></div>
                                <div className="flex justify-between text-xs pb-1"><span>{tDrivers('quality')}</span><span className="font-bold text-[#1e40af]">Alto</span></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex items-center justify-between">
                    <LastUpdated dataFile="irec-precos" />
                </div>

                <DataSources sources={dataSources} downloadFile={{ name: "irec-precos-2024-2025.md", path: "/dados/irec-precos-2024-2025.md" }} />
            </main>
            <Footer />
        </>
    );
}
