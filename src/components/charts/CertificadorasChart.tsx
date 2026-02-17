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

export function CertificadorasChart() {
    const [view, setView] = useState<"top10" | "top25">("top25");
    const [type, setType] = useState<"bar" | "pie">("bar");

    const limit = view === "top10" ? 10 : 25;
    const labels = fullChartData.labels.slice(0, limit);
    const data2024 = fullChartData.volumes2024.slice(0, limit);
    const data2025 = fullChartData.volumes2025.slice(0, limit);

    const barData: ChartData<"bar"> = {
        labels,
        datasets: [
            {
                label: "Volume 2024 (Milhões)",
                data: data2024,
                backgroundColor: "#94a3b8",
                borderRadius: 4,
            },
            {
                label: "Volume 2025 (Milhões)",
                data: data2025,
                backgroundColor: "#1e40af",
                borderRadius: 4,
            },
        ],
    };

    const barOptions: ChartOptions<"bar"> = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                stacked: true,
                grid: { display: false },
            },
            y: {
                stacked: true,
                grid: { color: "rgba(0, 0, 0, 0.05)" },
                ticks: {
                    callback: (value) => value + "M",
                },
            },
        },
        plugins: {
            legend: { position: "bottom" },
            title: {
                display: true,
                text: "Comparação de Volumes Certificados (Milhões de tCO2e/CBIO)",
                font: { size: 14, weight: "bold" },
                padding: 20,
            },
        },
    };

    const pieData: ChartData<"doughnut"> = {
        labels: fullChartData.sectorsByVolume,
        datasets: [
            {
                data: fullChartData.sectorDistribution,
                backgroundColor: [
                    "#166534",
                    "#2563eb",
                    "#d97706",
                    "#1e40af",
                    "#6b7280",
                    "#7c3aed",
                    "#0891b2",
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
                text: "Distribuição por Área de Foco (%)",
                font: { size: 14, weight: "bold" },
                padding: 20,
            },
        },
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-8 mb-8">
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
