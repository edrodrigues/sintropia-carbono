"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { LayoutGrid, Search, ArrowLeftRight, Star } from "lucide-react";

type TabId = "overview" | "explorer" | "comparator" | "watchlist";

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: "overview", label: "Visão geral", icon: LayoutGrid },
  { id: "explorer", label: "Explorar preços", icon: Search },
  { id: "comparator", label: "Comparador", icon: ArrowLeftRight },
  { id: "watchlist", label: "Watchlist", icon: Star },
];

const TABS_EN: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: "overview", label: "Overview", icon: LayoutGrid },
  { id: "explorer", label: "Explore prices", icon: Search },
  { id: "comparator", label: "Comparator", icon: ArrowLeftRight },
  { id: "watchlist", label: "Watchlist", icon: Star },
];

interface LiveMarketsTabsProps {
  activeTab: TabId;
  locale?: string;
}

export function LiveMarketsTabs({ activeTab, locale = "pt" }: LiveMarketsTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const tabs = locale === "en" ? TABS_EN : TABS;

  const switchTab = (tabId: TabId) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tabId);
    const keysToReset = ["asset"];
    for (const k of keysToReset) params.delete(k);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="border-b border-gray-200">
      <nav className="flex gap-0 -mb-px" role="tablist">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => switchTab(tab.id)}
              className={`inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                isActive
                  ? "border-blue-600 text-blue-700"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
