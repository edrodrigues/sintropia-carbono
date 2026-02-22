"use client";

import { useState } from "react";
import { Card, Title, LineChart } from "@/components/ui/tremor";

const priceHistory = {
    labels: ["Jan", "Mar", "Mai", "Jul", "Set", "Nov", "Jan 25"],
    euEts: [75, 68, 72, 65, 62, 68, 74],
    vcmHigh: [12, 13, 14, 14.5, 14.2, 14.6, 14.8],
    vcmStd: [8, 7.5, 7.8, 7.2, 7.0, 7.3, 7.5],
};

export function CarbonoPrecosChart() {
    const [selectedLine, setSelectedLine] = useState<"euEts" | "vcmHigh" | "vcmStd">("euEts");

    const chartData = priceHistory.labels.map((label, i) => ({
        name: label,
        value: priceHistory[selectedLine][i],
    }));

    const getLabel = () => {
        switch (selectedLine) {
            case "euEts":
                return "EU ETS (€)";
            case "vcmHigh":
                return "VCM High Integrity ($)";
            case "vcmStd":
                return "VCM Standard ($)";
        }
    };

    return (
        <Card>
            <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 md:mb-0">
                    Tendências de Mercado
                </h3>
                <div className="flex gap-2">
                    <button
                        onClick={() => setSelectedLine("euEts")}
                        className={`px-4 py-2 rounded-lg font-semibold transition-colors text-sm ${selectedLine === "euEts"
                                ? "bg-blue-800 text-white"
                                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                            }`}
                    >
                        EU ETS
                    </button>
                    <button
                        onClick={() => setSelectedLine("vcmHigh")}
                        className={`px-4 py-2 rounded-lg font-semibold transition-colors text-sm ${selectedLine === "vcmHigh"
                                ? "bg-green-600 text-white"
                                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                            }`}
                    >
                        VCM High
                    </button>
                    <button
                        onClick={() => setSelectedLine("vcmStd")}
                        className={`px-4 py-2 rounded-lg font-semibold transition-colors text-sm ${selectedLine === "vcmStd"
                                ? "bg-slate-500 text-white"
                                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                            }`}
                    >
                        VCM Std
                    </button>
                </div>
            </div>
            <Title className="text-center mb-4">Evolução de Preços (2024-2025)</Title>
            <div className="relative h-[300px]">
                <LineChart data={chartData} className="h-[250px]" showArea={true} />
            </div>
            <p className="text-center text-sm text-gray-500 mt-2">
                {getLabel()}
            </p>
        </Card>
    );
}
