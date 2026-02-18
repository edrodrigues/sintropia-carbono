import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { CarbonoPrecosChart } from "@/components/charts/CarbonoPrecosChart";

export default function CarbonoPrecos() {
    return (
        <>
            <Header />
            <main className="max-w-7xl mx-auto px-8 lg:px-16 py-12">
                <Breadcrumb />
                <div className="mb-8">
                    <h2 className="text-4xl font-bold text-[#1e40af] mb-2 font-inter">Preços de Carbono</h2>
                    <p className="text-gray-600 dark:text-gray-400 font-inter">Mercados Globais e Brasil - Análise Completa 2024-2025</p>
                    <p className="text-sm text-gray-500 mt-2 font-mono">Última atualização: Fevereiro 2026</p>
                </div>

                <CarbonoPrecosChart />

                {/* Resumo */}
                <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl p-6 mb-8 border border-gray-200 dark:border-gray-700">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">📊 RESUMO</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[{
                            label: "América Latina", value: "USD $63.05B", sub: "2025 → $824B (2034)", color: "text-[#1e40af]"
                        }, {
                            label: "EU ETS", value: "€60-80", sub: "/tonelada CO2", color: "text-green-600"
                        }, {
                            label: "Mercado Livre", value: "$3.50-14.80", sub: "/tonelada por qualidade", color: "text-orange-600"
                        }, {
                            label: "⚠️ Colombia", value: "Queda 70%+", sub: "Crise de preços", color: "text-red-600"
                        }].map((item, i) => (
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
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">🏛️ Mercados Regulados</h3>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { title: "🇪🇺 EU ETS", price: "€60-80", detail: "Média 2024: €65", bg: "bg-blue-50 dark:bg-blue-900/20", border: "border-blue-200 dark:border-blue-800" },
                            { title: "🇬🇧 UK ETS", price: "£35-45", detail: "Média 2024: £40", bg: "bg-purple-50 dark:bg-purple-900/20", border: "border-purple-200 dark:border-purple-800" },
                            { title: "🇺🇸 California", price: "$28-32", detail: "Mínimo: $20.82", bg: "bg-green-50 dark:bg-green-900/20", border: "border-green-200 dark:border-green-800" }
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
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">🌱 Mercado Voluntário (VCM)</h3>
                    </div>
                    <div className="p-6">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-gray-700/50">
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-300 uppercase">Qualidade</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-300 uppercase">Preço (USD/tCO2e)</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-300 uppercase">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    <tr>
                                        <td className="px-6 py-4 font-bold text-green-600">Alta Integridade</td>
                                        <td className="px-6 py-4 font-mono">$14.80</td>
                                        <td className="px-6 py-4 text-sm">Prêmio por qualidade e co-benefícios</td>
                                    </tr>
                                    <tr>
                                        <td className="px-6 py-4 font-bold text-blue-600">Padrão Mercado</td>
                                        <td className="px-6 py-4 font-mono">$7.00 - $10.00</td>
                                        <td className="px-6 py-4 text-sm">VCS/Gold Standard padrão</td>
                                    </tr>
                                    <tr>
                                        <td className="px-6 py-4 font-bold text-gray-500">Legado / Baixa</td>
                                        <td className="px-6 py-4 font-mono">$3.50</td>
                                        <td className="px-6 py-4 text-sm">Projetos antigos com dúvidas de adicionalidade</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Brasil Section */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-8 shadow-sm">
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-yellow-50 to-green-50 dark:from-yellow-900/10 dark:to-green-900/10">
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white font-inter">🇧🇷 Mercado Brasileiro</h3>
                    </div>
                    <div className="p-6">
                        <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 mb-6">
                            <h4 className="font-bold text-blue-900 dark:text-blue-200 mb-1">Lei 14.590/2023 (SBCE)</h4>
                            <p className="text-sm text-blue-800 dark:text-blue-300 italic">Aprovada em Nov 2024. Regulação pela CVM/B3 em andamento para 2025.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                                <h5 className="font-bold text-gray-800 dark:text-gray-100 mb-3 border-b border-gray-100 dark:border-gray-700 pb-2">NBS Premiadas</h5>
                                <ul className="space-y-2 text-sm">
                                    <li className="flex justify-between"><span>REDD+ (Alta Qualidade)</span><span className="font-mono font-bold">$12-18</span></li>
                                    <li className="flex justify-between"><span>Restauração Nativa (ARR)</span><span className="font-mono font-bold">$15-25</span></li>
                                    <li className="flex justify-between"><span>Mangues (Blue Carbon)</span><span className="font-mono font-bold">$20-30</span></li>
                                </ul>
                            </div>
                            <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                                <h5 className="font-bold text-gray-800 dark:text-gray-100 mb-3 border-b border-gray-100 dark:border-gray-700 pb-2">Tecnologias</h5>
                                <ul className="space-y-2 text-sm">
                                    <li className="flex justify-between"><span>Fogões Eficientes</span><span className="font-mono font-bold">$4-8</span></li>
                                    <li className="flex justify-between"><span>Captura de Metano</span><span className="font-mono font-bold">$6-12</span></li>
                                    <li className="flex justify-between"><span>Biochar</span><span className="font-mono font-bold">$100-200</span></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-8 bg-gray-50 dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">📚 Glossário Rápido</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-2 text-xs">
                        <p><span className="font-bold text-[#1e40af]">SBCE:</span> Sist. Bras. de Comércio de Emissões</p>
                        <p><span className="font-bold text-[#1e40af]">tCO2e:</span> Tonelada de CO2 equivalente</p>
                        <p><span className="font-bold text-[#1e40af]">AFOLU:</span> Agro, Silvicultura e outros Usos da Terra</p>
                        <p><span className="font-bold text-[#1e40af]">ETS:</span> Emission Trading System</p>
                        <p><span className="font-bold text-[#1e40af]">ARR:</span> Reflorestamento e Revegetação</p>
                        <p><span className="font-bold text-[#1e40af]">VCM:</span> Mercado Voluntário de Carbono</p>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}
