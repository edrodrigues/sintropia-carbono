"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { createSupplyListing } from "@/app/[locale]/(public)/carbono/mercados-ao-vivo/actions";
import {
  ASSET_TYPE_OPTIONS, UNIT_OPTIONS, REGISTRY_OPTIONS, METHODOLOGY_OPTIONS,
  CCP_STATUS_OPTIONS, CCEE_ORIGEM_OPTIONS, COUNTRY_OPTIONS,
  CO_BENEFIT_OPTIONS, CONTRACT_TYPE_OPTIONS, DELIVERY_TERM_OPTIONS,
  RATING_AGENCIES,
} from "@/lib/utils/market-listing-options";

interface Props { locale: string; }

export function CreateSupplyForm({ locale }: Props) {
  const router = useRouter();
  const t = useTranslations("MarketListings");

  const [form, setForm] = useState({
    asset_type: "carbon_credit" as "carbon_credit" | "irec" | "both",
    registry: "",
    project_registry_id: "",
    project_name: "",
    vintage: "",
    volume: "",
    unit: "tCO2e" as "tCO2e" | "MWh",
    origin_country: "",
    delivery_term: "Spot",
    price_on_request: false,
    price_amount: "",
    price_currency: "USD",
    methodology: "",
    ccp_status: "" as "" | "ccp_eligible" | "under_assessment" | "not_applicable",
    sylvera: "", bezero: "", renoster: "",
    co_benefits: [] as string[],
    ccee_origem: "" as "" | "yes" | "no" | "pending",
    min_transaction_size: "",
    documentation: [] as string[],
    media_urls: "",
    contract_type: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const labels = (opt: { label: { pt: string; en: string; es: string } }) =>
    opt.label[locale as "pt" | "en" | "es"] ?? opt.label.pt;

  const toggleArray = (arr: string[], val: string) =>
    arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.registry || !form.project_registry_id || !form.project_name ||
        !form.vintage || !form.volume || !form.origin_country || !form.delivery_term) {
      setError(t("errRequired"));
      return;
    }
    if (!form.price_on_request && (!form.price_amount || Number(form.price_amount) <= 0)) {
      setError(t("errPrice"));
      return;
    }

    const payload: Record<string, unknown> = {
      asset_type: form.asset_type,
      registry: form.registry,
      project_registry_id: form.project_registry_id,
      project_name: form.project_name,
      vintage: Number(form.vintage),
      volume: Number(form.volume),
      unit: form.unit,
      origin_country: form.origin_country,
      delivery_term: form.delivery_term,
      price_on_request: form.price_on_request,
      price_amount: form.price_on_request ? null : Number(form.price_amount),
      price_currency: form.price_currency,
      methodology: form.methodology || undefined,
      ccp_status: form.ccp_status || undefined,
      ccee_origem: form.ccee_origem || undefined,
      min_transaction_size: form.min_transaction_size ? Number(form.min_transaction_size) : undefined,
      co_benefits: form.co_benefits.length ? form.co_benefits : undefined,
      documentation: form.documentation.length ? form.documentation : undefined,
      media_urls: form.media_urls ? form.media_urls.split(",").map((s) => s.trim()).filter(Boolean) : undefined,
      contract_type: form.contract_type || undefined,
    };
    if (form.sylvera || form.bezero || form.renoster) {
      const ratings: Record<string, unknown> = {};
      if (form.sylvera) ratings.sylvera = form.sylvera;
      if (form.bezero) ratings.bezero = form.bezero;
      if (form.renoster) ratings.renoster = Number(form.renoster);
      payload.ratings = ratings;
    }

    setLoading(true);
    const res = await createSupplyListing(payload);
    setLoading(false);

    if (res && "error" in res) {
      setError(res.error);
      return;
    }
    router.push(`/${locale}/carbono/mercados-ao-vivo?tab=listagens&side=supply`);
  };

  const field = (k: keyof typeof form, val: string | boolean) =>
    setForm((f) => ({ ...f, [k]: val }));

  const inputCls = "w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-deep-forest";
  const labelCls = "block text-xs font-bold text-slate-500 mb-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Obrigatórios */}
      <section className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wide text-slate-700">{t("groupRequired")}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>{t("assetType")}*</label>
            <select className={inputCls} value={form.asset_type} onChange={(e) => field("asset_type", e.target.value)}>
              {ASSET_TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{labels(o)}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>{t("registry")}*</label>
            <input list="reg-list" className={inputCls} value={form.registry} onChange={(e) => field("registry", e.target.value)} />
            <datalist id="reg-list">{REGISTRY_OPTIONS.map((r) => <option key={r} value={r} />)}</datalist>
          </div>
          <div>
            <label className={labelCls}>{t("projectRegistryId")}*</label>
            <input className={inputCls} value={form.project_registry_id} onChange={(e) => field("project_registry_id", e.target.value)} placeholder="VCS-1234 ou IREC-BR-2025-XXXX" />
          </div>
          <div>
            <label className={labelCls}>{t("projectName")}*</label>
            <input className={inputCls} value={form.project_name} onChange={(e) => field("project_name", e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>{t("vintage")}*</label>
            <input type="number" className={inputCls} value={form.vintage} onChange={(e) => field("vintage", e.target.value)} placeholder="2023" />
          </div>
          <div>
            <label className={labelCls}>{t("volume")}*</label>
            <input type="number" className={inputCls} value={form.volume} onChange={(e) => field("volume", e.target.value)} placeholder="10000" />
          </div>
          <div>
            <label className={labelCls}>{t("unit")}*</label>
            <select className={inputCls} value={form.unit} onChange={(e) => field("unit", e.target.value)}>
              {UNIT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>{t("originCountry")}*</label>
            <input list="cty-list" className={inputCls} value={form.origin_country} onChange={(e) => field("origin_country", e.target.value)} />
            <datalist id="cty-list">{COUNTRY_OPTIONS.map((c) => <option key={c} value={c} />)}</datalist>
          </div>
          <div>
            <label className={labelCls}>{t("deliveryTerm")}*</label>
            <input list="dt-list" className={inputCls} value={form.delivery_term} onChange={(e) => field("delivery_term", e.target.value)} />
            <datalist id="dt-list">{DELIVERY_TERM_OPTIONS.map((d) => <option key={d} value={d} />)}</datalist>
          </div>
        </div>
      </section>

      {/* Recomendados */}
      <section className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wide text-slate-700">{t("groupRecommended")}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>{t("methodology")}</label>
            <input list="meth-list" className={inputCls} value={form.methodology} onChange={(e) => field("methodology", e.target.value)} />
            <datalist id="meth-list">{METHODOLOGY_OPTIONS.map((m) => <option key={m} value={m} />)}</datalist>
          </div>
          <div>
            <label className={labelCls}>{t("ccpStatus")}</label>
            <select className={inputCls} value={form.ccp_status} onChange={(e) => field("ccp_status", e.target.value)}>
              <option value="">—</option>
              {CCP_STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{labels(o)}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>{t("ratings")}</label>
            <div className="grid grid-cols-3 gap-2">
              {RATING_AGENCIES.map((ag) => (
                <input key={ag} className={inputCls} placeholder={ag} value={(form as any)[ag]} onChange={(e) => field(ag, e.target.value)} />
              ))}
            </div>
          </div>
          <div>
            <label className={labelCls}>{t("cceeOrigem")}</label>
            <select className={inputCls} value={form.ccee_origem} onChange={(e) => field("ccee_origem", e.target.value)}>
              <option value="">—</option>
              {CCEE_ORIGEM_OPTIONS.map((o) => <option key={o.value} value={o.value}>{labels(o)}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>{t("minTransactionSize")}</label>
            <input type="number" className={inputCls} value={form.min_transaction_size} onChange={(e) => field("min_transaction_size", e.target.value)} placeholder="1000" />
          </div>
          <div>
            <label className={labelCls}>{t("contractType")}</label>
            <input list="ct-list" className={inputCls} value={form.contract_type} onChange={(e) => field("contract_type", e.target.value)} />
            <datalist id="ct-list">{CONTRACT_TYPE_OPTIONS.map((c) => <option key={c} value={c} />)}</datalist>
          </div>
          <div>
            <label className={labelCls}>{t("mediaUrls")}</label>
            <input className={inputCls} value={form.media_urls} onChange={(e) => field("media_urls", e.target.value)} placeholder="https://..., https://..." />
          </div>
          <div>
            <label className={labelCls}>{t("price")}</label>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1 text-xs">
                <input type="checkbox" checked={form.price_on_request} onChange={(e) => field("price_on_request", e.target.checked)} />
                {t("onRequest")}
              </label>
              {!form.price_on_request && (
                <div className="flex gap-1 flex-1">
                  <input type="number" className={inputCls} value={form.price_amount} onChange={(e) => field("price_amount", e.target.value)} placeholder="7.50" disabled={form.price_on_request} />
                  <input className={`${inputCls} w-16`} value={form.price_currency} onChange={(e) => field("price_currency", e.target.value)} />
                </div>
              )}
            </div>
          </div>
        </div>
        <div>
          <label className={labelCls}>{t("coBenefits")}</label>
          <div className="flex flex-wrap gap-2">
            {CO_BENEFIT_OPTIONS.map((cb) => (
              <button type="button" key={cb}
                onClick={() => setForm((f) => ({ ...f, co_benefits: toggleArray(f.co_benefits, cb) }))}
                className={`px-2.5 py-1 rounded-full text-xs border transition ${form.co_benefits.includes(cb) ? "bg-deep-forest text-white border-deep-forest" : "bg-white text-slate-600 border-slate-200"}`}>
                {cb}
              </button>
            ))}
          </div>
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