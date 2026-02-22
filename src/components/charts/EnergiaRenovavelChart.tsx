"use client";

import { useState } from "react";
import { Card, Title, BarChart, DonutChart } from "@/components/ui/tremor";

const fullChartData = {
    labels: [
        "I-REC",
        "Guarantees of Origin",
        "Green-e Energy",
        "TIGR",
        "LGC (Austrália)",
        "UK REGO",
        "NFC (Japão)",
        "REC Brazil",
        "EKOenergy",
        "Gold Standard RE",
    ],
    volumes2024: [
        283000000,
        1084000000,
        143576000,
        9870000,
        51500000,
        40100000,
        15343000,
        0,
        0,
        0,
    ],
    volumes2025: [
        0,
        0,
        0,
        0,
        57000000,
        0,
        0,
        0,
        0,
        0,
    ],
    regions: [
        "União Europeia",
        "Global (I-REC)",
        "EUA/Canadá",
        "Brasil",
        "Japão",
        "Austrália",
        "Reino Unido",
        "Finlândia",
    ],
    regionDistribution: [35, 25, 15, 10, 8, 4, 2, 1],
};

const regionColors = [
    "#2563eb",
    "#0891b2",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#ec4899",
    "#6366f1",
];

export function EnergiaRenovavelChart() {
    const [view, setView] = useState<"all" | "top5">("all");
    const [type, setType] = useState<"bar" | "pie">("bar");
    const [year, setYear] = useState<"2024" | "2025">("2024");

    const barData = fullChartData.labels
        .map((label, i) => ({
            name: label,
            value: year === "2024" ? fullChartData.volumes2024[i] : fullChartData.volumes2025[i],
        }))
        .filter(d => d.value > 0);

    const displayData = view === "top5" ? barData.slice(0, 5) : barData;

    const regionData = fullChartData.regions.map((region, i) => ({
        name: region,
        value: fullChartData.regionDistribution[i],
        color: regionColors[i],
    }));

    return (
        <Card>
            <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 md:mb-0">
                    ⚡ Energia Renovável - Dados Gerais
                </h3>
                <div className="flex flex-col md:flex-row gap-2">
                    <div className="flex gap-2 mb-2 md:mb-0">
                        <button
                            onClick={() => setView("top5")}
                            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${view === "top5"
                                    ? "bg-cyan-600 text-white"
                                    : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                                }`}
                        >
                            Top 5
                        </button>
                        <button
                            onClick={() => setView("all")}
                            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${view === "all"
                                    ? "bg-cyan-600 text-white"
                                    : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                                }`}
                        >
                            Todos
                        </button>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setType("bar")}
                            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${type === "bar"
                                    ? "bg-cyan-600 text-white"
                                    : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                                }`}
                        >
                            📊 Barras
                        </button>
                        <button
                            onClick={() => setType("pie")}
                            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${type === "pie"
                                    ? "bg-cyan-600 text-white"
                                    : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                                }`}
                        >
                            🌍 Regiões
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
                                ? "bg-cyan-600 text-white"
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
                        <Title className="text-center mb-4">Volume de Certificados por Padrão (MWh)</Title>
                        <BarChart data={displayData} className="h-[320px]" />
                    </>
                ) : (
                    <>
                        <Title className="text-center mb-4">Distribuição por Região (%)</Title>
                        <DonutChart data={regionData} className="h-[320px]" />
                    </>
                )}
            </div>
        </Card>
    );
}
