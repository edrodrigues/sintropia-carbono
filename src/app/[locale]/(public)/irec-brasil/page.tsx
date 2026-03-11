export const revalidate = 3600;

import { Metadata } from "next";
import { getTranslations } from 'next-intl/server';
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { IrecBrasilChart } from "@/components/charts/IrecBrasilChart";
import { LastUpdated } from "@/components/ui/LastUpdated";
import { DataSources } from "@/components/ui/DataSources";
import { MobileTableWrapper } from "@/components/ui/MobileTable";
import { Card } from "@/components/ui/tremor";
import { getIrecStakeholders, getIrecStats } from "@/lib/queries/irec";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  
  const titles: Record<string, string> = {
    pt: "I-REC Brasil 2025 | Ranking Empresas Certificados Energia",
    en: "I-REC Brazil 2025 | Energy Certificates Company Ranking"
  };
  
  const descriptions: Record<string, string> = {
    pt: "Top 20 empresas brasileiras por volume de certificados I-REC transacionados. Eletrobras, Vale, Neoenergia e Gerdau lideram o mercado.",
    en: "Top 20 Brazilian companies by volume of I-REC certificates traded. Eletrobras, Vale, Neoenergia and Gerdau lead the market."
  };

  return {
    title: titles[locale] || titles.pt,
    description: descriptions[locale] || descriptions.pt,
    keywords: locale === "pt" 
      ? ["I-REC Brasil", "certificados energia renovável", "I-REC empresas", "energia renovável Brasil", "volume I-REC"]
      : ["I-REC Brazil", "renewable energy certificates", "I-REC companies", "renewable energy Brazil", "I-REC volume"],
    alternates: {
      canonical: `https://sintropia.space/${locale === 'pt' ? '' : locale + '/' }irec-brasil`,
    },
  };
}

const irecData = [
  { rank: 1, empresa: "Eletrobras", papel: "Vendedor", vol2024: 9200, vol2025: 14500, delta: 57.61 },
  { rank: 2, empresa: "Vale", papel: "Comprador", vol2024: 4200, vol2025: 5500, delta: 30.95 },
  { rank: 3, empresa: "Neoenergia", papel: "Vendedor", vol2024: 3200, vol2025: 4800, delta: 50.0 },
  { rank: 4, empresa: "Gerdau", papel: "Comprador", vol2024: 3200, vol2025: 4150, delta: 29.69 },
  { rank: 5, empresa: "Petrobras", papel: "Comprador", vol2024: 2800, vol2025: 3650, delta: 30.36 },
  { rank: 6, empresa: "JBS", papel: "Comprador", vol2024: 2400, vol2025: 3100, delta: 29.17 },
  { rank: 7, empresa: "Braskem", papel: "Comprador", vol2024: 2100, vol2025: 2750, delta: 30.95 },
  { rank: 8, empresa: "Voltalia Brasil", papel: "Vendedor", vol2024: 1100, vol2025: 2500, delta: 127.27 },
  { rank: 9, empresa: "Raízen", papel: "Comprador", vol2024: 1800, vol2025: 2400, delta: 33.33 },
  { rank: 10, empresa: "Suzano", papel: "Comprador", vol2024: 1550, vol2025: 2050, delta: 32.26 },
  { rank: 11, empresa: "Ambev", papel: "Comprador", vol2024: 1250, vol2025: 1630, delta: 30.4 },
  { rank: 12, empresa: "CGN Brasil Energia", papel: "Vendedor", vol2024: 950, vol2025: 1300, delta: 36.84 },
  { rank: 13, empresa: "Itaú Unibanco", papel: "Comprador", vol2024: 620, vol2025: 810, delta: 30.65 },
  { rank: 14, empresa: "Bradesco", papel: "Comprador", vol2024: 550, vol2025: 720, delta: 30.91 },
  { rank: 15, empresa: "Banco do Brasil", papel: "Comprador", vol2024: 520, vol2025: 680, delta: 30.77 },
  { rank: 16, empresa: "Santander Brasil", papel: "Comprador", vol2024: 480, vol2025: 625, delta: 30.21 },
  { rank: 17, empresa: "Natura &Co", papel: "Comprador", vol2024: 410, vol2025: 535, delta: 30.49 },
  { rank: 18, empresa: "Magazine Luiza", papel: "Comprador", vol2024: 280, vol2025: 365, delta: 30.36 },
  { rank: 19, empresa: "Embraer", papel: "Comprador", vol2024: 260, vol2025: 340, delta: 30.77 },
  { rank: 20, empresa: "Lojas Renner", papel: "Comprador", vol2024: 195, vol2025: 255, delta: 30.77 },
];

const dataSources = [
  { name: "I-REC Brasil", url: "https://irec-brazil.org" },
  { name: "I-TRACK Foundation", url: "https://trackingstandard.org" },
  { name: "Eletrobras", url: "https://eletrobras.com" },
  { name: "ANEEL", url: "https://aneel.gov.br" },
];

export default async function IrecBrasil({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  // Fetch data from Supabase
  const [dbStakeholders, dbStats] = await Promise.all([
    getIrecStakeholders('brazil'),
    getIrecStats('brazil')
  ]);

  const t = await getTranslations({ locale, namespace: 'IREC' });
  const tCards = await getTranslations({ locale, namespace: 'IREC.cards' });
  const tTable = await getTranslations({ locale, namespace: 'IREC.table' });
  const tLegend = await getTranslations({ locale, namespace: 'IREC.legend' });
  const tInsights = await getTranslations({ locale, namespace: 'IREC.insights' });
  
  // Use DB data if available, otherwise fallback to static data
  const hasDbData = dbStakeholders.length > 0;
  
  const displayData = hasDbData 
    ? dbStakeholders.map(s => ({
        rank: s.ranking,
        empresa: s.empresa,
        papel: s.papel_mercado || 'N/A',
        vol2024: s.volume_2024,
        vol2025: s.volume_2025,
        delta: s.delta_pct
      }))
    : irecData;

  const totalVolume = hasDbData ? dbStats.total2025 : irecData.reduce((acc, row) => acc + row.vol2025, 0);
  const totalVolume2024 = hasDbData ? dbStats.total2024 : irecData.reduce((acc, row) => acc + row.vol2024, 0);
  const crescimento = hasDbData ? dbStats.crescimento : ((totalVolume - totalVolume2024) / totalVolume2024) * 100;

  const sellersCount = hasDbData 
    ? dbStakeholders.filter(s => s.papel_mercado?.toLowerCase().includes('vendedor') || s.papel_mercado?.toLowerCase().includes('gerador')).length
    : irecData.filter(s => s.papel === "Vendedor").length;

  const leader = hasDbData ? dbStakeholders[0] : irecData[0];
  const leaderName = (leader as any).empresa;
  const leaderVol = hasDbData ? (leader as any).volume_2025 : (leader as any).vol2025;

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-4 lg:px-8 lg:px-16 py-8 lg:py-12">
        <Breadcrumb />
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-[#1e40af] mb-2">
            {t('pageTitle')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {t('pageSubtitle')}
          </p>
        </div>

        <IrecBrasilChart />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-12 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">
              {tCards('totalVolume')}
            </p>
            <h3 className="text-3xl font-bold text-[#1e40af]">
              {(totalVolume / 1000).toFixed(1)}M
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">I-RECs</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">
              {tCards('growth')}
            </p>
            <h3 className="text-3xl font-bold text-green-600">+{crescimento.toFixed(1)}%</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{tCards('vsLastYear')}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">
              {tCards('sellers')}
            </p>
            <h3 className="text-3xl font-bold text-green-600">{sellersCount}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              {tCards('topGenerators')}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">
              {tCards('leader')}
            </p>
            <h3 className="text-2xl font-bold text-[#1e40af] truncate" title={leaderName}>{leaderName}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              {(leaderVol / 1000).toFixed(1)}M I-RECs
            </p>
          </div>
        </div>

        <Card>
          <MobileTableWrapper
            data={displayData as unknown as Record<string, unknown>[]}
            defaultMobileColumns={["rank", "empresa", "papel", "delta"]}
            columns={[
              { key: "rank", header: tTable('rank'), align: "center" },
              { key: "empresa", header: tTable('company') },
              { key: "papel", header: tTable('role') },
              { key: "vol2024", header: tTable('vol2024'), align: "right" },
              { key: "vol2025", header: tTable('vol2025'), align: "right" },
              { key: "delta", header: tTable('delta'), align: "right" },
            ]}
          />
        </Card>

        <div className="mt-8 bg-gray-50 dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4">
            {tLegend('title')}
          </h3>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold text-white bg-green-600">
                {tLegend('seller')}
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {tLegend('sellerDesc')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold text-white bg-blue-600">
                {tLegend('buyer')}
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {tLegend('buyerDesc')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold text-white bg-purple-600">
                {tLegend('both')}
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {tLegend('bothDesc')}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-6 rounded-r-xl">
            <h4 className="font-bold text-green-900 dark:text-green-200 mb-2">
              ⚡ {tInsights('leaderTitle')}
            </h4>
            <p className="text-sm text-green-800 dark:text-green-300">
              {tInsights('leaderDesc')}
            </p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-6 rounded-r-xl">
            <h4 className="font-bold text-blue-900 dark:text-blue-200 mb-2">
              📈 {tInsights('growthTitle')}
            </h4>
            <p className="text-sm text-blue-800 dark:text-blue-300">
              {tInsights('growthDesc')}
            </p>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-500 p-6 rounded-r-xl">
            <h4 className="font-bold text-purple-900 dark:text-purple-200 mb-2">
              🏢 {tInsights('financeTitle')}
            </h4>
            <p className="text-sm text-purple-800 dark:text-purple-300">
              {tInsights('financeDesc')}
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <LastUpdated dataFile="irec-brasil" />
        </div>

        <DataSources sources={dataSources} downloadFile={{ name: "dados.md", path: "/dados/dados.md" }} />
      </main>
      <Footer />
    </>
  );
}
