import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

const GRAPH_SUBGRAPH_ID = "AEJ5PEDye6Z198HRQBioG6mZ6ZacHenBg2HTopZPsUCi";
const GRAPH_GATEWAY = "https://gateway-arbitrum.network.thegraph.com/api";
const KLIMA_DISCOVER = "https://x402.klimalabs.com/api/discover";
const PAGE_SIZE = 1000;
const MAX_TOKEN_PAGES = 10;
const IN_CHUNK = 100;
const DEFAULT_LOOKBACK_DAYS = 30;

type Any = Record<string, any>;

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

async function resolveGraphKey(supabase: SupabaseClient): Promise<string> {
  const fromEnv = Deno.env.get("THE_GRAPH_API_KEY");
  if (fromEnv) return fromEnv;
  const { data, error } = await supabase.rpc("get_app_secret", {
    secret_name: "THE_GRAPH_API_KEY",
  });
  if (error || !data) {
    throw new Error(
      `THE_GRAPH_API_KEY not set (env or vault): ${error?.message ?? "empty"}`,
    );
  }
  return data as string;
}

async function graphFetch(
  endpoint: string,
  query: string,
  variables: Any,
): Promise<Any> {
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `Graph gateway ${res.status}${body ? ` ${body.slice(0, 200)}` : ""}`,
    );
  }
  const json = await res.json();
  if (json.errors?.length) {
    throw new Error(
      `Graph query error: ${JSON.stringify(json.errors).slice(0, 300)}`,
    );
  }
  return json.data;
}

function tonnes(wei: unknown): number {
  try {
    return wei == null ? 0 : Number(BigInt(String(wei))) / 1e18;
  } catch {
    return 0;
  }
}

function vintageYear(name: unknown): number | null {
  const m = typeof name === "string" ? name.match(/^(\d{4})/) : null;
  return m ? Number(m[1]) : null;
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

const RETIREMENTS_QUERY = `query ($first: Int!, $skip: Int!, $tsGte: BigInt!) {
  retirements(first: $first, skip: $skip, orderBy: timestamp, orderDirection: asc, where: { timestamp_gte: $tsGte }) {
    id creationTx amount timestamp eventId
    creator { id }
    token { address symbol name totalRetired
      projectVintage { name startTime endTime registry totalVintageQuantity
        project { projectId standard methodology region category emissionType method } } }
    certificate { id beneficiaryString retiringEntityString retirementMessage beneficiaryLocation consumptionCountryCode }
  }
}`;

const TOKENS_QUERY = `query ($first: Int!, $skip: Int!) {
  tco2Tokens(first: $first, skip: $skip, orderBy: createdAt, orderDirection: asc) {
    address symbol name totalRetired score
    projectVintage { name startTime endTime registry totalVintageQuantity
      project { projectId standard methodology region category emissionType method } }
  }
}`;

const POOLED_QUERY = `query ($first: Int!, $skip: Int!) {
  pooledTokens(first: $first, skip: $skip) {
    poolAddress amount tokenAddress
    tco2Token { symbol }
  }
}`;

function assetRowFromToken(t: Any, pooledAmount: number | undefined): Any {
  const pv = t.projectVintage ?? {};
  const proj = pv.project ?? {};
  const retired = tonnes(t.totalRetired);
  const issued = tonnes(pv.totalVintageQuantity);
  return {
    slug: t.symbol,
    external_id: t.address,
    name: t.name,
    asset_type: "carbon_credit",
    provider: "toucan",
    registry: proj.standard ?? pv.registry ?? null,
    country: proj.region ?? null,
    project_category: proj.category ?? null,
    methodology: proj.methodology ?? null,
    is_active: Math.max(issued - retired, 0) > 0,
    metadata: {
      network: "base",
      source: "toucan_subgraph",
      projectId: proj.projectId ?? null,
      standard: proj.standard ?? null,
      vintageName: pv.name ?? null,
      startTime: pv.startTime != null ? Number(pv.startTime) : null,
      endTime: pv.endTime != null ? Number(pv.endTime) : null,
      registryLabel: pv.registry ?? null,
      emissionType: proj.emissionType ?? null,
      method: proj.method ?? null,
      totalRetiredTonnes: retired,
      totalVintageQuantityTonnes: issued,
      pooledAmountTonnes: pooledAmount ?? null,
      toucanScore: t.score != null ? Number(t.score) : null,
    },
  };
}

serve(async (req: Request) => {
  try {
    const params = new URL(req.url).searchParams;
    const fullCatalog = params.get("full") === "1";
    const lookbackDays = Number(params.get("days")) || DEFAULT_LOOKBACK_DAYS;

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
    const apiKey = await resolveGraphKey(supabase);
    const graphEndpoint =
      `${GRAPH_GATEWAY}/${apiKey}/subgraphs/id/${GRAPH_SUBGRAPH_ID}`;

    const dataSourceIds: Record<string, string> = {};
    for (const ds of [
      { key: "toucan", source_name: "Toucan Protocol", source_url: "https://toucan.earth" },
      { key: "klima", source_name: "KlimaDAO", source_url: "https://www.klimadao.finance" },
    ]) {
      const { data, error } = await supabase
        .from("data_sources")
        .upsert(
          {
            source_name: ds.source_name,
            source_url: ds.source_url,
            data_type: "carbon",
            last_updated: new Date().toISOString(),
            refresh_frequency: "daily",
          },
          { onConflict: "source_name" },
        )
        .select("id")
        .single();
      if (error) throw new Error(`Data source ${ds.source_name}: ${error.message}`);
      dataSourceIds[ds.key] = data.id;
    }

    const { data: cursorRow } = await supabase
      .from("onchain_retirements")
      .select("retired_at")
      .eq("provider", "toucan")
      .order("retired_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const tsGte = cursorRow?.retired_at
      ? Math.floor(new Date(cursorRow.retired_at).getTime() / 1000)
      : Math.floor(Date.now() / 1000) - lookbackDays * 86400;

    const pooledBySymbol = new Map<string, number>();
    for (let page = 0; page < 5; page++) {
      const data = await graphFetch(graphEndpoint, POOLED_QUERY, {
        first: PAGE_SIZE,
        skip: page * PAGE_SIZE,
      });
      const rows: Any[] = data.pooledTokens ?? [];
      for (const r of rows) {
        const symbol = r.tco2Token?.symbol;
        if (symbol) {
          pooledBySymbol.set(
            symbol,
            (pooledBySymbol.get(symbol) ?? 0) + tonnes(r.amount),
          );
        }
      }
      if (rows.length < PAGE_SIZE) break;
    }

    let assetCount = 0;
    let assetErrors = 0;

    async function upsertTokenAsset(t: Any): Promise<string | null> {
      try {
        const { data, error } = await supabase
          .from("assets")
          .upsert(assetRowFromToken(t, pooledBySymbol.get(t.symbol)), {
            onConflict: "slug",
          })
          .select("id")
          .single();
        if (error) throw error;
        assetCount++;
        return data.id as string;
      } catch (e) {
        assetErrors++;
        console.warn(`Asset ${t?.symbol}: ${(e as Error).message}`);
        return null;
      }
    }

    let retirementCount = 0;
    let creditCount = 0;
    let creditErrors = 0;

    for (let page = 0; ; page++) {
      const data = await graphFetch(graphEndpoint, RETIREMENTS_QUERY, {
        first: PAGE_SIZE,
        skip: page * PAGE_SIZE,
        tsGte,
      });
      const retirements: Any[] = data.retirements ?? [];
      if (!retirements.length) break;

      for (const r of retirements) {
        if (r.token?.address) await upsertTokenAsset(r.token);
      }

      const projectIds = [
        ...new Set(
          retirements
            .map((r) => r.token?.projectVintage?.project?.projectId)
            .filter(Boolean),
        ),
      ] as string[];
      const existingProjects = new Set<string>();
      for (const ids of chunk(projectIds, IN_CHUNK)) {
        const { data: found } = await supabase
          .from("carbon_projects")
          .select("project_id")
          .in("project_id", ids);
        for (const row of found ?? []) existingProjects.add(row.project_id);
      }

      for (const r of retirements) {
        try {
          const token = r.token ?? {};
          const pv = token.projectVintage ?? {};
          const proj = pv.project ?? {};
          const cert = r.certificate ?? {};
          const quantity = tonnes(r.amount);
          const retiredAt = new Date(Number(r.timestamp) * 1000).toISOString();
          const vintage = vintageYear(pv.name);

          const { error: onErr } = await supabase
            .from("onchain_retirements")
            .upsert(
              {
                provider: "toucan",
                chain: "base",
                subgraph_id: r.id,
                tx_hash: r.creationTx ?? null,
                event_id: r.eventId != null ? String(r.eventId) : null,
                token_address: token.address ?? null,
                token_symbol: token.symbol ?? null,
                registry: proj.standard ?? pv.registry ?? null,
                methodology: proj.methodology ?? null,
                country: proj.region ?? null,
                project_id: proj.projectId ?? null,
                vintage,
                quantity,
                retiring_address: r.creator?.id ?? null,
                beneficiary: cert.beneficiaryString ?? null,
                retiring_entity: cert.retiringEntityString ?? null,
                message: cert.retirementMessage ?? null,
                certificate_id: cert.id != null ? String(cert.id) : null,
                retired_at: retiredAt,
                original_data: r,
              },
              { onConflict: "provider,subgraph_id" },
            );
          if (onErr) throw onErr;
          retirementCount++;

          const { error: ccErr } = await supabase
            .from("carbon_credits")
            .upsert(
              {
                project_id:
                  proj.projectId && existingProjects.has(proj.projectId)
                    ? proj.projectId
                    : null,
                // carbon_credits.quantity is INTEGER (legacy schema); the
                // full-precision fractional tonnage is preserved in
                // onchain_retirements.quantity (NUMERIC) above.
                quantity: Math.round(quantity),
                retirement_account: r.creator?.id ?? null,
                retirement_beneficiary: cert.beneficiaryString ?? null,
                retirement_note: cert.retirementMessage ?? null,
                transaction_date: retiredAt,
                transaction_type: "retirement",
                vintage,
                source: "toucan",
                chain_tx_hash: `${r.creationTx}:${r.eventId}`,
              },
              { onConflict: "source,chain_tx_hash" },
            );
          if (ccErr) throw ccErr;
          creditCount++;
        } catch (e) {
          creditErrors++;
          console.warn(`Retirement ${r?.id}: ${(e as Error).message}`);
        }
      }

      if (retirements.length < PAGE_SIZE) break;
    }

    if (fullCatalog) {
      for (let page = 0; page < MAX_TOKEN_PAGES; page++) {
        const data = await graphFetch(graphEndpoint, TOKENS_QUERY, {
          first: PAGE_SIZE,
          skip: page * PAGE_SIZE,
        });
        const tokens: Any[] = data.tco2Tokens ?? [];
        for (const t of tokens) await upsertTokenAsset(t);
        if (tokens.length < PAGE_SIZE) break;
      }
    }

    let klimaClassCount = 0;
    let klimaPriceCount = 0;
    let klimaTokenPriceCount = 0;
    let klimaErrors = 0;

    try {
      const res = await fetch(KLIMA_DISCOVER, {
        headers: { Accept: "application/json" },
      });
      if (!res.ok) throw new Error(`Klima discover ${res.status}`);
      const discover = await res.json();
      const classes: Any[] = discover.carbonClasses ?? [];

      const creditAddresses = new Set<string>();
      for (const cls of classes) {
        for (const c of cls.creditsDetailed ?? []) {
          if (c.tokenAddress) creditAddresses.add(c.tokenAddress.toLowerCase());
        }
      }

      const assetIdByAddress = new Map<string, string>();
      for (const ids of chunk([...creditAddresses], IN_CHUNK)) {
        const { data: found } = await supabase
          .from("assets")
          .select("id, external_id")
          .in("external_id", ids);
        for (const row of found ?? []) {
          if (row.external_id) {
            assetIdByAddress.set(row.external_id.toLowerCase(), row.id);
          }
        }
      }

      const today = new Date().toISOString().slice(0, 10);
      const now = () => new Date().toISOString();

      for (const cls of classes) {
        try {
          const price =
            cls.priceUsdcPerTonneFormatted != null
              ? Number(cls.priceUsdcPerTonneFormatted)
              : NaN;
          if (isNaN(price)) continue;
          const credits: Any[] = cls.creditsDetailed ?? [];
          const liquidity = credits.reduce(
            (sum, c) => sum + Number(c.liquidityFormatted ?? 0),
            0,
          );

          const { data: asset, error: aErr } = await supabase
            .from("assets")
            .upsert(
              {
                slug: `klima-${cls.carbonClassId.toLowerCase()}`,
                external_id: cls.carbonClassId,
                name: `${cls.name} (Klima Class)`,
                asset_type: "carbon_credit",
                provider: "klima",
                registry: credits[0]?.registry ?? null,
                country: cls.country ?? null,
                region: cls.region ?? null,
                project_category: cls.category ?? null,
                methodology: cls.methodologies?.[0] ?? null,
                is_active: liquidity > 0,
                metadata: {
                  network: "base",
                  source: "klima_discover",
                  carbonClassId: cls.carbonClassId,
                  minRetirementTonnes: cls.minRetirementTonnesFormatted ?? null,
                },
              },
              { onConflict: "slug" },
            )
            .select("id")
            .single();
          if (aErr) throw aErr;
          klimaClassCount++;

          const { error: pErr } = await supabase
            .from("price_references")
            .upsert(
              {
                asset_id: asset.id,
                price,
                price_display: `$${price.toFixed(2)}`,
                currency: "USD",
                unit: "tCO2e",
                volume: liquidity,
                volume_unit: "tonnes",
                reference_date: today,
                reference_type: "klima_pool",
                data_source_id: dataSourceIds.klima,
                source_identifier: cls.carbonClassId,
                original_data: cls,
                fetched_at: now(),
              },
              { onConflict: "asset_id,source_identifier" },
            );
          if (pErr) throw pErr;
          klimaPriceCount++;

          for (const c of credits) {
            const assetId = c.tokenAddress
              ? assetIdByAddress.get(c.tokenAddress.toLowerCase())
              : null;
            if (!assetId) continue;
            const vintage =
              typeof c.vintage === "number" && c.vintage < 10000
                ? c.vintage
                : null;
            const { error: tpErr } = await supabase
              .from("price_references")
              .upsert(
                {
                  asset_id: assetId,
                  price,
                  price_display: `$${price.toFixed(2)}`,
                  currency: "USD",
                  unit: "tCO2e",
                  vintage_year: vintage,
                  volume: Number(c.liquidityFormatted ?? 0),
                  volume_unit: "tonnes",
                  reference_date: today,
                  reference_type: "klima_pool",
                  data_source_id: dataSourceIds.klima,
                  source_identifier: `klima:${cls.carbonClassId}:${c.tokenAddress}`,
                  original_data: c,
                  fetched_at: now(),
                },
                { onConflict: "asset_id,source_identifier" },
              );
            if (tpErr) throw tpErr;
            klimaTokenPriceCount++;
          }
        } catch (e) {
          klimaErrors++;
          console.warn(`Klima class ${cls?.name}: ${(e as Error).message}`);
        }
      }
    } catch (e) {
      console.warn(`Klima discover skipped: ${(e as Error).message}`);
    }

    const result = {
      ok: true,
      cursorTsGte: tsGte,
      assetCount,
      assetErrors,
      retirementCount,
      creditCount,
      creditErrors,
      klimaClassCount,
      klimaPriceCount,
      klimaTokenPriceCount,
      klimaErrors,
    };
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
