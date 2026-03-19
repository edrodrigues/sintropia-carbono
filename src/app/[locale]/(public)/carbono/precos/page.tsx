export const revalidate = 3600;

import { Metadata } from "next";
import { getTranslations } from 'next-intl/server';
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { CarbonoPrecosChart } from "@/components/charts/CarbonoPrecosChart";
import { LastUpdated } from "@/components/ui/LastUpdated";
import { DataSources } from "@/components/ui/DataSources";
import { Card, Table, TableHead, TableBody, TableRow, TableHeader, TableCell, Badge } from "@/components/ui/tremor";
import { getCarbonPrices } from "@/lib/queries/carbon-prices";

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
        canonical: `https://sintropia.space/${locale}/carbono/precos`,
    },
  };
}

export default async function CarbonoPrecosPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  // Try to fetch from DB
  const dbPrices = await getCarbonPrices();
  
  const t = await getTranslations({ locale, namespace: 'CarbonoPrecos' });
  const tSummary = await getTranslations({ locale, namespace: 'CarbonoPrecos.summaryItems' });
  const tTable = await getTranslations({ locale, namespace: 'CarbonoPrecos.table' });
  const tQuality = await getTranslations({ locale, namespace: 'CarbonoPrecos.qualityLevels' });
  const tBrazil = await getTranslations({ locale, namespace: 'CarbonoPrecos.brazil' });
  const tGlossary = await getTranslations({ locale, namespace: 'CarbonoPrecos.glossaryTerms' });
  // Use DB data with fallback
  const compliancePrices = dbPrices.filter(p => p.market_type === 'compliance');
  const voluntaryPrices = dbPrices.filter(p => p.market_type === 'voluntary');

  const displayCompliance = compliancePrices.length > 0 
    ? compliancePrices.map(p => ({ name: p.market_name, region: p.region, price: p.price_range, obs: p.observation }))
    : [
        { name: "European Union ETS (EU ETS)", region: "Europe", price: "€60 - €80", obs: "Maior mercado do mundo. Média 2024: €65" },
        { name: "United Kingdom ETS (UK ETS)", region: "UK", price: "£35 - £45", obs: "Geralmente negociado com desconto vs EU ETS" },
        { name: "California Cap and Trade", region: "USA", price: "$28 - $32", obs: "Preço mínimo 2024: $20.82" },
        { name: "China National ETS", region: "China", price: "$11 - $14", obs: "Maior por cobertura (4.5B tCO2e)" }
    ];

  const displayVoluntary = voluntaryPrices.length > 0
    ? voluntaryPrices.map(p => ({ quality: p.market_name, price: p.price_range, obs: p.observation }))
    : [
        { quality: tQuality('highIntegrity'), price: "$14.80", obs: tQuality('highIntegrityDesc') },
        { quality: tQuality('standard'), price: "$7.00 - $10.00", obs: tQuality('standardDesc') },
        { quality: tQuality('legacy'), price: "$3.50", obs: tQuality('legacyDesc') }
    ];

    const dataSources = [
        { name: "BloombergNEF", url: "https://about.bnef.com" },
        { name: "World Bank Carbon Pricing", url: "https://carbonpricingdashboard.worldbank.org" },
        { name: "ICAP", url: "https://icapcarbonaction.com" },
        { name: "B3", url: "https://www.b3.com.br" },
    ];

    return (
        <>
            <Header />
            <main className="max-w-7xl mx-auto px-4 lg:px-8 lg:px-16 py-12">
                <Breadcrumb />
                <div className="mb-8">
                    <h2 className="text-4xl font-bold text-[#059669] mb-2 font-inter">{t('title')}</h2>
                    <p className="text-gray-600 dark:text-gray-400 font-inter">{t('subtitle')}</p>
                    <p className="text-sm text-gray-500 mt-2 font-mono">{t('lastUpdate')}</p>
                </div>

                <CarbonoPrecosChart />

                {/* Summary Section */}
                <div className="bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 rounded-xl p-6 mt-12 mb-8 border border-gray-200 dark:border-gray-700 shadow-sm">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">📊 {t('summary')}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { label: tSummary('latam'), value: tSummary('latamValue'), sub: tSummary('latamSub'), color: "text-emerald-700" },
                            { label: tSummary('euEts'), value: tSummary('euEtsValue'), sub: tSummary('euEtsSub'), color: "text-blue-600" },
                            { label: tSummary('freeMarket'), value: tSummary('freeMarketValue'), sub: tSummary('freeMarketSub'), color: "text-amber-600" },
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

                {/* Regulated Markets */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-8 shadow-sm">
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-900/10 dark:to-emerald-800/10">
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">🏛️ {t('regulated')}</h3>
                    </div>
                    <div className="p-6">
                        <Card>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableHeader>Mercado</TableHeader>
                                        <TableHeader>Região</TableHeader>
                                        <TableHeader>Faixa de Preço</TableHeader>
                                        <TableHeader className="text-right">Observação</TableHeader>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {displayCompliance.map((row, i) => (
                                        <TableRow key={i}>
                                            <TableCell className="font-bold">{row.name}</TableCell>
                                            <TableCell><Badge color="gray">{row.region}</Badge></TableCell>
                                            <TableCell className="font-mono font-bold text-emerald-600">{row.price}</TableCell>
                                            <TableCell className="text-right text-sm text-gray-500">{row.obs}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Card>
                    </div>
                </div>

                {/* Voluntary Market */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-8 shadow-sm">
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-emerald-50 dark:from-blue-900/10 dark:to-emerald-900/10">
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">🌱 {t('voluntary')}</h3>
                    </div>
                    <div className="p-6">
                        <Card>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableHeader>{tTable('quality')}</TableHeader>
                                        <TableHeader>{tTable('price')}</TableHeader>
                                        <TableHeader className="text-right">{tTable('status')}</TableHeader>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {displayVoluntary.map((row, i) => (
                                        <TableRow key={i}>
                                            <TableCell className="font-bold">{row.quality}</TableCell>
                                            <TableCell className="font-mono font-bold text-[#1e40af]">{row.price}</TableCell>
                                            <TableCell className="text-right text-sm text-gray-500">{row.obs}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Card>
                    </div>
                </div>

                {/* Brazil Section */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-8 shadow-sm">
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-yellow-50 to-green-50 dark:from-yellow-900/10 dark:to-green-900/10">
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white font-inter">🇧🇷 {t('brazilian')}</h3>
                    </div>
                    <div className="p-6">
                        <div className="bg-emerald-50 dark:bg-emerald-900/20 border-l-4 border-emerald-500 p-4 mb-6">
                            <h4 className="font-bold text-emerald-900 dark:text-emerald-200 mb-1">{tBrazil('law')}</h4>
                            <p className="text-sm text-emerald-800 dark:text-emerald-300 italic">{tBrazil('lawDesc')}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                                <h5 className="font-bold text-gray-800 dark:text-gray-100 mb-3 border-b border-gray-100 dark:border-gray-700 pb-2">{tBrazil('nbs')}</h5>
                                <ul className="space-y-2 text-sm">
                                    <li className="flex justify-between"><span>REDD+ (Alta Qualidade)</span><span className="font-mono font-bold text-emerald-600">$12-18</span></li>
                                    <li className="flex justify-between"><span>Restauração Nativa (ARR)</span><span className="font-mono font-bold text-emerald-600">$15-25</span></li>
                                    <li className="flex justify-between"><span>Mangues (Blue Carbon)</span><span className="font-mono font-bold text-emerald-600">$20-30</span></li>
                                </ul>
                            </div>
                            <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                                <h5 className="font-bold text-gray-800 dark:text-gray-100 mb-3 border-b border-gray-100 dark:border-gray-700 pb-2">Tecnologias</h5>
                                <ul className="space-y-2 text-sm">
                                    <li className="flex justify-between"><span>Fogões Eficientes</span><span className="font-mono font-bold text-blue-600">$4-8</span></li>
                                    <li className="flex justify-between"><span>Captura de Metano</span><span className="font-mono font-bold text-blue-600">$6-12</span></li>
                                    <li className="flex justify-between"><span>Biochar</span><span className="font-mono font-bold text-blue-600">$100-200</span></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-8 bg-gray-50 dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">📚 {t('glossary')}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-2 text-xs">
                        <p><span className="font-bold text-[#059669]">SBCE:</span> {tGlossary('sbce')}</p>
                        <p><span className="font-bold text-[#059669]">tCO2e:</span> {tGlossary('tco2e')}</p>
                        <p><span className="font-bold text-[#059669]">AFOLU:</span> {tGlossary('afolu')}</p>
                        <p><span className="font-bold text-[#059669]">ETS:</span> {tGlossary('ets')}</p>
                        <p><span className="font-bold text-[#059669]">ARR:</span> {tGlossary('arr')}</p>
                        <p><span className="font-bold text-[#059669]">VCM:</span> {tGlossary('vcm')}</p>
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
