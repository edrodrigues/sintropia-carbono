"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useRef, useEffect, useState } from "react";
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
  const inputRef = useRef<HTMLInputElement>(null);

  const currentSearch = searchParams.get("search") || "";
  const [localSearch, setLocalSearch] = useState(currentSearch);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const currentType = searchParams.get("assetType") || "";
  const currentGeo = searchParams.get("geography") || "";
  const currentReg = searchParams.get("registry") || "";
  const currentTech = searchParams.get("technology") || "";
  const currentCur = searchParams.get("currency") || "";
  const currentRef = searchParams.get("referenceType") || "";

  useEffect(() => {
    setLocalSearch(currentSearch);
  }, [currentSearch]);

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

  const handleSearchChange = useCallback(
    (value: string) => {
      setLocalSearch(value);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        setSearch(value);
      }, 300);
    },
    [setSearch],
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

  const activeCount = activeFilters.length + (currentSearch ? 1 : 0);

  return (
    <div className="space-y-3">
      <div className="relative">
        <label htmlFor="market-search" className="sr-only">
          Buscar ativo, registro, país ou fonte
        </label>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
        <input
          ref={inputRef}
          id="market-search"
          type="search"
          value={localSearch}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Buscar ativo, registro, país ou fonte..."
          className="w-full h-11 pl-9 pr-4 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <SlidersHorizontal className="w-3.5 h-3.5 text-gray-400" aria-hidden="true" />
        <FilterDropdown
          label="Tipo de ativo"
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
          label="Tipo de referência"
          options={filterOptions.referenceTypes}
          value={currentRef}
          onChange={(v) => setParam("referenceType", v)}
        />
      </div>

      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center" role="list" aria-label="Active filters">
          {activeFilters.map((f) => (
            <span
              key={f.key}
              role="listitem"
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-blue-50 border border-blue-200 text-blue-700 rounded-full"
            >
              {f.label}
              <button
                onClick={() => removeFilter(f.key)}
                className="p-1 rounded-full hover:bg-blue-100 cursor-pointer min-w-[28px] min-h-[28px] flex items-center justify-center"
                aria-label={`Remover filtro: ${f.label}`}
              >
                <X className="w-3 h-3" aria-hidden="true" />
              </button>
            </span>
          ))}
          <button
            onClick={clearAll}
            className="text-xs font-medium text-blue-600 hover:underline ml-1 cursor-pointer min-h-[44px] px-2 py-1"
          >
            Limpar filtros
          </button>
        </div>
      )}

      {activeCount > 0 && (
        <p className="text-xs text-gray-500" aria-live="polite">
          {activeCount} filtro{activeCount > 1 ? "s" : ""} ativo{activeCount > 1 ? "s" : ""}
        </p>
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
    <div className="relative">
      <label htmlFor={`filter-${label}`} className="sr-only">
        {label}
      </label>
      <select
        id={`filter-${label}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={`${label}${value ? `: ${value}` : ""}`}
        className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium border rounded-lg cursor-pointer bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[40px] ${
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
    </div>
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
