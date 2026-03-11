"use client";

import { cx } from "@/lib/utils";
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface VolumeData {
  name: string;
  vol2024: number;
  vol2025: number;
  vol2026?: number;
}

interface VolumeBarChartProps {
  data: VolumeData[];
  className?: string;
  showLegend?: boolean;
  label2024?: string;
  label2025?: string;
  label2026?: string;
}

const formatNumber = (num: number) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toString();
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ name?: string; value?: number; color?: string }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 px-4 py-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <p className="font-medium text-gray-900 dark:text-white mb-2">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {formatNumber(entry.value || 0)}
          </p>
        ))}
      </div>
    );
  }
  return null;
}

export function VolumeBarChart({
  data,
  className,
  showLegend = true,
  label2024 = "2024",
  label2025 = "2025",
  label2026 = "2026",
}: VolumeBarChartProps) {
  const hasVol2026 = data.some((d) => d.vol2026 !== undefined && d.vol2026 > 0);

  return (
    <div className={cx("h-[350px]", className)}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fill: "#6b7280", fontSize: 11 }}
            axisLine={{ stroke: "#e5e7eb" }}
            tickLine={false}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis
            tick={{ fill: "#6b7280", fontSize: 10 }}
            axisLine={{ stroke: "#e5e7eb" }}
            tickLine={false}
            tickFormatter={formatNumber}
            width={55}
          />
          <Tooltip content={<CustomTooltip />} />
          {showLegend && (
            <Legend
              wrapperStyle={{ paddingTop: "10px" }}
              iconType="circle"
            />
          )}
          <Bar
            dataKey="vol2024"
            name={label2024}
            fill="#94a3b8"
            radius={[4, 4, 0, 0]}
            maxBarSize={40}
          />
          <Bar
            dataKey="vol2025"
            name={label2025}
            fill="#059669"
            radius={[4, 4, 0, 0]}
            maxBarSize={40}
          />
          {hasVol2026 && (
            <Bar
              dataKey="vol2026"
              name={label2026}
              fill="#1e40af"
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
          )}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}
