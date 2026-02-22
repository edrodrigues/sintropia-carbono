"use client";

import { useState } from "react";
import { Card, Title, BarChart, DonutChart } from "@/components/ui/tremor";

const fullChartData = {
    labels: [
        "Microsoft",
        "Google",
        "Amazon",
        "Meta",
        "Apple",
        "Shell",
        "BP",
        "ExxonMobil",
        "Samsung",
        "TSMC",
        "Walmart",
        "Volkswagen",
        "Toyota",
        "Nestlé",
        "PepsiCo",
        "Unilever",
        "L'Oreal",
        "Procter & Gamble",
        "Siemens",
        "Schneider Electric",
        "ABB",
        "Danone",
        "Heineken",
        "IKEA",
        "Nike",
    ],
    volumes2024: [
        4.5, 3.8, 3.2, 2.8, 2.5, 2.1, 1.8, 1.5, 1.2, 1.1, 0.95, 0.85, 0.78, 0.72,
        0.68, 0.65, 0.62, 0.58, 0.55, 0.52, 0.48, 0.45, 0.42, 0.41, 0.39,
    ],
    volumes2025: [
        29.5, 12.8, 10.5, 8.44, 7.2, 4.8, 3.3, 3.1, 2.4, 2.0, 1.9, 1.65, 1.45, 1.3,
        1.25, 1.1, 0.85, 0.81, 0.75, 0.72, 0.61, 0.58, 0.55, 0.48, 0.44,
    ],
    sectors: ["Tecnologia", "Energia", "Varejo", "Automotivo", "Consumo"],
    sectorDistribution: [45, 20, 15, 10, 10],
};

const sectorColors = ["#2563eb", "#16a34a", "#d97706", "#dc2626", "#9333ea"];

export function IrecMundoChart() {
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
                        <Title className="text-center mb-4">Comparação de Volumes I-REC - Mundo (Milhões)</Title>
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
