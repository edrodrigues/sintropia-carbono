"use client";

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    ChartData,
    ChartOptions,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import { useState } from "react";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

const fullChartData = {
    labels: [
        "I-REC",
        "Guarantees of Origin",
        "Green-e Energy",
        "TIGR",
        "REC Brazil",
        "LGC (Austrália)",
        "NFC (Japão)",
        "UK REGO",
        "EKOenergy",
        "Gold Standard RE",
    ],
    volumes2024: [
        283000,
        1084000,
        110000000,
        0,
        0,
        82500000,
        143800000,
        0,
        0,
        0,
    ],
    volumes2025: [
        350000,
        1200000,
        125000000,
        0,
        0,
        90000000,
        150000000,
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

export function EnergiaRenovavelChart() {
    const [view, setView] = useState<"all" | "top5">("all");
    const [type, setType] = useState<"bar" | "pie">("bar");

    const limit = view === "top5" ? 5 : 10;
    const labels = fullChartData.labels.slice(0, limit);
    const data2024 = fullChartData.volumes2024.slice(0, limit);
    const data2025 = fullChartData.volumes2025.slice(0, limit);

    const barData: ChartData<"bar"> = {
        labels,
        datasets: [
            {
                label: "2024",
                data: data2024,
                backgroundColor: "#64748b",
                borderRadius: 4,
            },
            {
                label: "2025",
                data: data2025,
                backgroundColor: "#0891b2",
                borderRadius: 4,
            },
        ],
    };

    const barOptions: ChartOptions<"bar"> = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                stacked: false,
                grid: { display: false },
            },
            y: {
                stacked: false,
                grid: { color: "rgba(0, 0, 0, 0.05)" },
                ticks: {
                    callback: function(value) {
                        const num = Number(value);
                        if (num >= 1000000) {
                            return (num / 1000000).toFixed(0) + "M";
                        }
                        if (num >= 1000) {
                            return (num / 1000).toFixed(0) + "K";
                        }
                        return num;
                    },
                },
            },
        },
        plugins: {
            legend: { position: "bottom" },
            title: {
                display: true,
                text: "Volume de Certificados por Padrão (MWh)",
                font: { size: 14, weight: "bold" },
                padding: 20,
            },
        },
    };

    const pieData: ChartData<"doughnut"> = {
        labels: fullChartData.regions,
        datasets: [
            {
                data: fullChartData.regionDistribution,
                backgroundColor: [
                    "#2563eb",
                    "#0891b2",
                    "#10b981",
                    "#f59e0b",
                    "#ef4444",
                    "#8b5cf6",
                    "#ec4899",
                    "#6366f1",
                ],
                borderWidth: 2,
                borderColor: "#ffffff",
            },
        ],
    };

    const pieOptions: ChartOptions<"doughnut"> = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "50%",
        plugins: {
            legend: { position: "bottom" },
            title: {
                display: true,
                text: "Distribuição por Região (%)",
                font: { size: 14, weight: "bold" },
                padding: 20,
            },
        },
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-8 mb-8">
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
            <div className="relative h-[400px]">
                {type === "bar" ? (
                    <Bar data={barData} options={barOptions} />
                ) : (
                    <Doughnut data={pieData} options={pieOptions} />
                )}
            </div>
        </div>
    );
}
