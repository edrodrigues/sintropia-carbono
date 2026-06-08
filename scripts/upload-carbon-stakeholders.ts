// scripts/upload-carbon-stakeholders.ts
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

function parseCSV<T>(filename: string): T[] {
  const filePath = path.join(process.cwd(), "dados", filename);
  if (!fs.existsSync(filePath)) {
    console.error(`Error: File not found at ${filePath}`);
    process.exit(1);
  }
  const rawContent = fs.readFileSync(filePath, "utf-8");
  const { data, errors } = Papa.parse<T>(rawContent, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: true,
  });
  if (errors.length > 0) {
    console.error("CSV Parse Errors:", errors);
  }
  return data;
}

async function uploadCarbonStakeholders() {
  const brazilData = parseCSV<{ ranking: number; empresa: string; setor: string; volume_2024: number; volume_2025: number; delta_pct: number; region: string }>("carbon-stakeholders-brazil.csv");
  const worldData = parseCSV<{ ranking: number; empresa: string; setor: string; volume_2024: number; volume_2025: number; delta_pct: number; region: string }>("carbon-stakeholders-world.csv");

  const allData = [...brazilData, ...worldData];
  console.log(`Preparing to upload ${allData.length} carbon stakeholders...`);

  const { error } = await supabase
    .from("carbon_stakeholders")
    .upsert(allData, { onConflict: "ranking,region" });

  if (error) {
    console.error("Upload Error:", error);
    throw error;
  }

  console.log("✅ Upload to carbon_stakeholders completed successfully!");
}

uploadCarbonStakeholders()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
