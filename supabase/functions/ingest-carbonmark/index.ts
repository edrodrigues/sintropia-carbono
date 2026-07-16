import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CARBONMARK_API_BASE = "https://v19.api.carbonmark.com";
// Try env first (supabase secrets set), fall back to vault
const CARBONMARK_API_KEY =
  Deno.env.get("CARBONMARK_API") ??
  (() => { throw new Error("CARBONMARK_API not set as Supabase secret"); })();
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

async function carbonmarkFetch(path: string) {
  const res = await fetch(`${CARBONMARK_API_BASE}${path}`, {
    headers: { Authorization: `Bearer ${CARBONMARK_API_KEY}`, Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`Carbonmark API ${path}: ${res.status}`);
  return res.json();
}

serve(async (_req) => {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const prices: any[] = await carbonmarkFetch("/prices");
    console.log(`Got ${prices.length} price entries`);

    const projectKeys = new Set<string>();
    for (const p of prices) {
      const pid = p.listing?.creditId?.projectId ?? p.klimaprotocol?.creditId?.projectId;
      if (pid) projectKeys.add(pid);
    }
    console.log(`Unique projects: ${projectKeys.size}`);

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

    if (dsErr) throw new Error(`Data source: ${dsErr.message}`);
    const dataSourceId = ds.id;

    let assetCount = 0;
    let priceCount = 0;

    const entries = Array.from(projectKeys);
    for (let i = 0; i < entries.length; i += 5) {
      const batch = entries.slice(i, i + 5);
      const results = await Promise.allSettled(
        batch.map((key) => carbonmarkFetch(`/carbonProjects/${encodeURIComponent(key)}`))
      );

      for (let j = 0; j < results.length; j++) {
        if (results[j].status !== "fulfilled") {
          console.warn(`Failed to fetch ${batch[j]}`);
          continue;
        }
        const proj = results[j].value;

        const category = proj.methodologies?.[0]?.category ?? null;
        const methodology = proj.methodologies?.[0]?.id ?? null;

        const { data: asset, error: aErr } = await supabase
          .from("assets")
          .upsert({
            slug: proj.key,
            name: proj.name,
            asset_type: "carbon_credit",
            registry: proj.registry,
            country: proj.country,
            region: proj.region,
            project_category: category,
            methodology,
            is_active: proj.hasSupply,
            metadata: {
              projectID: proj.projectID,
              key: proj.key,
              stats: proj.stats,
              methodologies: proj.methodologies,
            },
          }, { onConflict: "slug" })
          .select("id")
          .single();

        if (aErr) { console.warn(`Asset ${proj.key}: ${aErr.message}`); continue; }
        assetCount++;

        const projectPrices = prices.filter(
          (p: any) => (p.listing?.creditId?.projectId ?? p.klimaprotocol?.creditId?.projectId) === proj.key
        );

        for (const pp of projectPrices) {
          const vintage = pp.listing?.creditId?.vintage ?? pp.klimaprotocol?.creditId?.vintage ?? null;
          const refType = pp.type === "listing" ? "carbonmark_listing" : "carbonmark_pool";
          const { error: prErr } = await supabase.from("price_references").insert({
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
            original_data: pp,
            fetched_at: new Date().toISOString(),
          });
          if (!prErr) priceCount++;
        }
      }
    }

    return new Response(JSON.stringify({ assetCount, priceCount }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});
