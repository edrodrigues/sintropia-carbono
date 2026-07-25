"use client";

import { useTranslations } from "next-intl";
import { getUserTypeIcon } from "@/lib/utils/user";
import type { MarketListingRow } from "@/lib/queries/market-listings";

interface Props {
  listing: MarketListingRow | null;
  locale: string;
  onClose: () => void;
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  if (value === null || value === undefined || value === "" || (Array.isArray(value) && value.length === 0)) return null;
  return (
    <div className="flex justify-between gap-4 py-1.5 border-b border-slate-50 dark:border-slate-800">
      <span className="text-xs text-slate-400 font-bold uppercase">{label}</span>
      <span className="text-xs text-slate-700 dark:text-slate-200 text-right">{value}</span>
    </div>
  );
}

function Chips({ values }: { values: string[] | null }) {
  if (!values || values.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1 justify-end">
      {values.map((v) => <span key={v} className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600">{v}</span>)}
    </div>
  );
}

export function ListingDetailDrawer({ listing, locale, onClose }: Props) {
  const t = useTranslations("MarketListings");
  if (!listing) return null;

  const isSupply = listing.side === "supply";
  const ratingsObj = listing.ratings as Record<string, unknown> | null;
  const ratingsText = ratingsObj
    ? Object.entries(ratingsObj).map(([k, v]) => `${k}: ${v}`).join(" · ")
    : null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 shadow-2xl overflow-y-auto h-full animate-in slide-in-from-right">
        <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-5 py-4 flex items-center justify-between">
          <div>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${isSupply ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-blue-50 text-blue-700 border-blue-200"}`}>
              {isSupply ? t("supply") : t("demand")}
            </span>
            <h2 className="text-base font-bold text-slate-900 dark:text-white mt-1">
              {isSupply ? listing.project_name : listing.author_display_name || t("anonymousBuyer")}
            </h2>
          </div>
          <button onClick={onClose} aria-label={t("close")} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="px-5 py-4 space-y-6">
          <section>
            <h3 className="text-xs font-bold uppercase text-slate-400 mb-2">{t("trustTitle")}</h3>
            <div className="flex flex-wrap gap-2 text-xs">
              <TrustBadge label={t("trustVerified")} value={false} />
              <TrustBadge label={t("trustDeals")} value={0} />
              <TrustBadge label={t("trustVolume")} value={"0"} />
              <span className="px-2 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold">
                {getUserTypeIcon(listing.author_user_type)} {listing.author_user_type ?? "individual"}
              </span>
            </div>
          </section>

          {isSupply ? (
            <section className="space-y-1">
              <h3 className="text-xs font-bold uppercase text-slate-400 mb-1">{t("groupRequired")}</h3>
              <Row label={t("assetType")} value={listing.asset_type === "carbon_credit" ? t("assetCarbon") : t("assetIrec")} />
              <Row label={t("registry")} value={listing.registry} />
              <Row label={t("projectRegistryId")} value={listing.project_registry_id} />
              <Row label={t("projectName")} value={listing.project_name} />
              <Row label={t("vintage")} value={listing.vintage} />
              <Row label={t("volume")} value={`${Number(listing.volume ?? 0).toLocaleString(locale)} ${listing.unit ?? ""}`} />
              <Row label={t("originCountry")} value={listing.origin_country} />
              <Row label={t("deliveryTerm")} value={listing.delivery_term} />
              <Row label={t("price")} value={listing.price_on_request ? t("onRequest") : (listing.price_amount ? `$${Number(listing.price_amount)} ${listing.price_currency}` : null)} />
            </section>
          ) : (
            <section className="space-y-1">
              <h3 className="text-xs font-bold uppercase text-slate-400 mb-1">{t("assetRequirementsTitle")}</h3>
              <Row label={t("assetType")} value={listing.asset_type === "carbon_credit" ? t("assetCarbon") : listing.asset_type === "irec" ? t("assetIrec") : t("assetBoth")} />
              <Row label={t("unit")} value={listing.unit} />
              <Row label={t("registries")} value={<Chips values={listing.registries} />} />
              <Row label={t("volumeRange")} value={listing.volume ? `${listing.volume}` : `${listing.volume_min ?? "?"}–${listing.volume_max ?? "?"}`} />
              <Row label={t("vintageRange")} value={`${listing.vintage_from ?? "?"}–${listing.vintage_to ?? "?"}`} />
              <Row label={t("priceRange")} value={listing.price_min || listing.price_max ? `${listing.price_min ?? "?"}–${listing.price_max ?? "?"}` : null} />
              <Row label={t("methodologies")} value={<Chips values={listing.methodologies} />} />
              <Row label={t("regions")} value={<Chips values={listing.regions} />} />
              <Row label={t("ccpRequirement")} value={listing.ccp_requirement} />
              <Row label={t("certifications")} value={<Chips values={listing.certifications} />} />
            </section>
          )}

          {isSupply && (
            <section className="space-y-1">
              <h3 className="text-xs font-bold uppercase text-slate-400 mb-1">{t("groupRecommended")}</h3>
              <Row label={t("methodology")} value={listing.methodology} />
              <Row label={t("ccpStatus")} value={listing.ccp_status} />
              <Row label={t("ratings")} value={ratingsText} />
              <Row label={t("coBenefits")} value={<Chips values={listing.co_benefits} />} />
              <Row label={t("cceeOrigem")} value={listing.ccee_origem} />
              <Row label={t("minTransactionSize")} value={listing.min_transaction_size ? Number(listing.min_transaction_size).toLocaleString(locale) : null} />
              <Row label={t("contractType")} value={listing.contract_type} />
              <Row label={t("mediaUrls")} value={listing.media_urls?.length ? listing.media_urls.join(", ") : null} />
            </section>
          )}

          {!isSupply && (
            <section className="space-y-1">
              <h3 className="text-xs font-bold uppercase text-slate-400 mb-1">{t("qualityCriteriaTitle")}</h3>
              <Row label={t("coBenefitPrefs")} value={<Chips values={listing.co_benefit_prefs} />} />
              <Row label={t("needsExtraDd")} value={listing.needs_extra_dd ? t("yes") : listing.needs_extra_dd === false ? t("no") : null} />
              <Row label={t("multiYearOfftake")} value={listing.open_to_multi_year_offtake ? (listing.offtake_until_year ? `${t("until")} ${listing.offtake_until_year}` : t("yes")) : null} />
            </section>
          )}

          {!isSupply && (
            <section className="space-y-1">
              <h3 className="text-xs font-bold uppercase text-slate-400 mb-1">{t("processTitle")}</h3>
              <Row label={t("proposalDeadline")} value={listing.proposal_deadline ? new Date(listing.proposal_deadline).toLocaleDateString(locale) : null} />
              <Row label={t("responseFormat")} value={listing.response_format} />
              <Row label={t("preferDealRoom")} value={listing.prefer_deal_room ? t("yes") : listing.prefer_deal_room === false ? t("no") : null} />
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

function TrustBadge({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <span className="px-2 py-1 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700 text-[10px] font-bold">
      {label}: {value}
    </span>
  );
}