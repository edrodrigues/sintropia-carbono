import { z } from "zod";

const assetTypeEnum = z.enum(["carbon_credit", "irec", "both"]);
const unitEnum = z.enum(["tCO2e", "MWh"]);
const ccpStatusEnum = z.enum(["ccp_eligible", "under_assessment", "not_applicable"]);
const cceeOrigemEnum = z.enum(["yes", "no", "pending"]);
const ccpRequirementEnum = z.enum(["required", "preferred", "irrelevant"]);
const responseFormatEnum = z.enum(["free", "template"]);

const nonEmptyNum = (msg: string) => z.number().positive(msg);

export const supplyListingSchema = z.object({
  asset_type: assetTypeEnum,
  registry: z.string().min(1, "Registry é obrigatório"),
  project_registry_id: z.string().min(1, "ID do projeto no registry é obrigatório"),
  project_name: z.string().min(1, "Nome do projeto é obrigatório").max(300),
  vintage: z.number().int().min(1990).max(2100),
  volume: nonEmptyNum("Volume é obrigatório"),
  unit: unitEnum,
  origin_country: z.string().min(1, "País de origem é obrigatório").max(100),
  delivery_term: z.string().min(1, "Prazo de entrega é obrigatório").max(100),

  price_amount: z.number().positive().optional().nullable(),
  price_currency: z.string().max(10).optional().default("USD"),
  price_on_request: z.boolean().optional().default(false),

  methodology: z.string().max(200).optional(),
  ccp_status: ccpStatusEnum.optional(),
  ratings: z.record(z.string(), z.unknown()).optional(),
  co_benefits: z.array(z.string()).max(20).optional(),
  ccee_origem: cceeOrigemEnum.optional(),
  min_transaction_size: z.number().positive().optional(),
  documentation: z.array(z.string()).max(20).optional(),
  media_urls: z.array(z.string().url()).max(10).optional(),
  contract_type: z.string().max(50).optional(),
  notes: z.string().max(500, "Notas: máximo de 500 caracteres").optional(),
}).refine(
  (d) => d.price_on_request === true || (typeof d.price_amount === "number" && d.price_amount > 0),
  { message: "Informe um preço ou marque 'Sob consulta'", path: ["price_amount"] },
);

export const demandListingSchema = z.object({
  asset_type: assetTypeEnum,
  registries: z.array(z.string()).max(10).default([]),
  volume_min: z.number().positive().optional(),
  volume_max: z.number().positive().optional(),
  volume: z.number().positive().optional(),
  unit: unitEnum,
  vintage_from: z.number().int().min(1990).max(2100).optional(),
  vintage_to: z.number().int().min(1990).max(2100).optional(),
  methodologies: z.array(z.string()).max(20).default([]),
  regions: z.array(z.string()).max(20).default([]),
  price_min: z.number().positive().optional(),
  price_max: z.number().positive().optional(),
  delivery_term: z.string().max(100).optional(),

  ccp_requirement: ccpRequirementEnum.optional(),
  certifications: z.array(z.string()).max(20).default([]),

  min_ratings: z.record(z.string(), z.unknown()).optional(),
  co_benefit_prefs: z.array(z.string()).max(20).default([]),
  needs_extra_dd: z.boolean().optional(),
  open_to_multi_year_offtake: z.boolean().optional(),
  offtake_until_year: z.number().int().min(2025).max(2100).optional(),

  proposal_deadline: z.string().datetime().optional(),
  response_format: responseFormatEnum.optional(),
  evaluation_criteria: z.record(z.string(), z.unknown()).optional(),
  prefer_deal_room: z.boolean().optional(),
  notes: z.string().max(500, "Notas: máximo de 500 caracteres").optional(),
}).refine(
  (d) => d.vintage_from === undefined || d.vintage_to === undefined || d.vintage_from <= d.vintage_to,
  { message: "Vintage inicial maior que a final", path: ["vintage_from"] },
).refine(
  (d) => d.price_min === undefined || d.price_max === undefined || d.price_min <= d.price_max,
  { message: "Preço mínimo maior que o máximo", path: ["price_min"] },
).refine(
  (d) => d.volume_min === undefined || d.volume_max === undefined || d.volume_min <= d.volume_max,
  { message: "Volume mínimo maior que o máximo", path: ["volume_min"] },
);

export const buyerProfileSchema = z.object({
  company_name: z.string().max(200).optional(),
  buyer_country: z.string().max(100).optional(),
  purchase_purpose: z.array(z.string()).max(10).default([]),
  bought_br_credits_before: z.boolean().optional(),
  annual_budget_range: z.string().max(50).optional(),
});

export type SupplyListingInput = z.infer<typeof supplyListingSchema>;
export type DemandListingInput = z.infer<typeof demandListingSchema>;
export type BuyerProfileInput = z.infer<typeof buyerProfileSchema>;

export type ListingSide = "supply" | "demand";
export type ListingAssetType = z.infer<typeof assetTypeEnum>;
export type ListingUnit = z.infer<typeof unitEnum>;

export function computeListingCompleteness(
  side: "supply" | "demand",
  data: Record<string, unknown>,
): number {
  let score = 0;
  if (side === "supply") {
    const required = ["asset_type", "registry", "project_registry_id", "project_name", "vintage", "volume", "unit", "origin_country", "delivery_term"];
    score += required.filter((k) => data[k] !== undefined && data[k] !== null && data[k] !== "").length * 8;
    const recommended = ["methodology", "ccp_status", "ratings", "co_benefits", "ccee_origem", "min_transaction_size", "documentation", "media_urls", "contract_type", "price_amount"];
    score += recommended.filter((k) => {
      const v = data[k];
      if (Array.isArray(v)) return v.length > 0;
      return v !== undefined && v !== null && v !== "";
    }).length * 2;
  } else {
    const required = ["asset_type", "unit"];
    score += required.filter((k) => data[k] !== undefined && data[k] !== null).length * 18;
    const recommended = ["registries", "volume_min", "volume_max", "vintage_from", "vintage_to", "methodologies", "regions", "price_min", "price_max", "ccp_requirement", "certifications", "co_benefit_prefs", "proposal_deadline", "response_format", "evaluation_criteria"];
    score += recommended.filter((k) => {
      const v = data[k];
      if (Array.isArray(v)) return v.length > 0;
      return v !== undefined && v !== null && v !== "";
    }).length * 4;
  }
  return Math.min(100, Math.round(score));
}