"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { createDemandListing, upsertBuyerProfile } from "@/app/[locale]/(public)/carbono/mercados-ao-vivo/actions";
import {
  ASSET_TYPE_OPTIONS, UNIT_OPTIONS, REGISTRY_OPTIONS, METHODOLOGY_OPTIONS,
  CCP_REQUIREMENT_OPTIONS, RESPONSE_FORMAT_OPTIONS, COUNTRY_OPTIONS,
  CO_BENEFIT_OPTIONS, PURCHASE_PURPOSE_OPTIONS, ANNUAL_BUDGET_OPTIONS,
  EVALUATION_CRITERIA_OPTIONS, RATING_AGENCIES, RATING_GRADES,
} from "@/lib/utils/market-listing-options";
import type { BuyerProfileRow } from "@/lib/queries/market-listings";

interface Props {
  locale: string;
  existingBuyerProfile: BuyerProfileRow | null;
}

export function CreateDemandForm({ locale, existingBuyerProfile }: Props) {
  const router = useRouter();
  const t = useTranslations("MarketListings");

  const [buyer, setBuyer] = useState({
    company_name: existingBuyerProfile?.company_name ?? "",
    buyer_country: existingBuyerProfile?.buyer_country ?? "",
    purchase_purpose: (existingBuyerProfile?.purchase_purpose ?? []) as string[],
    bought_br_credits_before: existingBuyerProfile?.bought_br_credits_before ?? false,
    annual_budget_range: existingBuyerProfile?.annual_budget_range ?? "",
  });

  const [form, setForm] = useState({
    asset_type: "carbon_credit" as "carbon_credit" | "irec" | "both",
    registries: [] as string[],
    volume: "",
    volume_min: "",
    volume_max: "",
    unit: "tCO2e" as "tCO2e" | "MWh",
    vintage_from: "",
    vintage_to: "",
    methodologies: [] as string[],
    regions: [] as string[],
    price_min: "",
    price_max: "",
    delivery_term: "Spot",
    ccp_requirement: "" as "" | "required" | "preferred" | "irrelevant",
    certifications: [] as string[],
    co_benefit_prefs: [] as string[],
    needs_extra_dd: false,
    open_to_multi_year_offtake: false,
    offtake_until_year: "",
    proposal_deadline: "",
    response_format: "" as "" | "free" | "template",
    prefer_deal_room: false,
    notes: "",
  });

  const [evalCriteria, setEvalCriteria] = useState<Record<string, number>>({
    quality: 40,
    price: 30,
    co_benefits: 15,
    track_record: 15,
  });

  const [minRatings, setMinRatings] = useState<Record<string, string>>({});
  const [showEvalCriteria, setShowEvalCriteria] = useState(false);
  const [showMinRatings, setShowMinRatings] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const labels = (opt: { label: { pt: string; en: string; es: string } }) =>
    opt.label[locale as "pt" | "en" | "es"] ?? opt.label.pt;

  const toggleArray = (arr: string[], val: string) =>
    arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.unit) { setError(t("errRequired")); return; }

    const payload: Record<string, unknown> = {
      asset_type: form.asset_type,
      unit: form.unit,
      volume: form.volume ? Number(form.volume) : undefined,
      volume_min: form.volume_min ? Number(form.volume_min) : undefined,
      volume_max: form.volume_max ? Number(form.volume_max) : undefined,
      vintage_from: form.vintage_from ? Number(form.vintage_from) : undefined,
      vintage_to: form.vintage_to ? Number(form.vintage_to) : undefined,
      methodologies: form.methodologies.length ? form.methodologies : undefined,
      regions: form.regions.length ? form.regions : undefined,
      price_min: form.price_min ? Number(form.price_min) : undefined,
      price_max: form.price_max ? Number(form.price_max) : undefined,
      delivery_term: form.delivery_term || undefined,
      ccp_requirement: form.ccp_requirement || undefined,
      certifications: form.certifications.length ? form.certifications : undefined,
      co_benefit_prefs: form.co_benefit_prefs.length ? form.co_benefit_prefs : undefined,
      needs_extra_dd: form.needs_extra_dd,
      open_to_multi_year_offtake: form.open_to_multi_year_offtake,
      offtake_until_year: form.offtake_until_year ? Number(form.offtake_until_year) : undefined,
      proposal_deadline: form.proposal_deadline ? new Date(form.proposal_deadline).toISOString() : undefined,
      response_format: form.response_format || undefined,
      registries: form.registries,
      prefer_deal_room: form.prefer_deal_room,
      evaluation_criteria: showEvalCriteria ? evalCriteria : undefined,
      min_ratings: showMinRatings ? minRatings : undefined,
      notes: form.notes.trim() || undefined,
    };

    setLoading(true);
    if (!existingBuyerProfile && (buyer.company_name || buyer.buyer_country || buyer.purchase_purpose.length)) {
      await upsertBuyerProfile({
        company_name: buyer.company_name,
        buyer_country: buyer.buyer_country,
        purchase_purpose: buyer.purchase_purpose,
        bought_br_credits_before: buyer.bought_br_credits_before,
        annual_budget_range: buyer.annual_budget_range,
      });
    } else if (existingBuyerProfile) {
      await upsertBuyerProfile({
        company_name: buyer.company_name,
        buyer_country: buyer.buyer_country,
        purchase_purpose: buyer.purchase_purpose,
        bought_br_credits_before: buyer.bought_br_credits_before,
        annual_budget_range: buyer.annual_budget_range,
      });
    }

    const res = await createDemandListing(payload);
    setLoading(false);

    if (res && "error" in res) { setError(res.error); return; }
    router.push(`/${locale}/carbono/mercados-ao-vivo?tab=listagens&side=demand`);
  };

  const inputCls = "w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-deep-forest";
  const labelCls = "block text-xs font-bold text-slate-500 mb-1";
  const chip = (arr: string[], val: string) =>
    `px-2.5 py-1 rounded-full text-xs border transition ${arr.includes(val) ? "bg-deep-forest text-white border-deep-forest" : "bg-white text-slate-600 border-slate-200"}`;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Seção 1: Perfil do comprador */}
      <section className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wide text-slate-700">{t("buyerProfileTitle")}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>{t("buyerCompany")}</label>
            <input className={inputCls} value={buyer.company_name} onChange={(e) => setBuyer((b) => ({ ...b, company_name: e.target.value }))} />
          </div>
          <div>
            <label className={labelCls}>{t("buyerCountry")}</label>
            <input list="cty-list" className={inputCls} value={buyer.buyer_country} onChange={(e) => setBuyer((b) => ({ ...b, buyer_country: e.target.value }))} />
            <datalist id="cty-list">{COUNTRY_OPTIONS.map((c) => <option key={c} value={c} />)}</datalist>
          </div>
          <div>
            <label className={labelCls}>{t("purchasePurpose")}</label>
            <div className="flex flex-wrap gap-2">
              {PURCHASE_PURPOSE_OPTIONS.map((p) => (
                <button type="button" key={p.value}
                  onClick={() => setBuyer((b) => ({ ...b, purchase_purpose: toggleArray(b.purchase_purpose, p.value) }))}
                  className={chip(buyer.purchase_purpose, p.value)}>
                  {labels(p)}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className={labelCls}>{t("annualBudget")}</label>
            <select className={inputCls} value={buyer.annual_budget_range} onChange={(e) => setBuyer((b) => ({ ...b, annual_budget_range: e.target.value }))}>
              <option value="">—</option>
              {ANNUAL_BUDGET_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-xs">
              <input type="checkbox" checked={buyer.bought_br_credits_before} onChange={(e) => setBuyer((b) => ({ ...b, bought_br_credits_before: e.target.checked }))} />
              {t("boughtBrBefore")}
            </label>
          </div>
        </div>
      </section>

      {/* Seção 2: Requisitos do ativo */}
      <section className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wide text-slate-700">{t("assetRequirementsTitle")}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>{t("assetType")}*</label>
            <select className={inputCls} value={form.asset_type} onChange={(e) => setForm((f) => ({ ...f, asset_type: e.target.value as any }))}>
              {ASSET_TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{labels(o)}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>{t("unit")}*</label>
            <select className={inputCls} value={form.unit} onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value as any }))}>
              {UNIT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>{t("registries")}</label>
            <div className="flex flex-wrap gap-2">
              {REGISTRY_OPTIONS.map((r) => (
                <button type="button" key={r}
                  onClick={() => setForm((f) => ({ ...f, registries: toggleArray(f.registries, r) }))}
                  className={chip(form.registries, r)}>{r}</button>
              ))}
            </div>
          </div>
          <div>
            <label className={labelCls}>{t("volumeRange")}</label>
            <div className="flex gap-2">
              <input type="number" className={inputCls} value={form.volume_min} onChange={(e) => setForm((f) => ({ ...f, volume_min: e.target.value }))} placeholder="min" />
              <input type="number" className={inputCls} value={form.volume_max} onChange={(e) => setForm((f) => ({ ...f, volume_max: e.target.value }))} placeholder="máx" />
            </div>
          </div>
          <div>
            <label className={labelCls}>{t("vintageRange")}</label>
            <div className="flex gap-2">
              <input type="number" className={inputCls} value={form.vintage_from} onChange={(e) => setForm((f) => ({ ...f, vintage_from: e.target.value }))} placeholder="de" />
              <input type="number" className={inputCls} value={form.vintage_to} onChange={(e) => setForm((f) => ({ ...f, vintage_to: e.target.value }))} placeholder="até" />
            </div>
          </div>
          <div>
            <label className={labelCls}>{t("priceRange")}</label>
            <div className="flex gap-2">
              <input type="number" className={inputCls} value={form.price_min} onChange={(e) => setForm((f) => ({ ...f, price_min: e.target.value }))} placeholder="min" />
              <input type="number" className={inputCls} value={form.price_max} onChange={(e) => setForm((f) => ({ ...f, price_max: e.target.value }))} placeholder="máx" />
            </div>
          </div>
          <div>
            <label className={labelCls}>{t("deliveryTerm")}</label>
            <input className={inputCls} value={form.delivery_term} onChange={(e) => setForm((f) => ({ ...f, delivery_term: e.target.value }))} />
          </div>
          <div>
            <label className={labelCls}>{t("ccpRequirement")}</label>
            <select className={inputCls} value={form.ccp_requirement} onChange={(e) => setForm((f) => ({ ...f, ccp_requirement: e.target.value as any }))}>
              <option value="">—</option>
              {CCP_REQUIREMENT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{labels(o)}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className={labelCls}>{t("methodologies")}</label>
          <div className="flex flex-wrap gap-2">
            {METHODOLOGY_OPTIONS.map((m) => (
              <button type="button" key={m}
                onClick={() => setForm((f) => ({ ...f, methodologies: toggleArray(f.methodologies, m) }))}
                className={chip(form.methodologies, m)}>{m}</button>
            ))}
          </div>
        </div>
        <div>
          <label className={labelCls}>{t("regions")}</label>
          <div className="flex flex-wrap gap-2">
            {COUNTRY_OPTIONS.map((r) => (
              <button type="button" key={r}
                onClick={() => setForm((f) => ({ ...f, regions: toggleArray(f.regions, r) }))}
                className={chip(form.regions, r)}>{r}</button>
            ))}
          </div>
        </div>
      </section>

      {/* Seção 3: Qualidade */}
      <section className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wide text-slate-700">{t("qualityCriteriaTitle")}</h2>
        <div>
          <label className={labelCls}>{t("coBenefitPrefs")}</label>
          <div className="flex flex-wrap gap-2">
            {CO_BENEFIT_OPTIONS.map((cb) => (
              <button type="button" key={cb}
                onClick={() => setForm((f) => ({ ...f, co_benefit_prefs: toggleArray(f.co_benefit_prefs, cb) }))}
                className={chip(form.co_benefit_prefs, cb)}>{cb}</button>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 text-xs">
            <input type="checkbox" checked={form.needs_extra_dd} onChange={(e) => setForm((f) => ({ ...f, needs_extra_dd: e.target.checked }))} />
            {t("needsExtraDd")}
          </label>
          <label className="flex items-center gap-2 text-xs">
            <input type="checkbox" checked={form.open_to_multi_year_offtake} onChange={(e) => setForm((f) => ({ ...f, open_to_multi_year_offtake: e.target.checked }))} />
            {t("multiYearOfftake")}
          </label>
          {form.open_to_multi_year_offtake && (
            <input type="number" className={`${inputCls} w-28`} value={form.offtake_until_year} onChange={(e) => setForm((f) => ({ ...f, offtake_until_year: e.target.value }))} placeholder="até 2029" />
          )}
        </div>

        <div className="border-t border-slate-100 pt-4">
          <button type="button" onClick={() => setShowEvalCriteria((v) => !v)}
            className="text-xs font-bold text-deep-forest hover:underline flex items-center gap-1">
            {showEvalCriteria ? "−" : "+"} {t("evaluationCriteria")}
          </button>
          {showEvalCriteria && (
            <div className="mt-3 space-y-3">
              <p className="text-xs text-slate-500">{t("evaluationCriteriaHelp")}</p>
              {EVALUATION_CRITERIA_OPTIONS.map((c) => (
                <div key={c.value} className="flex items-center gap-3">
                  <span className="text-xs w-40 text-slate-700">{labels(c)}</span>
                  <input type="number" min={0} max={100}
                    className={`${inputCls} w-20`}
                    value={evalCriteria[c.value] ?? 0}
                    onChange={(e) => setEvalCriteria((prev) => ({ ...prev, [c.value]: Math.min(100, Math.max(0, Number(e.target.value))) }))} />
                  <span className="text-xs text-slate-400">%</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-slate-100 pt-4">
          <button type="button" onClick={() => setShowMinRatings((v) => !v)}
            className="text-xs font-bold text-deep-forest hover:underline flex items-center gap-1">
            {showMinRatings ? "−" : "+"} {t("minRatings")}
          </button>
          {showMinRatings && (
            <div className="mt-3 space-y-3">
              <p className="text-xs text-slate-500">{t("minRatingsHelp")}</p>
              {RATING_AGENCIES.map((agency) => (
                <div key={agency} className="flex items-center gap-3">
                  <span className="text-xs w-40 text-slate-700 capitalize">{agency}</span>
                  <select className={`${inputCls} w-32`}
                    value={minRatings[agency] ?? ""}
                    onChange={(e) => setMinRatings((prev) => ({ ...prev, [agency]: e.target.value }))}>
                    <option value="">—</option>
                    {RATING_GRADES.map((g) => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Seção 4: Processo */}
      <section className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wide text-slate-700">{t("processTitle")}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>{t("proposalDeadline")}</label>
            <input type="datetime-local" className={inputCls} value={form.proposal_deadline} onChange={(e) => setForm((f) => ({ ...f, proposal_deadline: e.target.value }))} />
          </div>
          <div>
            <label className={labelCls}>{t("responseFormat")}</label>
            <select className={inputCls} value={form.response_format} onChange={(e) => setForm((f) => ({ ...f, response_format: e.target.value as any }))}>
              <option value="">—</option>
              {RESPONSE_FORMAT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{labels(o)}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2 sm:col-span-2">
            <label className="flex items-center gap-2 text-xs">
              <input type="checkbox" checked={form.prefer_deal_room} onChange={(e) => setForm((f) => ({ ...f, prefer_deal_room: e.target.checked }))} />
              {t("preferDealRoom")}
            </label>
          </div>
        </div>
        <div>
          <label className={labelCls}>{t("notes")}</label>
          <textarea
            className={`${inputCls} resize-none`}
            rows={3}
            maxLength={500}
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            placeholder={t("notesPlaceholder")}
          />
          <p className="mt-1 text-right text-xs text-slate-400">{form.notes.length}/500</p>
        </div>
      </section>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-3">
        <button type="submit" disabled={loading}
          className="flex-1 py-3 px-4 rounded-xl bg-[#0a382c] text-white font-bold shadow-lg shadow-deep-forest/25 transition-all hover:bg-charcoal-ink active:scale-95 disabled:opacity-50">
          {loading ? t("publishing") : t("publish")}
        </button>
        <button type="button" onClick={() => router.back()}
          className="px-4 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50">
          {t("cancel")}
        </button>
      </div>
    </form>
  );
}