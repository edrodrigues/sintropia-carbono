export const ASSET_TYPE_OPTIONS = [
  { value: "carbon_credit", label: { pt: "Crédito de carbono", en: "Carbon credit", es: "Crédito de carbono" } },
  { value: "irec", label: { pt: "I-REC", en: "I-REC", es: "I-REC" } },
  { value: "both", label: { pt: "Ambos", en: "Both", es: "Ambos" } },
] as const;

export const UNIT_OPTIONS = [
  { value: "tCO2e", label: "tCO2e" },
  { value: "MWh", label: "MWh" },
] as const;

export const REGISTRY_OPTIONS = [
  "Verra VCS",
  "Gold Standard",
  "I-REC",
  "CCEE Origem",
  "RenovaBio",
  "ACR",
  "CAR",
  "Verra",
] as const;

export const METHODOLOGY_OPTIONS = [
  "REDD+",
  "Afforestation/Reforestation (ARR)",
  "Solar",
  "Hydro",
  "Wind",
  "Improved Cookstoves",
  "Methane capture",
  "Energy efficiency",
] as const;

export const CCP_STATUS_OPTIONS = [
  { value: "ccp_eligible", label: { pt: "CCP-eligible", en: "CCP-eligible", es: "CCP-eligible" } },
  { value: "under_assessment", label: { pt: "Under assessment", en: "Under assessment", es: "Under assessment" } },
  { value: "not_applicable", label: { pt: "Not applicable", en: "Not applicable", es: "Not applicable" } },
] as const;

export const CCEE_ORIGEM_OPTIONS = [
  { value: "yes", label: { pt: "Sim", en: "Yes", es: "Sí" } },
  { value: "no", label: { pt: "Não", en: "No", es: "No" } },
  { value: "pending", label: { pt: "Pendente", en: "Pending", es: "Pendiente" } },
] as const;

export const CCP_REQUIREMENT_OPTIONS = [
  { value: "required", label: { pt: "Obrigatório", en: "Required", es: "Obligatorio" } },
  { value: "preferred", label: { pt: "Preferido", en: "Preferred", es: "Preferido" } },
  { value: "irrelevant", label: { pt: "Irrelevante", en: "Irrelevant", es: "Irrelevante" } },
] as const;

export const RESPONSE_FORMAT_OPTIONS = [
  { value: "free", label: { pt: "Livre", en: "Free", es: "Libre" } },
  { value: "template", label: { pt: "Template padronizado", en: "Standardized template", es: "Plantilla estandarizada" } },
] as const;

export const COUNTRY_OPTIONS = [
  "Brazil", "Argentina", "Chile", "Colombia", "Peru", "Mexico", "Uruguay",
  "United States", "Canada", "Germany", "Spain", "Portugal", "United Kingdom",
  "India", "China", "Indonesia", "Other",
] as const;

export const CO_BENEFIT_OPTIONS = [
  "SDG 13", "SDG 15", "SDG 8", "SDG 7", "SDG 5",
  "Biodiversity", "Community", "Gender equity", "CCB Gold",
] as const;

export const DOCUMENTATION_OPTIONS = [
  "PDD",
  "Validation report",
  "Verification report",
  "Community consent",
  "Land tenure docs",
  "Monitoring report",
] as const;

export const RATING_GRADES = ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-"] as const;

export const RATING_AGENCIES = ["sylvera", "bezero", "renoster"] as const;

export const CONTRACT_TYPE_OPTIONS = [
  "Spot", "Forward", "Offtake",
] as const;

export const DELIVERY_TERM_OPTIONS = [
  "Spot", "Forward Q1 2027", "Forward Q2 2027", "Forward Q3 2027", "Forward Q4 2027",
  "Q4 2026", "Q1 2026",
] as const;

export const EVALUATION_CRITERIA_OPTIONS = [
  { value: "quality", label: { pt: "Qualidade / ratings", en: "Quality / ratings", es: "Calidad / ratings" } },
  { value: "price", label: { pt: "Preço", en: "Price", es: "Precio" } },
  { value: "co_benefits", label: { pt: "Co-benefícios", en: "Co-benefits", es: "Cobeneficios" } },
  { value: "track_record", label: { pt: "Histórico / experiência", en: "Track record / experience", es: "Historial / experiencia" } },
] as const;

export const PURCHASE_PURPOSE_OPTIONS = [
  { value: "scope2", label: { pt: "Scope 2 compliance", en: "Scope 2 compliance", es: "Cumplimiento Scope 2" } },
  { value: "voluntary", label: { pt: "Compensação voluntária", en: "Voluntary offset", es: "Compensación voluntaria" } },
  { value: "portfolio", label: { pt: "Portfólio", en: "Portfolio", es: "Portafolio" } },
  { value: "resale", label: { pt: "Revenda", en: "Resale", es: "Reventa" } },
] as const;

export const ANNUAL_BUDGET_OPTIONS = [
  "0_100k", "100k_500k", "500k_2m", "2m_10m", "10m_plus",
] as const;