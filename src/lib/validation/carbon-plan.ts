import { z } from "zod";

const trimToUndefined = (value: unknown) => {
  if (value === null || value === undefined) {
    return undefined;
  }

  const normalized = String(value).trim();
  return normalized.length > 0 ? normalized : undefined;
};

const requiredString = (field: string, max = 500) =>
  z.preprocess(
    trimToUndefined,
    z.string().min(1, `${field} is required`).max(max),
  );

const optionalString = (max = 5000) =>
  z.preprocess(trimToUndefined, z.string().max(max).optional());

const requiredNonNegativeInt = (field: string) =>
  z.preprocess((value) => {
    const normalized = trimToUndefined(value);
    if (normalized === undefined) {
      return undefined;
    }

    const parsed = Number(normalized);
    return Number.isInteger(parsed) && parsed >= 0 ? parsed : value;
  }, z.number().int().nonnegative(`${field} must be a non-negative integer`));

const optionalNonNegativeInt = () =>
  z.preprocess((value) => {
    const normalized = trimToUndefined(value);
    if (normalized === undefined) {
      return undefined;
    }

    const parsed = Number(normalized);
    return Number.isInteger(parsed) && parsed >= 0 ? parsed : value;
  }, z.number().int().nonnegative().optional());

const optionalIsoDate = () =>
  z.preprocess((value) => {
    const normalized = trimToUndefined(value);
    if (normalized === undefined) {
      return undefined;
    }

    const parsed = new Date(normalized);
    return Number.isNaN(parsed.getTime()) ? value : parsed.toISOString();
  }, z.string().datetime().optional());

const booleanField = () =>
  z.preprocess((value) => {
    if (typeof value === "boolean") {
      return value;
    }

    const normalized = trimToUndefined(value);
    if (normalized === undefined) {
      return false;
    }

    const lower = normalized.toLowerCase();
    if (["true", "1", "yes", "sim"].includes(lower)) {
      return true;
    }
    if (["false", "0", "no", "nao", "não"].includes(lower)) {
      return false;
    }

    return value;
  }, z.boolean());

export const carbonProjectUploadSchema = z.object({
  data: z
    .array(
      z
        .object({
          category: optionalString(120),
          country: requiredString("country", 120),
          first_issuance_at: optionalIsoDate(),
          first_retirement_at: optionalIsoDate(),
          is_compliance: booleanField(),
          issued: optionalNonNegativeInt(),
          listed_at: optionalIsoDate(),
          name: requiredString("name", 500),
          project_id: requiredString("project_id", 120),
          project_type: optionalString(120),
          project_type_source: optionalString(120),
          project_url: optionalString(1000),
          proponent: optionalString(255),
          protocol: optionalString(120),
          registry: optionalString(120),
          retired: optionalNonNegativeInt(),
          status: optionalString(120),
        })
        .passthrough(),
    )
    .min(1, "At least one project is required")
    .max(2000, "Too many projects in a single request"),
});

export const carbonCreditUploadSchema = z.object({
  data: z
    .array(
      z
        .object({
          project_id: optionalString(120),
          quantity: requiredNonNegativeInt("quantity"),
          retirement_account: optionalString(255),
          retirement_beneficiary: optionalString(255),
          retirement_beneficiary_harmonized: optionalString(255),
          retirement_note: optionalString(4000),
          retirement_reason: optionalString(1000),
          transaction_date: optionalIsoDate(),
          transaction_type: optionalString(120),
          vintage: optionalNonNegativeInt(),
        })
        .passthrough(),
    )
    .min(1, "At least one credit row is required")
    .max(5000, "Too many credits in a single request"),
});
