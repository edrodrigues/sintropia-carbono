"use client";

import { useState } from "react";
import { Card, Title, BarChart, DonutChart } from "@/components/ui/tremor";

const fullChartData = {
    labels: [
        "Banco Votorantim",
        "Petrobras",
        "Suzano",
        "Vale",
        "Itaú",
        "Bradesco",
        "Klabin",
        "Natura",
        "Banco do Brasil",
        "Gerdau",
        "Lojas Renner",
        "GOL",
        "Azul",
        "Ambev",
        "JBS",
        "Raízen",
        "Cosan",
        "Cielo",
        "Marfrig",
        "Localiza",
        "Rede D'Or",
        "Neoenergia",
        "Cemig",
        "TIM",
        "3tentos",
    ],
    volumes2024: [
        3.8, 0.68, 0.42, 0.38, 0.31, 0.29, 0.25, 0.23, 0.21, 0.195, 0.18, 0.175,
        0.165, 0.15, 0.14, 0.135, 0.12, 0.115, 0.105, 0.095, 0.09, 0.085, 0.08, 0.075,
        0.07,
    ],
    volumes2025: [
        5.2, 0.75, 0.58, 0.45, 0.39, 0.36, 0.32, 0.29, 0.27, 0.25, 0.24, 0.23, 0.215,
        0.195, 0.18, 0.17, 0.155, 0.15, 0.14, 0.13, 0.125, 0.115, 0.11, 0.105, 0.1,
    ],
    sectors: [
        "Financeiro",
        "Energia",
        "Celulose",
        "Mineração",
        "Varejo",
        "Aviação",
        "Bebidas",
        "Proteína",
        "Siderurgia",
        "Cosméticos",
        "Saúde",
        "Telecom",
        "Logística",
        "Agro",
    ],
    sectorDistribution: [20, 20, 8, 4, 4, 8, 4, 8, 4, 4, 4, 4, 4, 4],
};

const sectorColors = [
    "#1e3a8a",
    "#166534",
    "#92400e",
    "#52525b",
    "#0891b2",
    "#dc2626",
    "#ea580c",
    "#65a30d",
    "#3f3f46",
    "#ec4899",
    "#db2777",
    "#d97706",
    "#06b6d4",
    "#7c3aed",
];

export function CarbonoBrasilChart() {
    const [view, setView] = useState<"top10" | "top25">("top25");
    const [type, setType] = useState<"bar" | "pie">("bar");
    const [year, setYear] = useState<"2024" | "2025">("2024");

    const limit = view === "top10" ? 10 : 25;

    const barData = fullChartData.labels
        .slice(0, limit)
        .map((label, i) => ({
            name: label,
            value: year === "2024" ? fullChartData.volumes2024[i] : fullChartData.volumes2025[i],
        }));

    const sectorData = fullChartData.sectors.map((sector, i) => ({
        name: sector,
        value: fullChartData.sectorDistribution[i],
        color: sectorColors[i],
    }));

    return (
        <Card>
            <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 md:mb-0">
                    Visualizações de Dados
                </h3>
                <div className="flex flex-col md:flex-row gap-2">
                    <div className="flex gap-2 mb-2 md:mb-0">
                        <button
                            onClick={() => setView("top10")}
                            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${view === "top10"
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                                }`}
                        >
                            Top 10
                        </button>
                        <button
                            onClick={() => setView("top25")}
                            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${view === "top25"
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                                }`}
                        >
                            Top 25
                        </button>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setType("bar")}
                            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${type === "bar"
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                                }`}
                        >
                            📊 Barras
                        </button>
                        <button
                            onClick={() => setType("pie")}
                            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${type === "pie"
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                                }`}
                        >
                            🍕 Setores
                        </button>
                    </div>
                </div>
            </div>

            {type === "bar" && (
                <div className="flex gap-2 mb-4">
                    <button
                        onClick={() => setYear("2024")}
                        className={`px-4 py-2 rounded-lg font-semibold transition-colors ${year === "2024"
                                ? "bg-slate-600 text-white"
                                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                            }`}
                    >
                        2024
                    </button>
                    <button
                        onClick={() => setYear("2025")}
                        className={`px-4 py-2 rounded-lg font-semibold transition-colors ${year === "2025"
                                ? "bg-blue-600 text-white"
                                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                            }`}
                    >
                        2025
                    </button>
                </div>
            )}

            <div className="relative h-[400px]">
                {type === "bar" ? (
                    <>
                        <Title className="text-center mb-4">Comparação de Volumes de Carbono - Brasil (Milhões tCO2e)</Title>
                        <BarChart data={barData} className="h-[320px]" />
                    </>
                ) : (
                    <>
                        <Title className="text-center mb-4">Distribuição por Setor (%)</Title>
                        <DonutChart data={sectorData} className="h-[320px]" />
                    </>
                )}
            </div>
        </Card>
    );
}
