import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "..", ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const CSV_PATH = path.join(__dirname, "..", "dados", "CarbonPlan", "credits.csv");

type CSVRow = Record<string, string>;

function parseCSV(content: string): CSVRow[] {
  const lines = content.trim().split("\n");
  const headers = lines[0].split(",").map(h => h.trim());

  const rows: CSVRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",");
    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = values[index]?.trim() || "";
    });
    rows.push(row);
  }
  return rows;
}

async function getExistingProjectIds() {
  const { data, error } = await supabase
    .from("carbon_projects")
    .select("project_id");

  if (error) {
    console.error("Error fetching project IDs:", error.message);
    return new Set<string>();
  }

  return new Set(data.map(p => p.project_id));
}

async function getCadTrustProjectMap() {
  const { data, error } = await supabase
    .from("cad_trust_projects")
    .select("id, project_id");

  if (error) {
    console.error("Error fetching CAD Trust project IDs:", error.message);
    return new Map<string, string>();
  }

  return new Map(data.map(p => [p.project_id, p.id]));
}

async function getOrCreateIssuance(projectId: string, cadTrustProjectId: string): Promise<string> {
  const { data: existing } = await supabase
    .from("cad_trust_issuances")
    .select("id")
    .eq("cad_trust_project_id", cadTrustProjectId)
    .limit(1)
    .single();

  if (existing) return existing.id;

  const { data: created, error } = await supabase
    .from("cad_trust_issuances")
    .insert({
      cad_trust_project_id: cadTrustProjectId,
      issuance_id: "AGG-" + projectId,
    })
    .select("id")
    .single();

  if (error) throw new Error(`Issuance create: ${error.message}`);
  return created.id;
}

async function insertCredits(credits: CSVRow[], projectIds: Set<string>, batchSize = 1000) {
  const validCredits = credits.filter(c => projectIds.has(c.project_id));
  console.log(`Filtering to ${validCredits.length} credits with valid project_ids`);

  const cadTrustMap = await getCadTrustProjectMap();
  console.log(`Found ${cadTrustMap.size} CAD Trust projects`);

  const issuanceCache = new Map<string, string>();

  const totalBatches = Math.ceil(validCredits.length / batchSize);

  for (let i = 0; i < validCredits.length; i += batchSize) {
    const batch = validCredits.slice(i, i + batchSize);
    const batchNum = Math.floor(i / batchSize) + 1;

    const records = batch.map((c) => {
      let transactionDate = null;
      if (c.transaction_date) {
        const dateStr = c.transaction_date.split(" ")[0];
        if (dateStr && dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
          transactionDate = dateStr;
        }
      }

      return {
        project_id: c.project_id,
        quantity: parseInt(c.quantity) || 0,
        vintage: parseInt(c.vintage) || null,
        transaction_date: transactionDate,
        transaction_type: c.transaction_type || null,
        retirement_account: c.retirement_account || null,
        retirement_beneficiary: c.retirement_beneficiary || null,
        retirement_beneficiary_harmonized: c.retirement_beneficiary_harmonized || null,
        retirement_note: c.retirement_note || null,
        retirement_reason: c.retirement_reason || null,
      };
    });

    const { error } = await supabase
      .from("carbon_credits")
      .insert(records);

    if (error) {
      console.error(`Batch ${batchNum}/${totalBatches} error:`, error.message);
    }
    else {
      console.log(`Batch ${batchNum}/${totalBatches} inserted successfully (${records.length} records)`);
    }

    for (const c of batch) {
      const cadTrustProjectId = cadTrustMap.get(c.project_id);
      if (!cadTrustProjectId) continue;

      if (!issuanceCache.has(c.project_id)) {
        try {
          const issuanceId = await getOrCreateIssuance(c.project_id, cadTrustProjectId);
          issuanceCache.set(c.project_id, issuanceId);
        } catch (e) {
          console.warn(`Failed to get issuance for ${c.project_id}: ${e}`);
          continue;
        }
      }

      const issuanceId = issuanceCache.get(c.project_id)!;
      let transactionDate = null;
      if (c.transaction_date) {
        const dateStr = c.transaction_date.split(" ")[0];
        if (dateStr && dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
          transactionDate = dateStr;
        }
      }

      const { error: unitErr } = await supabase.from("cad_trust_units").insert({
        cad_trust_issuance_id: issuanceId,
        org_uid: "carbonplan",
        unit_serial_id: "CC-" + Math.random().toString(36).slice(2),
        unit_start_block: "0",
        unit_end_block: "0",
        unit_count: parseInt(c.quantity) || 0,
        unit_type: "Reduction",
        unit_vintage_year: parseInt(c.vintage) || 0,
        unit_status: c.transaction_type === "retirement" ? "Retired" : "Issued",
        unit_retirement_detail: c.retirement_note || null,
        unit_retirement_beneficiary: c.retirement_beneficiary_harmonized || null,
      });

      if (unitErr) {
        console.warn(`Unit insert for ${c.project_id}: ${unitErr.message}`);
      }
    }
  }
}

async function main() {
  console.log("Reading CSV file...");
  const content = fs.readFileSync(CSV_PATH, "utf-8");

  console.log("Parsing CSV...");
  const credits = parseCSV(content);
  console.log(`Found ${credits.length} credit records`);

  console.log("Fetching existing project IDs...");
  const projectIds = await getExistingProjectIds();
  console.log(`Found ${projectIds.size} projects in database`);

  console.log("Inserting credits into database...");
  await insertCredits(credits, projectIds);

  console.log("Done!");

  const { count } = await supabase
    .from("carbon_credits")
    .select("*", { count: "exact", head: true });

  console.log(`Total credits in database: ${count}`);

  const { count: ctCount } = await supabase
    .from("cad_trust_units")
    .select("*", { count: "exact", head: true });

  console.log(`Total CAD Trust units in database: ${ctCount}`);
}

main().catch(console.error);
