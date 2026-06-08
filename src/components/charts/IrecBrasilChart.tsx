"use client";

import { useState } from "react";
import { Card, Title, BarChart, DonutChart } from "@/components/ui/tremor";

const fullChartData = {
  labels: [
    "AXIA Energia",
    "Voltalia",
    "Comerc Energia",
    "Engie Brasil",
    "Auren Energia",
    "Cemig",
    "Copel",
    "CPFL Energia",
    "Neoenergia",
    "CTG Brasil",
    "EDP Brasil",
    "Matrix Energia",
    "2W Ecobank",
    "Braskem",
    "Itaú Unibanco"
  ],
  volumes2024: [
    0.0,
    1.4,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0
  ],
  volumes2025: [
    11.9,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0
  ],
  sectors: [
    "Gerador / Comercializador",
    "Comercializador",
    "Gerador",
    "Consumidor / Comprador"
  ],
  sectorDistribution: [
    53,
    20,
    13,
    14
  ],
};

const sectorColors = [
  "#16a34a",
  "#2563eb",
  "#9333ea",
  "#d97706",
  "#dc2626"
];

export function IrecBrasilChart() {
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
