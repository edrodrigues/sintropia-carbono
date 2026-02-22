"use client";

import { cx } from "@/lib/utils";
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface BarChartData {
  name: string;
  value: number;
}

interface BarChartProps {
  data: BarChartData[];
  className?: string;
}

const defaultColors = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316", "#6366f1", "#84cc16"];

const formatNumber = (num: number) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toString();
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value?: number }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 px-3 py-2 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <p className="font-medium text-gray-900 dark:text-white">{label}</p>
        <p className="text-sm text-blue-600 dark:text-blue-400 font-bold">
          {payload[0].value?.toLocaleString()}
          <span className="ml-1 text-[10px] text-gray-500 font-normal">({formatNumber(payload[0].value || 0)})</span>
        </p>
      </div>
    );
  }
  return null;
}

export function BarChart({ data, className }: BarChartProps) {
  return (
    <div className={cx("h-[300px]", className)}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fill: "#6b7280", fontSize: 12 }}
            axisLine={{ stroke: "#e5e7eb" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "#6b7280", fontSize: 10 }}
            axisLine={{ stroke: "#e5e7eb" }}
            tickLine={false}
            tickFormatter={formatNumber}
            width={45}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            dataKey="value"
            fill="#3b82f6"
            radius={[4, 4, 0, 0]}
            maxBarSize={50}
          />
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}

interface BarListItem {
  name: string;
  value: number;
  color?: string;
}

interface BarListProps {
  data: BarListItem[];
  className?: string;
}

export function BarList({ data, className }: BarListProps) {
  const maxValue = Math.max(...data.map(d => d.value));

  return (
    <div className={cx("space-y-2", className)}>
      {data.map((item, index) => (
        <div key={item.name} className="flex items-center gap-2">
          <span className="w-32 text-xs text-gray-600 dark:text-gray-400 truncate" title={item.name}>{item.name}</span>
          <div className="flex-1 h-4 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${(item.value / maxValue) * 100}%`,
                backgroundColor: item.color || defaultColors[index % defaultColors.length]
              }}
            />
          </div>
          <span className="min-w-[60px] text-xs font-semibold text-gray-900 dark:text-white text-right">
            {formatNumber(item.value)}
          </span>
        </div>
      ))}
    </div>
  );
}
