import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { CarbonoBrasilChart } from "@/components/charts/CarbonoBrasilChart";
import { LastUpdated } from "@/components/ui/LastUpdated";
import { DataSources } from "@/components/ui/DataSources";

const carbonoData = [
  { rank: 1, empresa: "Banco Votorantim", setor: "Financeiro", vol2024: 3.8, vol2025: 5.2, delta: 36.84 },
  { rank: 2, empresa: "Petrobras", setor: "Energia", vol2024: 0.68, vol2025: 0.75, delta: 10.29 },
  { rank: 3, empresa: "Suzano", setor: "Celulose", vol2024: 0.42, vol2025: 0.58, delta: 38.1 },
  { rank: 4, empresa: "Vale", setor: "Mineração", vol2024: 0.38, vol2025: 0.45, delta: 18.42 },
  { rank: 5, empresa: "Itaú", setor: "Financeiro", vol2024: 0.31, vol2025: 0.39, delta: 25.81 },
  { rank: 6, empresa: "Bradesco", setor: "Financeiro", vol2024: 0.29, vol2025: 0.36, delta: 24.14 },
  { rank: 7, empresa: "Klabin", setor: "Celulose", vol2024: 0.25, vol2025: 0.32, delta: 28.0 },
  { rank: 8, empresa: "Natura", setor: "Cosméticos", vol2024: 0.23, vol2025: 0.29, delta: 26.09 },
  { rank: 9, empresa: "Banco do Brasil", setor: "Financeiro", vol2024: 0.21, vol2025: 0.27, delta: 28.57 },
  { rank: 10, empresa: "Gerdau", setor: "Siderurgia", vol2024: 0.195, vol2025: 0.25, delta: 28.21 },
  { rank: 11, empresa: "Lojas Renner", setor: "Varejo", vol2024: 0.18, vol2025: 0.24, delta: 33.33 },
  { rank: 12, empresa: "GOL", setor: "Aviação", vol2024: 0.175, vol2025: 0.23, delta: 31.43 },
  { rank: 13, empresa: "Azul", setor: "Aviação", vol2024: 0.165, vol2025: 0.215, delta: 30.3 },
  { rank: 14, empresa: "Ambev", setor: "Bebidas", vol2024: 0.15, vol2025: 0.195, delta: 30.0 },
  { rank: 15, empresa: "JBS", setor: "Proteína Animal", vol2024: 0.14, vol2025: 0.18, delta: 28.57 },
  { rank: 16, empresa: "Raízen", setor: "Energia", vol2024: 0.135, vol2025: 0.17, delta: 25.93 },
  { rank: 17, empresa: "Cosan", setor: "Energia", vol2024: 0.12, vol2025: 0.155, delta: 29.17 },
  { rank: 18, empresa: "Cielo", setor: "Serviços Fin.", vol2024: 0.115, vol2025: 0.15, delta: 30.43 },
  { rank: 19, empresa: "Marfrig", setor: "Proteína Animal", vol2024: 0.105, vol2025: 0.14, delta: 33.33 },
  { rank: 20, empresa: "Localiza", setor: "Logística", vol2024: 0.095, vol2025: 0.13, delta: 36.84 },
];

const getSetorBadge = (setor: string) => {
  const badges: Record<string, string> = {
    Financeiro: "bg-blue-600",
    Energia: "bg-green-600",
    Celulose: "bg-amber-700",
    Mineração: "bg-zinc-600",
    Varejo: "bg-cyan-600",
    Aviação: "bg-red-600",
    Bebidas: "bg-orange-600",
    "Proteína Animal": "bg-lime-700",
    Cosméticos: "bg-pink-600",
    "Serviços Fin.": "bg-indigo-600",
    Siderurgia: "bg-gray-700",
    Logística: "bg-teal-700",
  };
  return badges[setor] || "bg-gray-600";
};

const getGrowthClass = (delta: number) => {
  if (delta >= 35) return "text-green-600 dark:text-green-400 font-bold";
  if (delta >= 25) return "text-green-500 dark:text-green-300 font-semibold";
  if (delta >= 15) return "text-yellow-600 dark:text-yellow-400 font-semibold";
  return "text-gray-600 dark:text-gray-400";
};

const getTopClass = (rank: number) => {
  if (rank === 1) return "bg-yellow-50 dark:bg-yellow-900/20";
  if (rank === 2) return "bg-blue-50 dark:bg-blue-900/20";
  if (rank === 3) return "bg-purple-50 dark:bg-purple-900/20";
  return "";
};

const dataSources = [
  { name: "Verra Registry", url: "https://verra.org" },
  { name: "Gold Standard", url: "https://goldstandard.org" },
  { name: "RenovaBio", url: "https://www.gov.br/anp/pt-br/assuntos/renovaBio" },
  { name: "B3", url: "https://www.b3.com.br" },
];

export default function CarbonoBrasil() {
  const totalVolume = carbonoData.reduce((acc, row) => acc + row.vol2025, 0);
  const crescimento = ((totalVolume - carbonoData.reduce((acc, row) => acc + row.vol2024, 0)) / carbonoData.reduce((acc, row) => acc + row.vol2024, 0)) * 100;
  const setores = [...new Set(carbonoData.map((d) => d.setor))];

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-8 lg:px-16 py-12">
        <Breadcrumb />
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-[#1e40af] mb-2">
            Mercado Brasileiro por Setor
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Top 25 empresas brasileiras por setor de atuação no mercado de créditos
            de carbono.
          </p>
        </div>

        <CarbonoBrasilChart />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">
              Volume Total 2025
            </p>
            <h3 className="text-3xl font-bold text-[#1e40af]">
              {totalVolume.toFixed(1)}M
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">tCO2e</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">
              Crescimento Médio
            </p>
            <h3 className="text-3xl font-bold text-green-600">+{crescimento.toFixed(1)}%</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">vs 2024</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">
              Setores
            </p>
            <h3 className="text-3xl font-bold text-[#1e40af]">{setores.length}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              setores representados
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">
              Líder
            </p>
            <h3 className="text-2xl font-bold text-[#1e40af]">Banco Votorantim</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">5.2M tCO2e</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700">
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider w-16">
                    Rank
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Empresa
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Setor
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Vol 2024
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Vol 2025
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Delta %
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {carbonoData.map((row) => (
                  <tr
                    key={row.rank}
                    className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 ${getTopClass(
                      row.rank
                    )}`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-center text-gray-500 dark:text-gray-400">
                      {row.rank}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-900 dark:text-gray-100">
                      {row.empresa}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold text-white ${getSetorBadge(
                          row.setor
                        )}`}
                      >
                        {row.setor}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right font-mono text-gray-600 dark:text-gray-400">
                      {row.vol2024.toFixed(2)}M
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right font-mono font-semibold text-gray-900 dark:text-gray-100">
                      {row.vol2025.toFixed(2)}M
                    </td>
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-right font-mono ${getGrowthClass(
                        row.delta
                      )}`}
                    >
                      +{row.delta.toFixed(2)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-8 bg-gray-50 dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4">
            Setores Representados
          </h3>
          <div className="flex flex-wrap gap-2">
            {setores.map((setor) => (
              <span
                key={setor}
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold text-white ${getSetorBadge(
                  setor
                )}`}
              >
                {setor}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <LastUpdated dataFile="carbono-brasil" />
        </div>

        <DataSources sources={dataSources} />
      </main>
      <Footer />
    </>
  );
}
