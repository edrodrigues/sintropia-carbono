export const revalidate = 3600;

import { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { CarbonoMundoChart } from "@/components/charts/CarbonoMundoChart";
import { LastUpdated } from "@/components/ui/LastUpdated";
import { DataSources } from "@/components/ui/DataSources";
import { MobileTableWrapper } from "@/components/ui/MobileTable";
import { Card, Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from "@/components/ui/tremor";

export const metadata: Metadata = {
  title: "Ranking Carbono Mundo 2025 | Maiores Compradores Globais",
  description: "Top 10 maiores compradores de créditos de carbono no mundo. Microsoft, Shell e Big Techs lideram. Veja o volume em milhões de tCO2e.",
  keywords: ["carbono mundo", "maiores compradores carbono", "Microsoft carbono", "Big Tech carbono", "créditos carbono globais"],
  alternates: {
    canonical: "https://sintropia.space/carbono-mundo",
  },
};

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

export default function CarbonoMundo() {
    return (
        <>
            <Header />
            <main className="max-w-7xl mx-auto px-8 lg:px-16 py-12">
                <Breadcrumb />
                <div className="mb-8">
                    <h2 className="text-4xl font-bold text-[#1e40af] mb-2">Compradores de Carbono (Mundo)</h2>
                    <p className="text-gray-600 dark:text-gray-400">Top corporações globais por volume de créditos de carbono (Milhões tCO2e).</p>
                </div>

                <CarbonoMundoChart />

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Volume Total 2025</p>
                        <h3 className="text-3xl font-bold text-[#1e40af] dark:text-blue-400">73.2M</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">tCO2e (Top 10)</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Maior Comprador</p>
                        <h3 className="text-2xl font-bold text-[#1e40af] dark:text-blue-400">Microsoft</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">29.5M tCO2e</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Maior Crescimento</p>
                        <h3 className="text-3xl font-bold text-green-600">+95.3%</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">AtmosClear</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Setor Dominante</p>
                        <h3 className="text-3xl font-bold text-[#1e40af] dark:text-blue-400">Energia</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">50% do Top 10</p>
                    </div>
                </div>

                <Card>
                    <MobileTableWrapper
                        data={carbonoData as unknown as Record<string, unknown>[]}
                        defaultMobileColumns={["rank", "empresa", "delta"]}
                        columns={[
                            { key: "rank", header: "Rank", align: "center" },
                            { key: "empresa", header: "Empresa" },
                            { key: "setor", header: "Setor", mobileHidden: true },
                            { key: "vol2024", header: "Vol 2024", align: "right", mobileHidden: true },
                            { key: "vol2025", header: "Vol 2025", align: "right", mobileHidden: true },
                            { key: "delta", header: "Delta %", align: "right" },
                        ]}
                    />
                </Card>

                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-6 rounded-r-xl">
                        <h4 className="font-bold text-blue-900 dark:text-blue-200 mb-2">💻 Microsoft Líder</h4>
                        <p className="text-sm text-blue-800 dark:text-blue-300">A Microsoft consolidou sua posição como maior compradora global de créditos de carbono de alta integridade.</p>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-500 p-6 rounded-r-xl">
                        <h4 className="font-bold text-purple-900 dark:text-purple-200 mb-2">🚀 CDR em Ascensão</h4>
                        <p className="text-sm text-purple-800 dark:text-purple-300">Tecnologias de Remoção de Carbono (CDR) atraem investimentos massivos de empresas de tecnologia e logística.</p>
                    </div>
                    <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-6 rounded-r-xl">
                        <h4 className="font-bold text-red-900 dark:text-red-200 mb-2">📉 Ajuste de Portfólio</h4>
                        <p className="text-sm text-red-800 dark:text-red-300">Algumas gigantes da energia estão reduzindo volumes de créditos baseados em natureza para focar em tecnologia.</p>
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
