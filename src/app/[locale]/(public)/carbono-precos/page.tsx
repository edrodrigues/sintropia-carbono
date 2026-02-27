export const revalidate = 3600;

import { Metadata } from "next";
import { getTranslations } from 'next-intl/server';
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { CarbonoPrecosChart } from "@/components/charts/CarbonoPrecosChart";
import { LastUpdated } from "@/components/ui/LastUpdated";
import { DataSources } from "@/components/ui/DataSources";
import { Card, Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from "@/components/ui/tremor";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'CarbonoPrecos' });
  
  const keywords = locale === "pt"
    ? ["preços carbono", "EU ETS preço", "mercado carbono", "tonelada CO2 preço", "crédito carbono valor", "VCM carbono"]
    : ["carbon prices", "EU ETS price", "carbon market", "ton CO2 price", "carbon credit value", "VCM carbon"];

  return {
    title: t('title'),
    description: t('subtitle'),
    keywords,
    alternates: {
        canonical: `https://sintropia.space/${locale}/carbono-precos`,
    },
  };
}

const dataSources = [
    { name: "BloombergNEF", url: "https://about.bnef.com" },
    { name: "World Bank Carbon Pricing", url: "https://carbonpricingdashboard.worldbank.org" },
    { name: "ICAP", url: "https://icapcarbonaction.com" },
    { name: "B3", url: "https://www.b3.com.br" },
];

export default async function CarbonoPrecos({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'CarbonoPrecos' });
  const tSummary = await getTranslations({ locale, namespace: 'CarbonoPrecos.summaryItems' });
  const tTable = await getTranslations({ locale, namespace: 'CarbonoPrecos.table' });
  const tQuality = await getTranslations({ locale, namespace: 'CarbonoPrecos.qualityLevels' });
  const tBrazil = await getTranslations({ locale, namespace: 'CarbonoPrecos.brazil' });
  const tGlossary = await getTranslations({ locale, namespace: 'CarbonoPrecos.glossaryTerms' });
  const tRegulated = await getTranslations({ locale, namespace: 'CarbonoPrecos.regulatedMarkets' });
  
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

                <CarbonoPrecosChart />

                {/* Resumo */}
                <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl p-6 mt-12 mb-8 border border-gray-200 dark:border-gray-700">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">📊 {t('summary')}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { label: tSummary('latam'), value: tSummary('latamValue'), sub: tSummary('latamSub'), color: "text-[#1e40af]" },
                            { label: tSummary('euEts'), value: tSummary('euEtsValue'), sub: tSummary('euEtsSub'), color: "text-green-600" },
                            { label: tSummary('freeMarket'), value: tSummary('freeMarketValue'), sub: tSummary('freeMarketSub'), color: "text-orange-600" },
                            { label: "⚠️ " + tSummary('colombia'), value: tSummary('colombiaValue'), sub: tSummary('colombiaSub'), color: "text-red-600" }
                        ].map((item, i) => (
                            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
                                <p className="text-xs font-bold text-gray-500 uppercase mb-1">{item.label}</p>
                                <h4 className={`text-2xl font-bold ${item.color}`}>{item.value}</h4>
                                <p className="text-[10px] text-gray-500 mt-1 font-semibold">{item.sub}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Mercados Regulados */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-8 shadow-sm">
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/10 dark:to-purple-900/10">
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">🏛️ {t('regulated')}</h3>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { title: "🇪🇺 " + tRegulated('euEts'), price: "€60-80", detail: `${tRegulated('avg2024')}: €65`, bg: "bg-blue-50 dark:bg-blue-900/20", border: "border-blue-200 dark:border-blue-800" },
                            { title: "🇬🇧 " + tRegulated('ukEts'), price: "£35-45", detail: `${tRegulated('avg2024')}: £40`, bg: "bg-purple-50 dark:bg-purple-900/20", border: "border-purple-200 dark:border-purple-800" },
                            { title: "🇺🇸 " + tRegulated('california'), price: "$28-32", detail: `${tRegulated('minimum')}: $20.82`, bg: "bg-green-50 dark:bg-green-900/20", border: "border-green-200 dark:border-green-800" }
                        ].map((market, i) => (
                            <div key={i} className={`${market.bg} rounded-lg p-4 border ${market.border}`}>
                                <h4 className="font-bold text-gray-800 dark:text-gray-100 mb-1">{market.title}</h4>
                                <p className="text-2xl font-bold text-[#1e40af] dark:text-blue-400">{market.price}</p>
                                <p className="text-xs text-gray-500 font-mono">{market.detail}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Mercado Voluntário */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-8 shadow-sm">
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10">
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">🌱 {t('voluntary')}</h3>
                    </div>
                    <div className="p-6">
                        <Card>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableHeader>{tTable('quality')}</TableHeader>
                                        <TableHeader>{tTable('price')}</TableHeader>
                                        <TableHeader>{tTable('status')}</TableHeader>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    <TableRow>
                                        <TableCell className="font-bold text-green-600">{tQuality('highIntegrity')}</TableCell>
                                        <TableCell className="font-mono">$14.80</TableCell>
                                        <TableCell>{tQuality('highIntegrityDesc')}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-bold text-blue-600">{tQuality('standard')}</TableCell>
                                        <TableCell className="font-mono">$7.00 - $10.00</TableCell>
                                        <TableCell>{tQuality('standardDesc')}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-bold text-gray-500">{tQuality('legacy')}</TableCell>
                                        <TableCell className="font-mono">$3.50</TableCell>
                                        <TableCell>{tQuality('legacyDesc')}</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </Card>
                    </div>
                </div>

                {/* Brasil Section */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-8 shadow-sm">
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-yellow-50 to-green-50 dark:from-yellow-900/10 dark:to-green-900/10">
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white font-inter">🇧🇷 {t('brazilian')}</h3>
                    </div>
                    <div className="p-6">
                        <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 mb-6">
                            <h4 className="font-bold text-blue-900 dark:text-blue-200 mb-1">{tBrazil('law')}</h4>
                            <p className="text-sm text-blue-800 dark:text-blue-300 italic">{tBrazil('lawDesc')}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                                <h5 className="font-bold text-gray-800 dark:text-gray-100 mb-3 border-b border-gray-100 dark:border-gray-700 pb-2">{tBrazil('nbs')}</h5>
                                <ul className="space-y-2 text-sm">
                                    <li className="flex justify-between"><span>{tBrazil('nbsTypes.redd')}</span><span className="font-mono font-bold">$12-18</span></li>
                                    <li className="flex justify-between"><span>{tBrazil('nbsTypes.restoration')}</span><span className="font-mono font-bold">$15-25</span></li>
                                    <li className="flex justify-between"><span>{tBrazil('nbsTypes.mangroves')}</span><span className="font-mono font-bold">$20-30</span></li>
                                </ul>
                            </div>
                            <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                                <h5 className="font-bold text-gray-800 dark:text-gray-100 mb-3 border-b border-gray-100 dark:border-gray-700 pb-2">{tBrazil('tech')}</h5>
                                <ul className="space-y-2 text-sm">
                                    <li className="flex justify-between"><span>{tBrazil('techTypes.stoves')}</span><span className="font-mono font-bold">$4-8</span></li>
                                    <li className="flex justify-between"><span>{tBrazil('techTypes.methane')}</span><span className="font-mono font-bold">$6-12</span></li>
                                    <li className="flex justify-between"><span>{tBrazil('techTypes.biochar')}</span><span className="font-mono font-bold">$100-200</span></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-8 bg-gray-50 dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">📚 {t('glossary')}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-2 text-xs">
                        <p><span className="font-bold text-[#1e40af]">SBCE:</span> {tGlossary('sbce')}</p>
                        <p><span className="font-bold text-[#1e40af]">tCO2e:</span> {tGlossary('tco2e')}</p>
                        <p><span className="font-bold text-[#1e40af]">AFOLU:</span> {tGlossary('afolu')}</p>
                        <p><span className="font-bold text-[#1e40af]">ETS:</span> {tGlossary('ets')}</p>
                        <p><span className="font-bold text-[#1e40af]">ARR:</span> {tGlossary('arr')}</p>
                        <p><span className="font-bold text-[#1e40af]">VCM:</span> {tGlossary('vcm')}</p>
                    </div>
                </div>

                <div className="mt-6 flex items-center justify-between">
                    <LastUpdated dataFile="carbono-precos" />
                </div>

                <DataSources sources={dataSources} downloadFile={{ name: "carbono-precos-2024-2025.md", path: "/dados/carbono-precos-2024-2025.md" }} />
            </main>
            <Footer />
        </>
    );
}
