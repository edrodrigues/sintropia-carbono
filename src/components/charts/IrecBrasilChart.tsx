"use client";

import { useState } from "react";
import { Card, Title, BarChart, DonutChart } from "@/components/ui/tremor";

const fullChartData = {
    labels: [
        "Eletrobras",
        "Vale",
        "Neoenergia",
        "Gerdau",
        "Petrobras",
        "JBS",
        "Braskem",
        "Voltalia Brasil",
        "Raízen",
        "Suzano",
        "Ambev",
        "CGN Brasil Energia",
        "Itaú Unibanco",
        "Bradesco",
        "Banco do Brasil",
        "Santander Brasil",
        "Natura &Co",
        "Magazine Luiza",
        "Embraer",
        "Lojas Renner",
        "Leroy Merlin Brasil",
        "Decathlon Brasil",
        "Cielo",
        "Hospital de Clínicas de Porto Alegre",
        "SAP Brasil",
    ],
    volumes2024: [
        9.2, 4.2, 3.2, 3.2, 2.8, 2.4, 2.1, 1.1, 1.8, 1.55, 1.25, 0.95, 0.62, 0.55,
        0.52, 0.48, 0.41, 0.28, 0.26, 0.195, 0.145, 0.075, 0.045, 0.033, 0.022,
    ],
    volumes2025: [
        14.5, 5.5, 4.8, 4.15, 3.65, 3.1, 2.75, 2.5, 2.4, 2.05, 1.63, 1.3, 0.81, 0.72,
        0.68, 0.625, 0.535, 0.365, 0.34, 0.255, 0.19, 0.098, 0.058, 0.035, 0.0285,
    ],
    sectors: ["Vendedor", "Comprador", "Ambos"],
    sectorDistribution: [20, 65, 15],
};

const sectorColors = ["#16a34a", "#2563eb", "#9333ea"];

export function IrecBrasilChart() {
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
                        <Title className="text-center mb-4">Comparação de Volumes I-REC - Brasil (Milhões)</Title>
                        <BarChart data={barData} className="h-[320px]" />
                    </>
                ) : (
                    <>
                        <Title className="text-center mb-4">Distribuição por Papel no Mercado (%)</Title>
                        <DonutChart data={sectorData} className="h-[320px]" />
                    </>
                )}
            </div>
        </Card>
    );
}
