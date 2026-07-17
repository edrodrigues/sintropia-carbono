"use client";

import { Skeleton } from "@/components/ui/Skeleton";

export function KPICardSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
      <Skeleton className="h-3 w-24 mb-3" />
      <Skeleton className="h-8 w-32 mb-2" />
      <Skeleton className="h-3 w-20" />
    </div>
  );
}

export function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
  return (
    <tr className="border-b border-gray-50">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  );
}

export function TableSkeleton({ rows = 5, columns = 5 }: { rows?: number; columns?: number }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/50">
            {Array.from({ length: columns }).map((_, i) => (
              <th key={i} className="px-4 py-2.5">
                <Skeleton className="h-3 w-16" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <TableRowSkeleton key={i} columns={columns} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function OverviewSkeleton() {
  return (
    <div className="flex flex-col lg:flex-row gap-6" role="status" aria-label="Loading market data">
      <span className="sr-only">Loading...</span>
      <div className="flex-1 min-w-0 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICardSkeleton />
          <KPICardSkeleton />
          <KPICardSkeleton />
          <KPICardSkeleton />
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <Skeleton className="h-5 w-48 mb-1" />
            <Skeleton className="h-3 w-32" />
          </div>
          <TableSkeleton rows={6} columns={6} />
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <Skeleton className="h-5 w-40 mb-1" />
            <Skeleton className="h-3 w-48" />
          </div>
          <TableSkeleton rows={8} columns={6} />
        </div>
      </div>

      <aside className="w-full lg:w-72 shrink-0 space-y-4">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-4 py-3 border-b border-gray-100">
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="px-4 py-3 space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <Skeleton className="w-7 h-7 rounded-lg shrink-0" />
                <div className="flex-1">
                  <Skeleton className="h-3 w-full mb-1" />
                  <Skeleton className="h-2 w-16" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-4 py-3 border-b border-gray-100">
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="px-4 py-3 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <Skeleton className="h-3 w-24 mb-1" />
                  <Skeleton className="h-2 w-16" />
                </div>
                <Skeleton className="h-4 w-16 ml-2" />
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}

export function ExplorerSkeleton() {
  return (
    <div className="space-y-4" role="status" aria-label="Loading price explorer">
      <span className="sr-only">Loading...</span>
      <Skeleton className="h-10 w-full" />
      <div className="flex gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-24" />
        ))}
      </div>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <TableSkeleton rows={10} columns={7} />
      </div>
    </div>
  );
}

export function ComparatorSkeleton() {
  return (
    <div className="space-y-4" role="status" aria-label="Loading comparator">
      <span className="sr-only">Loading...</span>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <Skeleton className="h-3 w-20 mb-2" />
            <Skeleton className="h-4 w-32 mb-2" />
            <Skeleton className="h-8 w-24 mb-2" />
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <TableSkeleton rows={10} columns={4} />
      </div>
    </div>
  );
}

export function WatchlistSkeleton() {
  return (
    <div className="space-y-6" role="status" aria-label="Loading watchlist">
      <span className="sr-only">Loading...</span>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <Skeleton className="h-5 w-24" />
        </div>
        <TableSkeleton rows={5} columns={5} />
      </div>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <Skeleton className="h-5 w-32" />
        </div>
        <div className="divide-y divide-gray-50">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="px-6 py-3.5 flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-lg shrink-0" />
              <div className="flex-1">
                <Skeleton className="h-4 w-48 mb-1" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="w-11 h-6 rounded-full shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
