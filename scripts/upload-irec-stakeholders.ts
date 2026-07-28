// scripts/upload-irec-stakeholders.ts
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import Papa from "papaparse";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// I-REC World data is now loaded from dados/irec-stakeholders-world.csv

interface StakeholderRow {
  "Ranking": string;
  "Empresa": string;
  "Setor": string;
  "Papel no Mercado": string;
  "Volume 2024 (I-RECs Est./Rep.)": string;
  "Volume 2025 (I-RECs Proj./Rep.)": string;
  "Delta (#)": string;
  "Delta (%)": string;
  "Volume 2026 (Year to date Est.)": string;
}

function parseNumber(value: string): number {
  if (!value) return 0;
  const sanitized = value.replace(/\./g, "").replace(",", ".").trim();
  return parseInt(sanitized, 10) || 0;
}

function parsePercent(value: string): number {
  if (!value) return 0;
  const sanitized = value.replace("%", "").replace(",", ".").trim();
  return parseFloat(sanitized) || 0;
}

async function uploadStakeholders() {
  const filePath = path.join(process.cwd(), "dados", "3. Mar-2026",
    "Stakeholders - Tokenização Créditos de Carbono Brasil - Pesquisa IA - Mar_26.csv");

  if (!fs.existsSync(filePath)) {
    console.error(`Error: File not found at ${filePath}`);
    process.exit(1);
  }

  const rawContent = fs.readFileSync(filePath, "utf-8");
  const lines = rawContent.split("\n");
  const csvContent = lines.slice(1).join("\n");

  const { data, errors } = Papa.parse<StakeholderRow>(csvContent, {
    header: true,
    skipEmptyLines: true,
    transformHeader: header => header.trim(),
  });

  if (errors.length > 0) {
    console.error("CSV Parse Errors:", errors);
    throw new Error("Failed to parse CSV");
  }

  // Deduplicate and map Brazil data
  const dedupMap = new Map();
  data
    .filter((row) => {
      const ranking = (row as any)["Ranking"] || (row as any)[""];
      return ranking && !isNaN(parseInt(ranking));
    })
    .forEach((row) => {
      const r = row as any;
      const ranking = parseInt(r["Ranking"] || r[""]);
      if (dedupMap.has(ranking)) return;

      const empresa = r["Empresa"];
      const setor = r["Setor"];
      const papel = r["Papel no Mercado"];
      const v2024 = parseNumber(r["Volume 2024 (I-RECs Est./Rep.)"]);
      const v2025 = parseNumber(r["Volume 2025 (I-RECs Proj./Rep.)"]);
      const v2026 = parseNumber(r["Volume 2026 (Year to date Est.)"]);
      const dNum = parseNumber(r["Delta (#)"]);
      const dPct = parsePercent(r["Delta (%)"]);

      dedupMap.set(ranking, {
        ranking,
        region: "brazil",
        empresa: empresa?.trim(),
        setor: setor?.trim(),
        papel_mercado: papel?.trim(),
        volume_2024: v2024,
        volume_2025: v2025,
        volume_2026: v2026,
        delta_num: dNum,
        delta_pct: dPct,
      });
    });

  const brazilValidData = Array.from(dedupMap.values());

  // Load world data from CSV
  const worldFilePath = path.join(process.cwd(), "dados", "irec-stakeholders-world.csv");
  const worldRawContent = fs.readFileSync(worldFilePath, "utf-8");
  const worldLines = worldRawContent.split("\n").slice(1); // skip header
  const worldData = worldLines.filter(line => line.trim()).map((line, index) => {
    const cols = line.split(",");
    const v2024 = parseInt(cols[4]) || 0;
    const v2025 = parseInt(cols[5]) || 0;
    return {
      ranking: index + 1,
      region: "world",
      empresa: cols[1]?.trim(),
      setor: cols[2]?.trim(),
      papel_mercado: cols[3]?.trim(),
      volume_2024: v2024,
      volume_2025: v2025,
      volume_2026: parseInt(cols[8]) || 0,
      delta_num: parseInt(cols[6]) || 0,
      delta_pct: parseFloat(cols[7]) || 0,
    };
  });

  const allStakeholders = [...brazilValidData, ...worldData];

  console.log(`Preparing to upload ${allStakeholders.length} total I-REC stakeholders (Brazil + World)...`);

  const { error } = await supabase
    .from("irec_stakeholders")
    .upsert(allStakeholders, { onConflict: "ranking,region" });

  if (error) {
    console.error("Upload Error:", error);
    throw error;
  }

  console.log("✅ Upload to irec_stakeholders completed successfully!");

  // Register data source
  await supabase.from("data_sources").upsert({
    source_name: "Stakeholders I-REC Brazil + World",
    source_url: "multiple",
    data_type: "irec",
    last_updated: new Date().toISOString(),
    refresh_frequency: "monthly",
  }, { onConflict: "source_name" });

  console.log("✅ Data source metadata updated successfully!");
}

uploadStakeholders()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
