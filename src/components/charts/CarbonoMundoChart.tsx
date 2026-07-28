"use client";

import { useState } from "react";
import { Card, Title, BarChart, DonutChart } from "@/components/ui/tremor";
import { brandChartPalette } from "@/lib/utils";

const fullChartData = {
  labels: [
    "Shell",
    "Eni",
    "Microsoft",
    "Delta Air Lines",
    "Walt Disney Company",
    "CPC Corporation",
    "Apple",
    "Volkswagen Group",
    "BHP",
    "BP",
    "Google (Alphabet)",
    "Amazon",
    "JPMorgan Chase",
    "Primax",
    "Guacolda Energía"
  ],
  volumes2024: [
    22.48,
    10.02,
    5.1,
    4.5,
    1.66,
    1.68,
    0.91,
    1.2,
    1.1,
    1.35,
    0.85,
    0.78,
    0.62,
    0.71,
    0.68
  ],
  volumes2025: [
    9.75,
    8.9,
    6.8,
    4.1,
    1.85,
    1.55,
    1.2,
    1.15,
    1.08,
    1.05,
    1.02,
    0.95,
    0.84,
    0.79,
    0.72
  ],
  sectors: [
    "Energia / Óleo e Gás",
    "Tecnologia",
    "Aviação",
    "Entretenimento",
    "Industrial / Refino",
    "Automotivo",
    "Mineração",
    "Varejo / Tecnologia",
    "Financeiro",
    "Energia",
    "Energia / Utilidades"
  ],
  sectorDistribution: [
    20,
    20,
    7,
    7,
    7,
    7,
    7,
    7,
    7,
    7,
    4
  ],
};

const sectorColors = [...brandChartPalette];

export function CarbonoMundoChart() {
  const [view, setView] = useState<"top10" | "top25">("top25");
  const [type, setType] = useState<"bar" | "pie">("bar");
  const [year, setYear] = useState<"2024" | "2025">("2024");

  const limit = view === "top10" ? 10 : 15;

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
              Top 15
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
        {type === "bar"
          ? (
              <>
                <Title className="text-center mb-4">Comparação de Volumes (Milhões tCO2e)</Title>
                <BarChart data={barData} className="h-[320px]" />
              </>
            )
          : (
              <>
                <Title className="text-center mb-4">Distribuição (%)</Title>
                <DonutChart data={sectorData} className="h-[320px]" />
              </>
            )}
      </div>
    </Card>
  );
}
