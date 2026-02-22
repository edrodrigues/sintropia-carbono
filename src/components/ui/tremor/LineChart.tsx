"use client";

import { cx } from "@/lib/utils";
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

interface LineChartData {
  name: string;
  value: number;
  value2?: number;
}

interface LineChartProps {
  data: LineChartData[];
  className?: string;
  showArea?: boolean;
  showGrid?: boolean;
}

const defaultColors = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316", "#6366f1", "#84cc16"];

const formatNumber = (num: number) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toString();
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value?: number; dataKey?: string; color?: string }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 px-3 py-2 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <p className="font-medium text-gray-900 dark:text-white">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm font-bold" style={{ color: entry.color }}>
            {entry.value?.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
}

export function LineChart({ data, className, showArea = false, showGrid = true }: LineChartProps) {
  const ChartComponent = showArea ? AreaChart : RechartsLineChart;
  const DataComponent = showArea ? Area : Line;

  return (
    <div className={cx("h-[300px]", className)}>
      <ResponsiveContainer width="100%" height="100%">
        <ChartComponent data={data} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />}
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
          <DataComponent
            type="monotone"
            dataKey="value"
            stroke="#3b82f6"
            strokeWidth={2}
            fill={showArea ? "#3b82f6" : undefined}
            fillOpacity={showArea ? 0.2 : undefined}
            dot={{ fill: "#3b82f6", strokeWidth: 0, r: 3 }}
            activeDot={{ r: 5 }}
          />
          {data[0]?.value2 !== undefined && (
            <DataComponent
              type="monotone"
              dataKey="value2"
              stroke="#22c55e"
              strokeWidth={2}
              fill={showArea ? "#22c55e" : undefined}
              fillOpacity={showArea ? 0.2 : undefined}
              dot={{ fill: "#22c55e", strokeWidth: 0, r: 3 }}
              activeDot={{ r: 5 }}
            />
          )}
        </ChartComponent>
      </ResponsiveContainer>
    </div>
  );
}
