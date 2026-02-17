"use client";

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    LogarithmicScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ChartData,
    ChartOptions,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
    CategoryScale,
    LinearScale,
    LogarithmicScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const priceData = [
    { country: "Brasil", price: 0.18 },
    { country: "China", price: 0.85 },
    { country: "Índia", price: 0.82 },
    { country: "Colômbia", price: 1.1 },
    { country: "Chile", price: 2.7 },
    { country: "México", price: 4.6 },
    { country: "Malásia", price: 5.55 },
    { country: "Singapura", price: 75.0 },
];

export function IrecPrecosChart() {
    const data: ChartData<"bar"> = {
        labels: priceData.map((d) => d.country),
        datasets: [
            {
                label: "Preço USD/MWh",
                data: priceData.map((d) => d.price),
                backgroundColor: (context) => {
                    const value = context.raw as number;
                    if (value > 50) return "#dc2626"; // Singapura
                    if (value < 0.5) return "#16a34a"; // Brasil
                    return "#2563eb";
                },
                borderRadius: 4,
            },
        ],
    };

    const options: ChartOptions<"bar"> = {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: "y",
        scales: {
            x: {
                type: "logarithmic",
                title: { display: true, text: "Preço (Escala Logarítmica USD)" },
                grid: { color: "rgba(0, 0, 0, 0.05)" },
            },
            y: {
                grid: { display: false },
            },
        },
        plugins: {
            legend: { display: false },
            title: {
                display: true,
                text: "Comparativo de Preços I-REC por País (USD/MWh)",
                font: { size: 14, weight: "bold" },
                padding: 20,
            },
            tooltip: {
                callbacks: {
                    label: (context) => ` $${context.raw}`,
                },
            },
        },
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-8 mb-8">
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                Disparidade de Preços Globais
            </h3>
            <div className="relative h-[400px]">
                <Bar data={data} options={options} />
            </div>
        </div>
    );
}
