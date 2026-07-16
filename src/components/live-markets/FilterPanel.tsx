"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { Search, X, SlidersHorizontal } from "lucide-react";

interface FilterOption {
  label: string;
  value: string;
}

interface FilterPanelProps {
  filterOptions: {
    assetTypes: FilterOption[];
    geographies: FilterOption[];
    registries: FilterOption[];
    technologies: FilterOption[];
    currencies: FilterOption[];
    referenceTypes: FilterOption[];
  };
}

export function FilterPanel({ filterOptions }: FilterPanelProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentSearch = searchParams.get("search") || "";
  const currentType = searchParams.get("assetType") || "";
  const currentGeo = searchParams.get("geography") || "";
  const currentReg = searchParams.get("registry") || "";
  const currentTech = searchParams.get("technology") || "";
  const currentCur = searchParams.get("currency") || "";
  const currentRef = searchParams.get("referenceType") || "";

  const activeFilters: { key: string; label: string; value: string }[] = [];
  if (currentType) activeFilters.push({ key: "assetType", label: typeLabel(currentType), value: currentType });
  if (currentGeo) activeFilters.push({ key: "geography", label: currentGeo, value: currentGeo });
  if (currentReg) activeFilters.push({ key: "registry", label: currentReg, value: currentReg });
  if (currentTech) activeFilters.push({ key: "technology", label: currentTech, value: currentTech });
  if (currentCur) activeFilters.push({ key: "currency", label: currentCur, value: currentCur });
  if (currentRef) activeFilters.push({ key: "referenceType", label: referenceLabel(currentRef), value: currentRef });

  const setParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  const setSearch = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set("search", value);
      } else {
        params.delete("search");
      }
      router.push(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  const clearAll = useCallback(() => {
    const params = new URLSearchParams();
    params.set("tab", searchParams.get("tab") || "explorer");
    router.push(`?${params.toString()}`, { scroll: false });
  }, [router, searchParams]);

  const removeFilter = useCallback(
    (key: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete(key);
      router.push(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={currentSearch}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar ativo, registro, país ou fonte..."
          className="w-full h-10 pl-9 pr-4 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <SlidersHorizontal className="w-3.5 h-3.5 text-gray-400" />
        <FilterDropdown
          label="Tipo"
          options={filterOptions.assetTypes}
          value={currentType}
          onChange={(v) => setParam("assetType", v)}
        />
        <FilterDropdown
          label="Geografia"
          options={filterOptions.geographies}
          value={currentGeo}
          onChange={(v) => setParam("geography", v)}
        />
        <FilterDropdown
          label="Registro"
          options={filterOptions.registries}
          value={currentReg}
          onChange={(v) => setParam("registry", v)}
        />
        <FilterDropdown
          label="Tecnologia"
          options={filterOptions.technologies}
          value={currentTech}
          onChange={(v) => setParam("technology", v)}
        />
        <FilterDropdown
          label="Moeda"
          options={filterOptions.currencies}
          value={currentCur}
          onChange={(v) => setParam("currency", v)}
        />
        <FilterDropdown
          label="Referência"
          options={filterOptions.referenceTypes}
          value={currentRef}
          onChange={(v) => setParam("referenceType", v)}
        />
      </div>

      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-1.5 items-center">
          {activeFilters.map((f) => (
            <span
              key={f.key}
              className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-blue-50 border border-blue-200 text-blue-700 rounded-full"
            >
              {f.label}
              <button
                onClick={() => removeFilter(f.key)}
                className="p-0.5 rounded-full hover:bg-blue-100"
                aria-label={`Remover filtro ${f.label}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          <button
            onClick={clearAll}
            className="text-xs font-medium text-blue-600 hover:underline ml-1"
          >
            Limpar filtros
          </button>
        </div>
      )}
    </div>
  );
}

function FilterDropdown({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: FilterOption[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium border rounded-lg cursor-pointer bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
        value
          ? "border-blue-300 bg-blue-50 text-blue-700"
          : "border-gray-300 text-gray-600 hover:border-gray-400"
      }`}
    >
      <option value="">{label}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

function typeLabel(type: string): string {
  const map: Record<string, string> = {
    carbon_credit: "Carbono",
    irec: "I-REC",
    go: "GO",
    cbio: "CBIO",
  };
  return map[type] || type;
}

function referenceLabel(type: string): string {
  const map: Record<string, string> = {
    trade: "Negócio realizado",
    bid: "Bid",
    ask: "Ask",
    closing: "Fechamento",
    indicative: "Indicativo",
    rfq: "Sob consulta",
    range: "Faixa",
  };
  return map[type] || type;
}
