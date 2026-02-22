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

interface DonutChartData {
  name: string;
  value: number;
  color?: string;
}

interface DonutChartProps {
  data: DonutChartData[];
  className?: string;
  showLegend?: boolean;
  colors?: string[];
}

const defaultColors = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316", "#6366f1", "#84cc16", "#06b6d4", "#a855f7"];

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ payload?: DonutChartData }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    const data = payload[0]?.payload;
    return (
      <div className="bg-white dark:bg-gray-800 px-3 py-2 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <p className="font-medium text-gray-900 dark:text-white">{data?.name}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {data?.value?.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
}

function CustomLegend({ payload }: { payload?: Array<{ value?: string; color?: string }> }) {
  return (
    <div className="flex flex-wrap justify-center gap-4 mt-4">
      {payload?.map((entry, index) => (
        <div key={index} className="flex items-center gap-1">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: entry?.color }}
          />
          <span className="text-xs text-gray-600 dark:text-gray-400">{entry?.value}</span>
        </div>
      ))}
    </div>
  );
}

export function DonutChart({ data, className, showLegend = true, colors = defaultColors }: DonutChartProps) {
  const chartColors = data.map((d, i) => d.color || colors[i % colors.length]);

  return (
    <div className={cx("h-[250px]", className)}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color || colors[index % colors.length]}
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
