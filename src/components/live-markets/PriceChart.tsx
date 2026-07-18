"use client";

import { useState, useMemo } from "react";
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
import { getCurrencySymbol } from "@/lib/services/currency-utils";

interface PriceChartProps {
  data: PriceSeriesPoint[];
  currency?: string;
  height?: number;
  showRange?: boolean;
  label?: string;
  showTimeRangeSelector?: boolean;
}

interface TooltipPayloadItem {
  value?: number;
  dataKey?: string;
  color?: string;
  payload?: PriceSeriesPoint;
}

const TIME_RANGES = [
  { label: "7d", days: 7 },
  { label: "30d", days: 30 },
  { label: "90d", days: 90 },
  { label: "1y", days: 365 },
  { label: "Tudo", days: 0 },
] as const;

function CustomTooltip({ active, payload, label, currency }: { active?: boolean; payload?: TooltipPayloadItem[]; label?: string; currency?: string }) {
  if (!active || !payload?.length) return null;
  const point = payload[0]?.payload;
  const sym = getCurrencySymbol(currency || "USD");
  return (
    <div className="bg-white px-3 py-2 rounded-lg shadow-lg border border-gray-200">
      <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
      {point?.avg != null && (
        <p className="text-sm font-mono font-bold text-gray-900">
          {sym}{point.avg.toFixed(2)}
        </p>
      )}
      {point?.min != null && point?.max != null && (
        <p className="text-[11px] text-gray-500">
          {sym}{point.min.toFixed(2)} — {sym}{point.max.toFixed(2)}
        </p>
      )}
    </div>
  );
}

export function PriceChart({
  data,
  currency = "USD",
  height = 280,
  showRange = true,
  label = "Preço",
  showTimeRangeSelector = false,
}: PriceChartProps) {
  const [selectedRange, setSelectedRange] = useState<number>(0);
  const sym = getCurrencySymbol(currency);

  const filteredData = useMemo(() => {
    if (selectedRange === 0) return data;
    const now = new Date();
    const cutoff = new Date(now.getTime() - selectedRange * 24 * 60 * 60 * 1000);
    return data.filter((d) => new Date(d.day) >= cutoff);
  }, [data, selectedRange]);

  const chartData = filteredData.map((d) => ({
    ...d,
    name: d.day.slice(5),
    value: d.avg,
    range: d.min != null && d.max != null ? [d.min, d.max] : undefined,
  }));

  const yDomain = filteredData.length > 0
    ? [
      Math.min(...filteredData.filter(d => d.avg != null).map(d => d.avg!), Infinity) * 0.95,
      Math.max(...filteredData.filter(d => d.avg != null).map(d => d.avg!), 0) * 1.05,
    ]
    : [0, 100];

  const summary = filteredData.length > 0
    ? `Price range: ${sym}${Math.min(...filteredData.filter(d => d.avg != null).map(d => d.avg!)).toFixed(2)} to ${sym}${Math.max(...filteredData.filter(d => d.avg != null).map(d => d.avg!)).toFixed(2)}`
    : "No data available";

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-gray-400 text-sm gap-2" style={{ height }}>
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <span>Sem dados de série temporal</span>
      </div>
    );
  }

  return (
    <div>
      {showTimeRangeSelector && (
        <div className="flex gap-1 mb-3" role="radiogroup" aria-label="Time range">
          {TIME_RANGES.map((range) => (
            <button
              key={range.days}
              role="radio"
              aria-checked={selectedRange === range.days}
              onClick={() => setSelectedRange(range.days)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md cursor-pointer transition-colors min-h-[32px] ${
                selectedRange === range.days
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      )}

      <div role="img" aria-label={`${label} chart. ${summary}`}>
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
              tickFormatter={(v: number) => `${sym}${v.toFixed(2)}`}
            />
            <Tooltip content={<CustomTooltip currency={currency} />} />
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
      </div>

      <p className="text-xs text-gray-400 mt-1" aria-live="polite">
        {filteredData.length} pontos de dados
      </p>
    </div>
  );
}

interface PriceBarChartProps {
  data: PriceSeriesPoint[];
  height?: number;
  currency?: string;
}

function BarTooltip({ active, payload, label, currency }: { active?: boolean; payload?: TooltipPayloadItem[]; label?: string; currency?: string }) {
  if (!active || !payload?.length) return null;
  const value = payload[0]?.value;
  const sym = getCurrencySymbol(currency || "USD");
  return (
    <div className="bg-white px-3 py-2 rounded-lg shadow-lg border border-gray-200">
      <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
      {value != null && (
        <p className="text-sm font-mono font-bold text-gray-900">
          {sym}{Number(value).toFixed(2)}
        </p>
      )}
    </div>
  );
}

export function PriceBarChart({ data, height = 260, currency = "USD" }: PriceBarChartProps) {
  const sym = getCurrencySymbol(currency);

  const chartData = data.map((d) => ({
    name: d.day.slice(5),
    value: d.avg ?? 0,
  }));

  const summary = data.length > 0
    ? `Average price: ${sym}${(data.reduce((sum, d) => sum + (d.avg || 0), 0) / data.length).toFixed(2)}`
    : "No data available";

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-gray-400 text-sm gap-2" style={{ height }}>
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <span>Sem dados</span>
      </div>
    );
  }

  return (
    <div role="img" aria-label={`Price bar chart. ${summary}`}>
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
            tickFormatter={(v: number) => `${sym}${v.toFixed(2)}`}
          />
          <Tooltip content={<BarTooltip currency={currency} />} />
          <Bar dataKey="value" fill="#10b981" radius={[3, 3, 0, 0]} maxBarSize={40} name="Preço" />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
