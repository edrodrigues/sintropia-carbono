"use client";

import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Area,
} from "recharts";
import type { PriceSeriesPoint } from "@/lib/queries/price-series";

interface PriceChartProps {
  data: PriceSeriesPoint[];
  currency?: string;
  height?: number;
  showRange?: boolean;
  label?: string;
}

interface TooltipPayloadItem {
  value?: number;
  dataKey?: string;
  color?: string;
  payload?: PriceSeriesPoint;
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: TooltipPayloadItem[]; label?: string }) {
  if (!active || !payload?.length) return null;
  const point = payload[0]?.payload;
  return (
    <div className="bg-white px-3 py-2 rounded-lg shadow-lg border border-gray-200">
      <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
      {point?.avg != null && (
        <p className="text-sm font-mono font-bold text-gray-900">
          ${point.avg.toFixed(2)}
        </p>
      )}
      {point?.min != null && point?.max != null && (
        <p className="text-[11px] text-gray-500">
          ${point.min.toFixed(2)} — ${point.max.toFixed(2)}
        </p>
      )}
    </div>
  );
}

export function PriceChart({
  data,
  height = 280,
  showRange = true,
  label = "Preço",
}: PriceChartProps) {
  const chartData = data.map((d) => ({
    ...d,
    name: d.day.slice(5),
    value: d.avg,
    range: d.min != null && d.max != null ? [d.min, d.max] : undefined,
  }));

  const yDomain = data.length > 0
    ? [
      Math.min(...data.filter(d => d.avg != null).map(d => d.avg!), Infinity) * 0.95,
      Math.max(...data.filter(d => d.avg != null).map(d => d.avg!), 0) * 1.05,
    ]
    : [0, 100];

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center text-gray-400 text-sm" style={{ height }}>
        Sem dados de série temporal
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fill: "#6b7280", fontSize: 11 }}
          axisLine={{ stroke: "#e5e7eb" }}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: "#6b7280", fontSize: 10 }}
          axisLine={{ stroke: "#e5e7eb" }}
          tickLine={false}
          width={55}
          domain={yDomain}
          tickFormatter={(v: number) => `$${v.toFixed(2)}`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        {showRange && (
          <Area
            type="monotone"
            dataKey="range"
            stroke="transparent"
            fill="#2563eb"
            fillOpacity={0.08}
            legendType="none"
            name="Faixa"
          />
        )}
        <Line
          type="monotone"
          dataKey="value"
          stroke="#2563eb"
          strokeWidth={2.5}
          dot={false}
          activeDot={{ r: 5, fill: "#2563eb" }}
          name={label}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

interface PriceBarChartProps {
  data: PriceSeriesPoint[];
  height?: number;
}

export function PriceBarChart({ data, height = 260 }: PriceBarChartProps) {
  const chartData = data.map((d) => ({
    name: d.day.slice(5),
    value: d.avg ?? 0,
  }));

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center text-gray-400 text-sm" style={{ height }}>
        Sem dados
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fill: "#6b7280", fontSize: 11 }}
          axisLine={{ stroke: "#e5e7eb" }}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: "#6b7280", fontSize: 10 }}
          axisLine={{ stroke: "#e5e7eb" }}
          tickLine={false}
          width={55}
          tickFormatter={(v: number) => `$${v.toFixed(2)}`}
        />
        <Tooltip />
        <Bar dataKey="value" fill="#10b981" radius={[3, 3, 0, 0]} maxBarSize={40} name="Preço" />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
