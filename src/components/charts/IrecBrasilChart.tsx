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

export function IrecBrasilChart() {
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
                label: "Volume 2024 (Milhões I-RECs)",
                data: data2024,
                backgroundColor: "#94a3b8",
                borderRadius: 4,
            },
            {
                label: "Volume 2025 (Milhões I-RECs)",
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
                text: "Comparação de Volumes I-REC - Brasil (Milhões)",
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
                backgroundColor: ["#16a34a", "#2563eb", "#9333ea"],
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
                text: "Distribuição por Papel no Mercado (%)",
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
