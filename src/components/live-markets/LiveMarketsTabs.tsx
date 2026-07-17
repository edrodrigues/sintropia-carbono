"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useRef, useCallback } from "react";
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
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const tabs = locale === "en" ? TABS_EN : TABS;

  const switchTab = useCallback(
    (tabId: TabId) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", tabId);
      params.delete("asset");
      router.push(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, currentIndex: number) => {
      let nextIndex: number | null = null;

      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        nextIndex = (currentIndex + 1) % tabs.length;
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
      } else if (e.key === "Home") {
        e.preventDefault();
        nextIndex = 0;
      } else if (e.key === "End") {
        e.preventDefault();
        nextIndex = tabs.length - 1;
      }

      if (nextIndex !== null) {
        tabRefs.current[nextIndex]?.focus();
        switchTab(tabs[nextIndex].id);
      }
    },
    [tabs, switchTab],
  );

  return (
    <div className="border-b border-gray-200">
      <nav className="flex gap-0 -mb-px" role="tablist" aria-label="Live Markets">
        {tabs.map((tab, index) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              ref={(el) => { tabRefs.current[index] = el; }}
              role="tab"
              id={`tab-${tab.id}`}
              aria-selected={isActive}
              aria-controls={`panel-${tab.id}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => switchTab(tab.id)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className={`inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                isActive
                  ? "border-blue-600 text-blue-700"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <Icon className="w-4 h-4" aria-hidden="true" />
              {tab.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
