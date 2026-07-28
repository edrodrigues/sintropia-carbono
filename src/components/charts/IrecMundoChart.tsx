"use client";

import { useState } from "react";
import { Card, Title, BarChart, DonutChart } from "@/components/ui/tremor";

const fullChartData = {
  labels: [
    "Amazon",
    "Microsoft",
    "Meta",
    "Google",
    "NextEra Energy",
    "STX Group",
    "ACT Commodities",
    "Brookfield Renewable",
    "Statkraft",
    "Enel Green Power",
    "3Degrees Group",
    "ENGIE",
    "Shell Energy",
    "South Pole",
    "Ecohz",
    "Ørsted",
    "EDF Trading",
    "Xpansiv (CBL)",
    "Apple",
    "Neoenergia",
    "Adani Green Energy",
    "CPFL Energia",
    "Tata Power",
    "EKI Energy Services",
    "First Climate"
  ],
  volumes2024: [
    28.5,
    24.0,
    22.1,
    19.8,
    18.5,
    16.0,
    15.2,
    14.0,
    13.5,
    12.0,
    11.5,
    11.0,
    10.5,
    10.0,
    9.5,
    9.0,
    8.6,
    8.2,
    7.8,
    7.5,
    7.0,
    6.8,
    6.5,
    6.2,
    5.8
  ],
  volumes2025: [
    34.2,
    31.5,
    25.4,
    22.0,
    20.2,
    19.5,
    18.0,
    16.5,
    15.1,
    14.2,
    13.0,
    12.8,
    12.1,
    11.5,
    11.2,
    10.5,
    10.0,
    9.5,
    9.1,
    8.8,
    8.4,
    8.0,
    7.6,
    7.3,
    7.0
  ],
  sectors: [
    "Utilities & Energy",
    "Technology",
    "Environmental Commodities",
    "Financial Infrastructure"
  ],
  sectorDistribution: [
    48,
    20,
    28,
    4
  ],
};

const sectorColors = [
  "#2563eb",
  "#16a34a",
  "#d97706",
  "#dc2626",
  "#9333ea",
  "#0891b2"
];

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
        {type === "bar"
          ? (
              <>
                <Title className="text-center mb-4">Comparação de Volumes (Milhões)</Title>
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
