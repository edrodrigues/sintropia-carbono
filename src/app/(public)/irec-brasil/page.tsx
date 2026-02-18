import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { IrecBrasilChart } from "@/components/charts/IrecBrasilChart";

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

const getPapelBadge = (papel: string) => {
  switch (papel) {
    case "Vendedor":
      return "bg-green-600";
    case "Comprador":
      return "bg-blue-600";
    case "Ambos":
      return "bg-purple-600";
    default:
      return "bg-gray-600";
  }
};

const getGrowthClass = (delta: number) => {
  if (delta >= 50) return "text-green-600 dark:text-green-400 font-bold";
  if (delta >= 30) return "text-green-500 dark:text-green-300 font-semibold";
  if (delta >= 20) return "text-yellow-600 dark:text-yellow-400 font-semibold";
  return "text-gray-600 dark:text-gray-400";
};

const getTopClass = (rank: number) => {
  if (rank === 1) return "bg-yellow-50 dark:bg-yellow-900/20";
  if (rank === 2) return "bg-blue-50 dark:bg-blue-900/20";
  if (rank === 3) return "bg-purple-50 dark:bg-purple-900/20";
  return "";
};

export default function IrecBrasil() {
  const totalVolume = irecData.reduce((acc, row) => acc + row.vol2025, 0);
  const crescimento = ((totalVolume - irecData.reduce((acc, row) => acc + row.vol2024, 0)) / irecData.reduce((acc, row) => acc + row.vol2024, 0)) * 100;

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-8 lg:px-16 py-12">
        <Breadcrumb />
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-[#1e40af] mb-2">
            Mercado Brasileiro de Certificados I-REC
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Top 25 empresas brasileiras por volume de certificados I-REC
            transacionados.
          </p>
        </div>

        <IrecBrasilChart />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">
              Volume Total 2025
            </p>
            <h3 className="text-3xl font-bold text-[#1e40af]">
              {(totalVolume / 1000).toFixed(1)}M
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">I-RECs</p>
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
              Vendedores
            </p>
            <h3 className="text-3xl font-bold text-green-600">3</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              principais geradores
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">
              Líder
            </p>
            <h3 className="text-2xl font-bold text-[#1e40af]">Eletrobras</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              14.5M I-RECs
            </p>
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
                    Papel
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
                {irecData.map((row) => (
                  <tr key={row.rank} className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 ${getTopClass(row.rank)}`}>
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-center text-gray-500 dark:text-gray-400">
                      {row.rank}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-900 dark:text-gray-100">
                      {row.empresa}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold text-white ${getPapelBadge(
                          row.papel
                        )}`}
                      >
                        {row.papel}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right font-mono text-gray-600 dark:text-gray-400">
                      {row.vol2024.toLocaleString("pt-BR")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right font-mono font-semibold text-gray-900 dark:text-gray-100">
                      {row.vol2025.toLocaleString("pt-BR")}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-right font-mono ${getGrowthClass(row.delta)}`}>
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
            Legenda - Papel no Mercado
          </h3>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold text-white bg-green-600">
                Vendedor
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Gera e vende I-RECs
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold text-white bg-blue-600">
                Comprador
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Adquire I-RECs para compensação
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold text-white bg-purple-600">
                Ambos
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Atua em ambos os lados do mercado
              </span>
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-6 rounded-r-xl">
            <h4 className="font-bold text-green-900 dark:text-green-200 mb-2">
              ⚡ Eletrobras Líder
            </h4>
            <p className="text-sm text-green-800 dark:text-green-300">
              A Eletrobras é a maior vendedora de I-RECs do Brasil, com 14.5
              milhões de certificados em 2025, crescimento de 57.6%.
            </p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-6 rounded-r-xl">
            <h4 className="font-bold text-blue-900 dark:text-blue-200 mb-2">
              📈 Maior Crescimento
            </h4>
            <p className="text-sm text-blue-800 dark:text-blue-300">
              A Voltalia Brasil apresentou o maior crescimento do mercado com 127%
              de aumento no volume de I-RECs.
            </p>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-500 p-6 rounded-r-xl">
            <h4 className="font-bold text-purple-900 dark:text-purple-200 mb-2">
              🏢 Setor Financeiro
            </h4>
            <p className="text-sm text-purple-800 dark:text-purple-300">
              Bancos como Itaú, Bradesco e Banco do Brasil são grandes compradores
              de I-RECs para compensação de operações.
            </p>
          </div>
        </div>

        <div className="mt-6 text-sm text-gray-500 dark:text-gray-400">
          <strong>Última atualização:</strong> Fevereiro 2026
        </div>
      </main>
      <Footer />
    </>
  );
}
