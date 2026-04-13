"use client";

import { cx } from "@/lib/utils";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

interface SectorData {
  setor: string;
  count: number;
  totalVolume: number;
}

interface SectorPieChartProps {
  data: SectorData[];
  className?: string;
  showLegend?: boolean;
}

const COLORS = [
  "#059669", // emerald-600
  "#1e40af", // blue-800
  "#f59e0b", // amber-500
  "#ef4444", // red-500
  "#10b981", // emerald-500
  "#ec4899", // pink-500
  "#14b8a6", // teal-500
  "#f97316", // orange-500
  "#3b82f6", // blue-500
  "#84cc16", // lime-500
  "#06b6d4", // cyan-500
  "#f43f5e", // rose-500
];

const formatNumber = (num: number) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toString();
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload?: { setor: string; totalVolume: number; count: number };
  }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    const data = payload[0]?.payload;
    return (
      <div className="bg-white dark:bg-gray-800 px-4 py-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <p className="font-medium text-gray-900 dark:text-white">{data?.setor}</p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Volume: {formatNumber(data?.totalVolume || 0)}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Empresas: {data?.count}
        </p>
      </div>
    );
  }
  return null;
}

function CustomLegend({
  payload,
}: {
  payload?: Array<{ value?: string; color?: string }>;
}) {
  return (
    <div className="flex flex-wrap justify-center gap-3 mt-4">
      {payload?.map((entry, index) => (
        <div key={index} className="flex items-center gap-1.5">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry?.color }}
          />
          <span className="text-xs text-gray-600 dark:text-gray-400">
            {entry?.value}
          </span>
        </div>
      ))}
    </div>
  );
}

export function SectorPieChart({
  data,
  className,
  showLegend = true,
}: SectorPieChartProps) {
  const chartData = data.map((item) => ({
    ...item,
    name: item.setor,
    value: item.totalVolume,
  }));

  return (
    <div className={cx("h-[300px]", className)}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
            nameKey="setor"
          >
            {chartData.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
                stroke="#ffffff"
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          {showLegend && <Legend content={<CustomLegend />} />}
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
