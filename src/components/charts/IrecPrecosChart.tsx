"use client";

import { Card, Title, BarChart, BarList } from "@/components/ui/tremor";

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

const getBarColor = (price: number) => {
    if (price > 50) return "#dc2626";
    if (price < 0.5) return "#16a34a";
    return "#2563eb";
};

export function IrecPrecosChart() {
    const barData = priceData.map((d) => ({
        name: d.country,
        value: d.price,
    }));

    const barListData = priceData.map((d) => ({
        name: d.country,
        value: d.price,
        color: getBarColor(d.price),
    }));

    return (
        <Card>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                Disparidade de Preços Globais
            </h3>
            <Title className="text-center mb-4">Comparativo de Preços I-REC por País (USD/MWh)</Title>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
                <div>
                    <Title className="text-sm text-gray-500 mb-2">Visualização em Barras</Title>
                    <BarChart data={barData} className="h-[350px]" />
                </div>
                <div>
                    <Title className="text-sm text-gray-500 mb-2">Por País</Title>
                    <BarList data={barListData} className="h-[350px]" />
                </div>
            </div>
        </Card>
    );
}
