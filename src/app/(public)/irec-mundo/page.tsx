import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { IrecMundoChart } from "@/components/charts/IrecMundoChart";

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

export default function IrecMundo() {
    return (
        <>
            <Header />
            <main className="max-w-7xl mx-auto px-8 lg:px-16 py-12">
                <Breadcrumb />
                <div className="mb-8">
                    <h2 className="text-4xl font-bold text-[#1e40af] mb-2">Maiores Compradores de Energia Renovável (Mundo)</h2>
                    <p className="text-gray-600 dark:text-gray-400">Top 15 corporações globais por volume de energia renovável negociada (TWh).</p>
                </div>

                <IrecMundoChart />

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Volume Top 15 2025</p>
                        <h3 className="text-3xl font-bold text-[#1e40af] dark:text-blue-400">380.3</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">TWh</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Maior Comprador</p>
                        <h3 className="text-2xl font-bold text-[#1e40af] dark:text-blue-400">Amazon</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">91.2 TWh</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Maior Crescimento</p>
                        <h3 className="text-3xl font-bold text-green-600">+42.5%</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Rio Tinto</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Setor Dominante</p>
                        <h3 className="text-3xl font-bold text-[#1e40af] dark:text-blue-400">Tecnologia</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">5 empresas</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-gray-700/50">
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Rank</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Corporação</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Setor</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Vol 2024</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Vol 2025</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Delta %</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {energiaData.map((row) => (
                                    <tr key={row.rank} className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 ${row.rank <= 3 ? (row.rank === 1 ? 'bg-amber-50 dark:bg-amber-900/10' : row.rank === 2 ? 'bg-blue-50 dark:bg-blue-900/10' : 'bg-purple-50 dark:bg-purple-900/10') : ''}`}>
                                        <td className="px-6 py-4 whitespace-nowrap font-mono text-gray-500 dark:text-gray-400">{row.rank}</td>
                                        <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-900 dark:text-gray-100">{row.empresa}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold text-white ${row.badge}`}>
                                                {row.setor}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right font-mono text-gray-600 dark:text-gray-400">{row.vol2024.toFixed(1)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right font-mono font-semibold text-gray-900 dark:text-gray-100">{row.vol2025.toFixed(1)}</td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-right font-mono font-bold ${row.delta >= 20 ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'}`}>
                                            {row.delta.toFixed(1)}% {row.delta >= 25 ? '🚀' : ''}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-6 rounded-r-xl">
                        <h4 className="font-bold text-blue-900 dark:text-blue-200 mb-2">🌐 Big Tech Lidera</h4>
                        <p className="text-sm text-blue-800 dark:text-blue-300">Amazon, Microsoft, Meta e Google são os 4 maiores compradores globais de energia renovável.</p>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-6 rounded-r-xl">
                        <h4 className="font-bold text-green-900 dark:text-green-200 mb-2">📈 Crescimento</h4>
                        <p className="text-sm text-green-800 dark:text-green-300">O setor industrial (Rio Tinto) mostra aceleração na transição energética em 2025.</p>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-500 p-6 rounded-r-xl">
                        <h4 className="font-bold text-purple-900 dark:text-purple-200 mb-2">⚡ Diversidade</h4>
                        <p className="text-sm text-purple-800 dark:text-purple-300">Empresas de semicondutores e varejo também figuram no topo do ranking global.</p>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}
