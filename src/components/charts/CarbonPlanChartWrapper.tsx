"use client";

import dynamic from "next/dynamic";

const CarbonPlanChart = dynamic(
  () => import("@/components/charts/CarbonPlanChart").then((mod) => mod.CarbonPlanChart),
  {
    loading: () => <ChartSkeleton />,
    ssr: false,
  }
);

function ChartSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-xl" />
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-[350px] bg-gray-200 dark:bg-gray-700 animate-pulse rounded-xl" />
        <div className="h-[350px] bg-gray-200 dark:bg-gray-700 animate-pulse rounded-xl" />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-[300px] bg-gray-200 dark:bg-gray-700 animate-pulse rounded-xl" />
        <div className="h-[300px] bg-gray-200 dark:bg-gray-700 animate-pulse rounded-xl" />
      </div>
      
      <div className="h-[300px] bg-gray-200 dark:bg-gray-700 animate-pulse rounded-xl" />
      
      <div className="space-y-4">
        <div className="h-10 w-1/3 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg" />
        <div className="h-64 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-xl" />
      </div>
    </div>
  );
}

export default function CarbonPlanChartWrapper() {
  return <CarbonPlanChart />;
}
