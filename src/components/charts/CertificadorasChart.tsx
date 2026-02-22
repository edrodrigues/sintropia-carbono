"use client";

import { useState } from "react";
import { Card, Title, BarChart, DonutChart } from "@/components/ui/tremor";

const fullChartData = {
    labels: [
        "Verra",
        "Gold Standard",
        "RenovaBio",
        "ACR",
        "CAR",
        "ART/TREES",
        "GCC",
        "Plan Vivo",
        "CDM",
        "Social Carbon",
        "VCS Jurisdicional",
        "REDD+ Brazil",
        "CCX",
        "Climate Care",
        "EcoAct",
        "South Pole",
        "ClimatePartner",
        "CO2logic",
        "Allcot",
        "Carbon Clear",
        "Natural Capital Partners",
        "First Climate",
        "myclimate",
        "Atmosfair",
        "Climate Neutral",
    ],
    volumes2024: [
        950, 210, 115, 215, 168, 39, 17, 12, 8, 6, 5, 4, 3, 2.5, 2, 1.8, 1.5, 1.2, 1,
        0.8, 0.7, 0.6, 0.5, 0.4, 0.3,
    ],
    volumes2025: [
        1100, 245, 135, 250, 195, 45, 20, 14, 9, 7, 6, 4.5, 3.5, 2.8, 2.2, 2, 1.7,
        1.4, 1.1, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4,
    ],
    sectorsByVolume: [
        "REDD+/Florestas",
        "Energia/ODS",
        "Biocombustíveis",
        "Florestal/Metano",
        "Aterros/Agro",
        "REDD+ Jurisdicional",
        "Energia Renovável",
    ],
    sectorDistribution: [45, 10, 5, 10, 8, 2, 20],
};

const sectorColors = [
    "#166534",
    "#2563eb",
    "#d97706",
    "#1e40af",
    "#6b7280",
    "#7c3aed",
    "#0891b2",
];

export function CertificadorasChart() {
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

    const sectorData = fullChartData.sectorsByVolume.map((sector, i) => ({
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
                        <Title className="text-center mb-4">Comparação de Volumes Certificados (Milhões de tCO2e/CBIO)</Title>
                        <BarChart data={barData} className="h-[320px]" />
                    </>
                ) : (
                    <>
                        <Title className="text-center mb-4">Distribuição por Área de Foco (%)</Title>
                        <DonutChart data={sectorData} className="h-[320px]" />
                    </>
                )}
            </div>
        </Card>
    );
}
