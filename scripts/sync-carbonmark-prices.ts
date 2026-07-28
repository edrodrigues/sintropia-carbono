import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const CARBONMARK_API_BASE = "https://v19.api.carbonmark.com";
const CARBONMARK_API_KEY = process.env.CARBONMARK_API;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!CARBONMARK_API_KEY) {
  console.error("CARBONMARK_API not set in .env.local");
  process.exit(1);
}
if (!supabaseUrl || !supabaseServiceKey) {
  console.error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function carbonmarkFetch(path: string) {
  const res = await fetch(`${CARBONMARK_API_BASE}${path}`, {
    headers: { Authorization: `Bearer ${CARBONMARK_API_KEY}`, Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`Carbonmark API ${path}: ${res.status} ${res.statusText}`);
  return res.json();
}

interface CarbonmarkPrice {
  sourceId: string;
  type: "listing" | "klimaprotocol";
  purchasePrice: number;
  baseUnitPrice: number;
  supply: number;
  liquidSupply: number;
  minFillAmount: number;
  listing?: {
    creditId: { vintage: number; projectId: string };
    token: { name: string };
    sellerId: string;
  };
  klimaprotocol?: {
    creditId: { vintage: number; projectId: string; creditId: string };
    token: { name: string };
    carbonClass: { id: string };
  };
}

interface CarbonmarkProject {
  key: string;
  projectID: string;
  name: string;
  country: string;
  region: string;
  registry: string;
  methodologies: { id: string; category: string; name: string }[];
  price: string;
  hasSupply: boolean;
  stats: { totalBridged: number; totalRetired: number; totalSupply: number };
}

async function run() {
  console.log("Fetching prices from Carbonmark...");
  const prices: CarbonmarkPrice[] = await carbonmarkFetch("/prices");
  console.log(`Got ${prices.length} price entries`);

  const projectKeys = new Set<string>();
  for (const p of prices) {
    const pid = p.listing?.creditId.projectId ?? p.klimaprotocol?.creditId.projectId;
    if (pid) projectKeys.add(pid);
  }
  console.log(`Unique projects: ${projectKeys.size}`);

  // Fetch project details in batches
  const entries = Array.from(projectKeys);
  const projects: Map<string, CarbonmarkProject> = new Map();
  const batchSize = 5;
  for (let i = 0; i < entries.length; i += batchSize) {
    const batch = entries.slice(i, i + batchSize);
    const results = await Promise.allSettled(
      batch.map((key) => carbonmarkFetch(`/carbonProjects/${encodeURIComponent(key)}`))
    );
    for (let j = 0; j < results.length; j++) {
      const result = results[j];
      if (result.status === "fulfilled") {
        const proj = result.value as CarbonmarkProject;
        projects.set(proj.key, proj);
      } else {
        console.warn(`Failed to fetch project ${batch[j]}`);
      }
    }
    console.log(`Fetched ${Math.min(i + batchSize, entries.length)}/${entries.length} projects`);
  }

  // Upsert data source
  const { data: ds, error: dsErr } = await supabase
    .from("data_sources")
    .upsert({
      source_name: "Carbonmark",
      source_url: "https://carbonmark.com",
      data_type: "carbon",
      last_updated: new Date().toISOString(),
      refresh_frequency: "daily",
    }, { onConflict: "source_name" })
    .select("id")
    .single();

  if (dsErr) throw new Error(`Data source upsert failed: ${dsErr.message}`);
  const dataSourceId = ds.id;

  let assetCount = 0;
  let priceCount = 0;

  for (const [projectKey, proj] of projects) {
    const category = proj.methodologies?.[0]?.category ?? null;
    const methodology = proj.methodologies?.[0]?.id ?? null;

    // Upsert asset
    const { data: asset, error: assetErr } = await supabase
      .from("assets")
      .upsert({
        slug: projectKey,
        name: proj.name,
        asset_type: "carbon_credit",
        registry: proj.registry,
        country: proj.country,
        region: proj.region,
        project_category: category,
        methodology,
        description: proj.name,
        is_active: proj.hasSupply,
        provider: "carbonmark",
        external_id: projectKey,
        metadata: {
          projectID: proj.projectID,
          key: proj.key,
          stats: proj.stats,
          methodologies: proj.methodologies,
        },
      }, { onConflict: "slug", ignoreDuplicates: false })
      .select("id")
      .single();

    if (assetErr) {
      console.warn(`Asset upsert failed for ${projectKey}: ${assetErr.message}`);
      continue;
    }
    assetCount++;

    // Collect prices for this project
    const projectPrices = prices.filter(
      (p) => (p.listing?.creditId.projectId ?? p.klimaprotocol?.creditId.projectId) === projectKey
    );

    for (const pp of projectPrices) {
      const vintage = pp.listing?.creditId.vintage ?? pp.klimaprotocol?.creditId.vintage ?? null;
      const refType = pp.type === "listing" ? "carbonmark_listing" : "carbonmark_pool";
      const tokenName = pp.listing?.token?.name ?? pp.klimaprotocol?.token?.name ?? "";

      const { error: prErr } = await supabase
        .from("price_references")
        .upsert({
          asset_id: asset.id,
          price: pp.purchasePrice,
          price_display: `$${pp.purchasePrice.toFixed(2)}`,
          currency: "USD",
          unit: "tCO2e",
          vintage_year: vintage,
          volume: pp.supply,
          volume_unit: "tonnes",
          reference_date: new Date().toISOString(),
          reference_type: refType,
          data_source_id: dataSourceId,
          source_identifier: pp.sourceId,
          original_data: pp as any,
          fetched_at: new Date().toISOString(),
        }, { onConflict: "asset_id,source_identifier" });

      if (prErr) {
        console.warn(`Price insert failed for ${projectKey} v${vintage}: ${prErr.message}`);
      } else {
        priceCount++;
      }
    }
  }

  console.log(`Done. ${assetCount} assets upserted, ${priceCount} price references inserted.`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
