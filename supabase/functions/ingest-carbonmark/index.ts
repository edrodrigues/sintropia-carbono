import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

const CARBONMARK_API_BASE = "https://v19.api.carbonmark.com";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

async function resolveCarbonmarkKey(supabase: SupabaseClient): Promise<string> {
  const fromEnv = Deno.env.get("CARBONMARK_API");
  if (fromEnv) return fromEnv;

  const { data, error } = await supabase.rpc("get_app_secret", {
    secret_name: "CARBONMARK_API",
  });
  if (error || !data) {
    throw new Error(
      `CARBONMARK_API not set (env or vault): ${error?.message ?? "empty"}`,
    );
  }
  return data as string;
}

async function carbonmarkFetch(path: string, apiKey: string) {
  const res = await fetch(`${CARBONMARK_API_BASE}${path}`, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: "application/json",
    },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `Carbonmark API ${path}: ${res.status}${body ? ` ${body.slice(0, 200)}` : ""}`,
    );
  }
  return res.json();
}

serve(async (_req) => {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const apiKey = await resolveCarbonmarkKey(supabase);

    const prices: any[] = await carbonmarkFetch("/prices", apiKey);
    console.log(`Got ${prices.length} price entries`);

    const projectKeys = new Set<string>();
    for (const p of prices) {
      const pid =
        p.listing?.creditId?.projectId ??
        p.klimaprotocol?.creditId?.projectId;
      if (pid) projectKeys.add(pid);
    }
    console.log(`Unique projects: ${projectKeys.size}`);

    const { data: ds, error: dsErr } = await supabase
      .from("data_sources")
      .upsert(
        {
          source_name: "Carbonmark",
          source_url: "https://carbonmark.com",
          data_type: "carbon",
          last_updated: new Date().toISOString(),
          refresh_frequency: "daily",
        },
        { onConflict: "source_name" },
      )
      .select("id")
      .single();

    if (dsErr) throw new Error(`Data source: ${dsErr.message}`);
    const dataSourceId = ds.id;

    let assetCount = 0;
    let priceCount = 0;
    let assetErrors = 0;
    let priceErrors = 0;

    const entries = Array.from(projectKeys);
    for (let i = 0; i < entries.length; i += 5) {
      const batch = entries.slice(i, i + 5);
      const results = await Promise.allSettled(
        batch.map((key) =>
          carbonmarkFetch(`/carbonProjects/${encodeURIComponent(key)}`, apiKey)
        ),
      );

      for (let j = 0; j < results.length; j++) {
        if (results[j].status !== "fulfilled") {
          console.warn(`Failed to fetch ${batch[j]}:`, (results[j] as PromiseRejectedResult).reason);
          assetErrors++;
          continue;
        }
        const proj = (results[j] as PromiseFulfilledResult<any>).value;

        const category = proj.methodologies?.[0]?.category ?? null;
        const methodology = proj.methodologies?.[0]?.id ?? null;

        const { data: asset, error: aErr } = await supabase
          .from("assets")
          .upsert(
            {
              slug: proj.key,
              name: proj.name,
              asset_type: "carbon_credit",
              registry: proj.registry,
              country: proj.country,
              region: proj.region,
              project_category: category,
              methodology,
              is_active: proj.hasSupply,
              provider: "carbonmark",
              external_id: proj.key,
              metadata: {
                projectID: proj.projectID,
                key: proj.key,
                stats: proj.stats,
                methodologies: proj.methodologies,
              },
            },
            { onConflict: "slug" },
          )
          .select("id")
          .single();

        if (aErr) {
          console.warn(`Asset ${proj.key}: ${aErr.message}`);
          assetErrors++;
          continue;
        }
        assetCount++;

        const projectPrices = prices.filter(
          (p: any) =>
            (p.listing?.creditId?.projectId ??
              p.klimaprotocol?.creditId?.projectId) === proj.key,
        );

        for (const pp of projectPrices) {
          if (pp.purchasePrice == null) continue;
          const vintage =
            pp.listing?.creditId?.vintage ??
            pp.klimaprotocol?.creditId?.vintage ??
            null;
          const refType =
            pp.type === "listing" ? "carbonmark_listing" : "carbonmark_pool";
          const price = Number(pp.purchasePrice);
          const { error: prErr } = await supabase.from("price_references").upsert(
            {
              asset_id: asset.id,
              price,
              price_display: `$${price.toFixed(2)}`,
              currency: "USD",
              unit: "tCO2e",
              vintage_year: vintage ? Number(vintage) : null,
              volume: pp.supply ?? null,
              volume_unit: "tonnes",
              reference_date: new Date().toISOString().slice(0, 10),
              reference_type: refType,
              data_source_id: dataSourceId,
              source_identifier: pp.sourceId,
              original_data: pp,
              fetched_at: new Date().toISOString(),
            },
            { onConflict: "asset_id,source_identifier" },
          );
          if (prErr) {
            console.warn(`Price ${pp.sourceId}: ${prErr.message}`);
            priceErrors++;
          } else {
            priceCount++;
          }
        }
      }
    }

    const result = { ok: true, assetCount, priceCount, assetErrors, priceErrors };
    console.log(JSON.stringify(result));
    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(message);
    return new Response(JSON.stringify({ ok: false, error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
