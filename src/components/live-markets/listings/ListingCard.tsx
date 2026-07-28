"use client";

import { useTranslations } from "next-intl";
import { getUserTypeIcon } from "@/lib/utils/user";
import type { MarketListingRow } from "@/lib/queries/market-listings";

interface Props {
  listing: MarketListingRow;
  locale: string;
  onOpen: () => void;
}

export function ListingCard({ listing, locale, onOpen }: Props) {
  const t = useTranslations("MarketListings");
  const isSupply = listing.side === "supply";

  const assetLabel = (at: string) => {
    if (at === "carbon_credit") return t("assetCarbon");
    if (at === "irec") return t("assetIrec");
    return t("assetBoth");
  };

  const priceText = isSupply
    ? listing.price_on_request
      ? t("onRequest")
      : listing.price_amount
        ? `$${Number(listing.price_amount).toLocaleString(locale)} / ${listing.unit ?? ""}`
        : "—"
    : listing.price_min || listing.price_max
      ? `$${listing.price_min ?? "?"}–${listing.price_max ?? "?"} / ${listing.unit ?? ""}`
      : t("negotiable");

  const volumeText = isSupply
    ? `${Number(listing.volume ?? 0).toLocaleString(locale)} ${listing.unit ?? ""}`
    : listing.volume
      ? `${Number(listing.volume).toLocaleString(locale)} ${listing.unit ?? ""}`
      : `${listing.volume_min ?? "?"}–${listing.volume_max ?? "?"} ${listing.unit ?? ""}`;

  const badgeColor = isSupply ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-blue-50 text-blue-700 border-blue-200";

  return (
    <button
      onClick={onOpen}
      className="w-full text-left bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 hover:shadow-md transition-all flex flex-col gap-3"
    >
      <div className="flex items-start justify-between gap-2">
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${badgeColor}`}>
          {isSupply ? t("supply") : t("demand")}
        </span>
        {typeof listing.completeness_score === "number" && (
          <span className="text-[10px] font-bold text-slate-400" title={t("completeness")}>
            {t("completenessShort", { score: listing.completeness_score })}
          </span>
        )}
      </div>

      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{assetLabel(listing.asset_type)}</p>
        <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2">
          {isSupply ? listing.project_name : listing.author_display_name || listing.author_username || t("anonymousBuyer")}
        </h3>
        {isSupply && listing.project_registry_id && (
          <p className="text-[11px] text-slate-400 mt-0.5">{listing.project_registry_id}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <p className="text-[10px] text-slate-400 uppercase font-bold">{t("volumeCard")}</p>
          <p className="font-semibold text-slate-700 dark:text-slate-200">{volumeText}</p>
        </div>
        <div>
          <p className="text-[10px] text-slate-400 uppercase font-bold">{t("priceCard")}</p>
          <p className="font-semibold text-slate-700 dark:text-slate-200">{priceText}</p>
        </div>
        <div>
          <p className="text-[10px] text-slate-400 uppercase font-bold">{isSupply ? t("vintageCard") : t("vintageRangeCard")}</p>
          <p className="font-semibold text-slate-700 dark:text-slate-200">
            {isSupply ? listing.vintage ?? "—" : `${listing.vintage_from ?? "?"}–${listing.vintage_to ?? "?"}`}
          </p>
        </div>
        <div>
          <p className="text-[10px] text-slate-400 uppercase font-bold">{isSupply ? t("countryCard") : t("regionsCard")}</p>
          <p className="font-semibold text-slate-700 dark:text-slate-200">
            {isSupply ? listing.origin_country ?? "—" : (listing.regions?.slice(0, 2).join(", ") || "—")}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
        <span className="text-xs text-slate-400">
          {getUserTypeIcon(listing.author_user_type)} {listing.author_display_name || listing.author_username}
        </span>
        <span className="text-xs text-slate-400">
          {new Date(listing.created_at).toLocaleDateString(locale, { day: "2-digit", month: "short" })}
        </span>
      </div>
    </button>
  );
}