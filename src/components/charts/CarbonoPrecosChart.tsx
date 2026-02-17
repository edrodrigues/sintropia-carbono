"use client";

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    ChartData,
    ChartOptions,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const priceHistory = {
    labels: ["Jan", "Mar", "Mai", "Jul", "Set", "Nov", "Jan 25"],
    euEts: [75, 68, 72, 65, 62, 68, 74],
    vcmHigh: [12, 13, 14, 14.5, 14.2, 14.6, 14.8],
    vcmStd: [8, 7.5, 7.8, 7.2, 7.0, 7.3, 7.5],
};

export function CarbonoPrecosChart() {
    const data: ChartData<"line"> = {
        labels: priceHistory.labels,
        datasets: [
            {
                label: "EU ETS (€)",
                data: priceHistory.euEts,
                borderColor: "#1e40af",
                backgroundColor: "rgba(30, 64, 175, 0.1)",
                fill: true,
                tension: 0.4,
            },
            {
                label: "VCM High Integrity ($)",
                data: priceHistory.vcmHigh,
                borderColor: "#166534",
                backgroundColor: "transparent",
                tension: 0.4,
            },
            {
                label: "VCM Standard ($)",
                data: priceHistory.vcmStd,
                borderColor: "#94a3b8",
                backgroundColor: "transparent",
                borderDash: [5, 5],
                tension: 0.4,
            },
        ],
    };

    const options: ChartOptions<"line"> = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: false,
                grid: { color: "rgba(0, 0, 0, 0.05)" },
            },
            x: {
                grid: { display: false },
            },
        },
        plugins: {
            legend: { position: "bottom" },
            title: {
                display: true,
                text: "Evolução de Preços (2024-2025)",
                font: { size: 14, weight: "bold" },
                padding: 20,
            },
        },
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-8 mb-8">
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                Tendências de Mercado
            </h3>
            <div className="relative h-[300px]">
                <Line data={data} options={options} />
            </div>
        </div>
    );
}
