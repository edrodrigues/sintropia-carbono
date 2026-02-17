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

export function CarbonoBrasilChart() {
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
                label: "Volume 2024 (Milhões tCO2e)",
                data: data2024,
                backgroundColor: "#94a3b8",
                borderRadius: 4,
            },
            {
                label: "Volume 2025 (Milhões tCO2e)",
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
                text: "Comparação de Volumes de Carbono - Brasil (Milhões tCO2e)",
                font: { size: 14, weight: "bold" },
                padding: 20,
            },
        },
    };

    const pieData: ChartData<"doughnut"> = {
        labels: fullChartData.sectors,
        datasets: [
            {
                data: fullChartData.sectorDistribution,
                backgroundColor: [
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
                text: "Distribuição por Setor (%)",
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
