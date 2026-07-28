"use client";

import { useState, useMemo } from "react";
import { useRouter } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { ListingCard } from "./ListingCard";
import { ListingDetailDrawer } from "./ListingDetailDrawer";
import type { MarketListingRow } from "@/lib/queries/market-listings";

interface Props {
  listings: MarketListingRow[];
  locale: string;
}

export function ListingsTabInner({ listings, locale }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("MarketListings");
  const tHeader = useTranslations("Header");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const side = (searchParams.get("side") as "supply" | "demand" | "all") || "all";
  const search = searchParams.get("search") || "";

  const setSide = (s: "supply" | "demand" | "all") => {
    const params = new URLSearchParams(searchParams.toString());
    if (s === "all") params.delete("side"); else params.set("side", s);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const setSearch = (val: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (val) params.set("search", val); else params.delete("search");
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const counts = useMemo(() => ({
    supply: listings.filter((l) => l.side === "supply").length,
    demand: listings.filter((l) => l.side === "demand").length,
  }), [listings]);

  const sideBtn = (id: "supply" | "demand" | "all") =>
    `px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
      side === id ? "bg-deep-forest text-white border-deep-forest" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
    }`;

  const selected = listings.find((l) => l.id === selectedId) ?? null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          <button onClick={() => setSide("all")} className={sideBtn("all")}>{t("all")}</button>
          <button onClick={() => setSide("supply")} className={sideBtn("supply")}>
            {t("supply")} {counts.supply > 0 && <span className="opacity-70">({counts.supply})</span>}
          </button>
          <button onClick={() => setSide("demand")} className={sideBtn("demand")}>
            {t("demand")} {counts.demand > 0 && <span className="opacity-70">({counts.demand})</span>}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <input
            placeholder={t("searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs w-44 focus:outline-none focus:ring-2 focus:ring-deep-forest"
          />
          <button
            onClick={() => router.push(`/carbono/mercados-ao-vivo/criar/oferta`)}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700"
          >
            + {tHeader("criarOferta")}
          </button>
          <button
            onClick={() => router.push(`/carbono/mercados-ao-vivo/criar/demanda`)}
            className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700"
          >
            + {tHeader("criarDemanda")}
          </button>
        </div>
      </div>

      {listings.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <p className="text-sm">{t("empty")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {listings.map((l) => (
            <ListingCard key={l.id} listing={l} locale={locale} onOpen={() => setSelectedId(l.id)} />
          ))}
        </div>
      )}

      <ListingDetailDrawer listing={selected} locale={locale} onClose={() => setSelectedId(null)} />
    </div>
  );
}