import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

// Pulls project ratings AND core project identity from CAD Trust's public
// Observer Node API (https://observer.climateactiondata.org/api/v1/):
//   1. upserts ratings into cad_trust_ratings (rating_source='cadtrust'), as before.
//   2. upserts/refreshes core cad_trust_projects fields, keyed on CAD Trust's own
//      warehouseProjectId. This is the actual fix: cad_trust_projects was seeded
//      from a one-time CSV import whose project_id values are partially garbage
//      (free-text fragments, not real IDs) and, even where well-formed, barely
//      overlap with what our own `assets` reference. Live data is far more
//      complete and correctly formatted.
//   3. relinks any assets.cad_trust_project_id that's still unset, now that
//      cad_trust_projects.project_id is populated from live, correctly
//      formatted data instead of the broken seed.
//
// cad_trust_projects.project_id is a concatenation of a short registry code +
// the registry's own native project id (e.g. "VCS292" for Verra project 292)
// -- the convention the old CSV seed evidently intended but got wrong for
// most rows. Both Carbonmark- and Toucan-sourced `assets` rows encode the
// same "REGISTRY-NUMBER" shape, just via different fields per provider --
// see assetMatchKey() below, derived from inspecting real rows of each.
//
// There is no server-side filter for "projects matching our registry IDs" —
// columns/search/projectId filters are all rejected or too narrow, so this
// sweeps the whole public catalog (~16.5k projects, ~17 pages at the max
// limit=1000) daily. Pages are fetched with bounded concurrency and
// processed (then discarded) immediately to keep memory bounded.
const CADT_API_BASE = "https://observer.climateactiondata.org/api/v1";
const PAGE_SIZE = 1000;
const PAGE_CONCURRENCY = 5;
const WRITE_CONCURRENCY = 15;

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// CAD Trust's currentRegistry/registryOfOrigin strings -> the short codes our
// own project_id/assets.registry conventions already use. Confirmed live
// across the full 17-page catalog: CDM Registry, Verra and Gold Standard
// dominate (16.5k/9.5k/6.7k projects respectively); the rest are single
// digits. Extend as new, unmapped registries get logged below rather than
// guessing ahead of time.
const REGISTRY_CODE_MAP: Record<string, string> = {
  "verra": "VCS",
  "gold standard": "GLD",
  "cdm registry": "CDM",
  "cercarbono": "CERCARBONO",
  "global carbon council": "GCC",
  "carbon assets tracking system (cats)": "CATS",
  "tero carbon": "TERO",
  "asia carbon institute": "ACI",
  "switzerland national registry": "SWISS",
  "thailand carbon credit registry": "THAILAND",
  "royal kingdom of bhutan": "BHUTAN",
};

function registryCode(name?: string | null): string | null {
  if (!name) return null;
  return REGISTRY_CODE_MAP[name.trim().toLowerCase()] ?? null;
}

function normalizeKey(raw?: string | null): string | null {
  if (!raw) return null;
  const key = raw.toUpperCase().replace(/[^A-Z0-9]/g, "");
  return key || null;
}

// assets.registry values seen live that don't match our registry-code
// convention 1:1.
const ASSET_REGISTRY_ALIASES: Record<string, string> = {
  "gs": "GLD",
  "gold standard": "GLD",
  "verra (vcs)": "VCS",
};

const DASH_SHAPED = /^[A-Za-z]+-[0-9A-Za-z]+$/;

interface AssetRow {
  id: string;
  registry: string | null;
  external_id: string | null;
  metadata: Record<string, unknown> | null;
}

/** Both Carbonmark and Toucan encode a project's registry + native id, just
 * via different fields: Toucan's metadata.projectId is already
 * "REGISTRY-NUMBER" (e.g. "VCS-292"); Carbonmark's external_id is too (e.g.
 * "VCS-784"), while its metadata.projectID (note casing) is the bare number
 * alone, needing assets.registry prepended. Tries the already-prefixed forms
 * first, falls back to constructing one from registry + bare id. */
function assetMatchKey(a: AssetRow): string | null {
  if (DASH_SHAPED.test(a.external_id ?? "")) return normalizeKey(a.external_id);
  const metaProjectId = a.metadata?.projectId as string | undefined;
  if (DASH_SHAPED.test(metaProjectId ?? "")) return normalizeKey(metaProjectId);
  const bareId = (a.metadata?.projectID ?? a.metadata?.projectId) as string | undefined;
  if (bareId && a.registry) {
    const code = ASSET_REGISTRY_ALIASES[a.registry.trim().toLowerCase()] ?? a.registry;
    return normalizeKey(`${code}${bareId}`);
  }
  return null;
}

interface CadtProjectRating {
  ratingType?: string | null;
  rating?: string | null;
  ratingLink?: string | null;
  updatedAt?: string | null;
}

interface CadtProjectLocation {
  country?: string | null;
  inCountryRegion?: string | null;
  geographicIdentifier?: string | null;
}

interface CadtProject {
  warehouseProjectId?: string | null;
  orgUid?: string | null;
  projectId?: string | null;
  originProjectId?: string | null;
  currentRegistry?: string | null;
  registryOfOrigin?: string | null;
  program?: string | null;
  projectName?: string | null;
  description?: string | null;
  projectLink?: string | null;
  sector?: string | null;
  projectType?: string | null;
  projectStatus?: string | null;
  projectStatusDate?: string | null;
  unitMetric?: string | null;
  projectDeveloper?: string | null;
  methodology?: string | null;
  methodology2?: string | null;
  projectLocations?: CadtProjectLocation[] | null;
  projectRatings?: CadtProjectRating[] | null;
}

interface CadtProjectsPage {
  page: number;
  pageCount: number;
  data: CadtProject[];
}

async function fetchPage(page: number): Promise<CadtProjectsPage> {
  const url = `${CADT_API_BASE}/projects?page=${page}&limit=${PAGE_SIZE}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`CAD Trust /projects failed (page ${page}): ${res.status} ${res.statusText}`);
  }
  return await res.json();
}

interface ProjectRow {
  warehouse_project_id: string;
  org_uid: string;
  project_id: string;
  project_registry_name: string;
  project_name: string;
  project_crediting_program: string | null;
  project_description: string | null;
  project_link: string | null;
  project_sector: string | null;
  project_type: string | null;
  project_status: string;
  project_status_date: string | null;
  project_unit_metric: string;
  proponent: string | null;
  project_methodology: string | null;
  project_methodology_secondary: string | null;
  updated_at: string;
}

interface Stats {
  projectsUpserted: number;
  projectsReconciled: number;
  projectUpsertErrors: number;
  duplicateProjectIds: number;
  ratingsMatched: number;
  ratingsUpserted: number;
  ratingUpsertErrors: number;
  locationsUpserted: number;
  locationUpsertErrors: number;
  unmatchedRatedProjects: string[];
  unmappedRegistries: Set<string>;
  seenProjectIds: Set<string>;
}

/** CAD Trust allows the same real-world project to appear as multiple
 * distinct records (different warehouseProjectId, e.g. reported by
 * different orgs) sharing the same registry+native id -- confirmed live: a
 * single 1000-row page batch hit this enough to blow the function's CPU
 * budget via the per-row conflict fallback. project_id is our own natural
 * key and must stay globally unique, so once a project_id has been claimed
 * by an earlier record in this run, later records with the same computed
 * key are skipped entirely (not retried, not merged) -- ratings on a
 * skipped record just won't be matched against cad_trust_projects, same as
 * any other unmatched project. */
// CAD Trust uses "n.a." as a placeholder for unknown projectDeveloper/methodology
// values -- treat it the same as absent rather than storing the literal string.
const NA_VALUES = new Set(["n.a.", "n/a", "na"]);
function cleanText(value?: string | null): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed || NA_VALUES.has(trimmed.toLowerCase())) return null;
  return trimmed;
}

function toProjectRow(project: CadtProject, stats: Stats): ProjectRow | null {
  if (!project.warehouseProjectId) return null;

  const code = registryCode(project.currentRegistry) ?? registryCode(project.registryOfOrigin);
  const nativeId = project.projectId ?? project.originProjectId;
  if (!code) {
    stats.unmappedRegistries.add(project.currentRegistry ?? project.registryOfOrigin ?? "unknown");
  }
  const projectId = code && nativeId
    ? normalizeKey(`${code}${nativeId}`)!
    : `CADT-${project.warehouseProjectId}`;

  if (stats.seenProjectIds.has(projectId)) {
    stats.duplicateProjectIds++;
    return null;
  }
  stats.seenProjectIds.add(projectId);

  return {
    warehouse_project_id: project.warehouseProjectId,
    org_uid: project.orgUid ?? "unknown",
    project_id: projectId,
    project_registry_name: project.currentRegistry ?? project.registryOfOrigin ?? "Unknown",
    project_name: project.projectName ?? "Untitled",
    project_crediting_program: project.program ?? null,
    project_description: project.description ?? null,
    project_link: project.projectLink ?? null,
    project_sector: project.sector ?? null,
    project_type: project.projectType ?? null,
    project_status: project.projectStatus ?? "Listed",
    project_status_date: project.projectStatusDate ?? null,
    project_unit_metric: project.unitMetric ?? "tCO2e",
    proponent: cleanText(project.projectDeveloper),
    project_methodology: cleanText(project.methodology),
    project_methodology_secondary: cleanText(project.methodology2),
    updated_at: new Date().toISOString(),
  };
}

async function runWithConcurrency<T>(items: T[], limit: number, fn: (item: T) => Promise<void>) {
  let i = 0;
  async function worker() {
    while (i < items.length) {
      const item = items[i++];
      await fn(item);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
}

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

/** Reconcile the rare case where a project_id already exists on a
 * different row -- a legacy CSV-seeded row coincidentally holding this
 * exact project_id, or a row inserted by a prior run under a different
 * warehouse_project_id. Individual UPDATE, since this is expected to be a
 * handful of rows per page, not the whole batch. */
async function reconcileExistingRow(
  supabase: SupabaseClient,
  row: ProjectRow,
  existingId: string,
  stats: Stats,
): Promise<string | null> {
  const { error } = await supabase.from("cad_trust_projects").update(row).eq("id", existingId);
  if (error) {
    console.warn(`Reconcile failed for project_id ${row.project_id}: ${error.message}`);
    stats.projectUpsertErrors++;
    return null;
  }
  stats.projectsReconciled++;
  return existingId;
}

/** Upsert a page's worth of project rows. A single row whose project_id
 * already exists on a DIFFERENT row would fail a plain bulk
 * `upsert(..., {onConflict: "warehouse_project_id"})` entirely -- it's one
 * INSERT ... ON CONFLICT statement covering every row in the batch, and
 * project_id has its own separate UNIQUE constraint that onConflict doesn't
 * cover. Retrying the whole batch one row at a time to find that single
 * conflict is what actually exhausted the function's CPU budget in
 * practice (confirmed via logs) -- checking for existing rows up front
 * with one bulk SELECT instead keeps the slow, individual path bounded to
 * the small number of genuine conflicts, not the whole page. */
async function upsertProjectRows(
  supabase: SupabaseClient,
  rows: ProjectRow[],
  stats: Stats,
): Promise<Map<string, string>> {
  const idByWarehouseId = new Map<string, string>();
  if (rows.length === 0) return idByWarehouseId;

  // Chunked: CDM's native ids are long (~32 chars), so a single .in() over
  // a full 1000-row page builds a query string long enough to be rejected
  // outright ("error sending request" / 400 Bad Request, confirmed live) --
  // splitting keeps each request's URL comfortably short.
  const existingByProjectId = new Map<string, { id: string; project_id: string; warehouse_project_id: string | null }>();
  for (const idChunk of chunk(rows.map((r) => r.project_id), 200)) {
    const { data: existing, error: existingErr } = await supabase
      .from("cad_trust_projects")
      .select("id, project_id, warehouse_project_id")
      .in("project_id", idChunk);
    if (existingErr) {
      console.warn(`Existing-row pre-check failed for a chunk of ${idChunk.length}, proceeding without it: ${existingErr.message}`);
      continue;
    }
    for (const e of existing ?? []) existingByProjectId.set(e.project_id as string, e as any);
  }

  const freshRows: ProjectRow[] = [];
  const toReconcile: { row: ProjectRow; existingId: string }[] = [];
  for (const row of rows) {
    const match = existingByProjectId.get(row.project_id);
    if (match && match.warehouse_project_id !== row.warehouse_project_id) {
      toReconcile.push({ row, existingId: match.id as string });
    } else {
      freshRows.push(row);
    }
  }

  if (toReconcile.length > 0) {
    await runWithConcurrency(toReconcile, WRITE_CONCURRENCY, async ({ row, existingId }) => {
      const id = await reconcileExistingRow(supabase, row, existingId, stats);
      if (id) idByWarehouseId.set(row.warehouse_project_id, id);
    });
  }

  if (freshRows.length > 0) {
    const { data, error } = await supabase
      .from("cad_trust_projects")
      .upsert(freshRows, { onConflict: "warehouse_project_id" })
      .select("id, warehouse_project_id");
    if (!error) {
      stats.projectsUpserted += freshRows.length;
      for (const r of data ?? []) idByWarehouseId.set(r.warehouse_project_id as string, r.id as string);
    } else {
      // Unexpected at this point (the pre-check above should have caught
      // project_id collisions) -- log and move on rather than retrying
      // this whole batch one row at a time again.
      console.warn(`Bulk upsert still failed for ${freshRows.length} pre-checked rows: ${error.message}`);
      stats.projectUpsertErrors += freshRows.length;
    }
  }

  return idByWarehouseId;
}

async function upsertRatings(
  supabase: SupabaseClient,
  projects: CadtProject[],
  idByWarehouseId: Map<string, string>,
  stats: Stats,
) {
  for (const project of projects) {
    const ratings = project.projectRatings ?? [];
    if (ratings.length === 0) continue;

    const localId = project.warehouseProjectId ? idByWarehouseId.get(project.warehouseProjectId) : undefined;
    if (!localId) {
      stats.unmatchedRatedProjects.push(project.projectId ?? project.originProjectId ?? "unknown");
      continue;
    }
    stats.ratingsMatched++;

    for (const r of ratings) {
      if (!r.ratingType || !r.rating) continue;

      const { error } = await supabase
        .from("cad_trust_ratings")
        .upsert(
          {
            cad_trust_project_id: localId,
            rating_name: r.ratingType,
            rating_value: r.rating,
            rating_link: r.ratingLink ?? null,
            rating_source: "cadtrust",
            // CAD Trust doesn't expose a distinct "issued at" date on
            // projectRatings, only its own record-update timestamp — the
            // closest available proxy. rating_type/on_watch are left unset:
            // CAD Trust has no equivalent concept for either.
            rated_at: r.updatedAt ?? null,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "cad_trust_project_id,rating_name,rating_source" },
        );

      if (error) {
        stats.ratingUpsertErrors++;
        console.warn(`Rating upsert failed for warehouseProjectId ${project.warehouseProjectId} rating ${r.ratingType}: ${error.message}`);
        continue;
      }
      stats.ratingsUpserted++;
    }
  }
}

/** cad_trust_locations has no ongoing sync of its own -- it was only ever
 * populated by the one-time 2026-07-17 CSV seed, so every project the daily
 * sync has discovered since then has no location row at all. Upserts
 * (project_id, country) pairs straight from CAD Trust's own projectLocations,
 * so coverage grows with the live catalog instead of staying frozen. */
async function upsertLocations(
  supabase: SupabaseClient,
  projects: CadtProject[],
  idByWarehouseId: Map<string, string>,
  stats: Stats,
) {
  for (const project of projects) {
    const locations = project.projectLocations ?? [];
    if (locations.length === 0) continue;

    const localId = project.warehouseProjectId ? idByWarehouseId.get(project.warehouseProjectId) : undefined;
    if (!localId) continue;

    for (const loc of locations) {
      const country = cleanText(loc.country);
      if (!country) continue;

      const { error } = await supabase
        .from("cad_trust_locations")
        .upsert(
          {
            cad_trust_project_id: localId,
            country,
            in_country_region: cleanText(loc.inCountryRegion),
            geographic_identifier: cleanText(loc.geographicIdentifier),
            updated_at: new Date().toISOString(),
          },
          { onConflict: "cad_trust_project_id,country" },
        );

      if (error) {
        stats.locationUpsertErrors++;
        console.warn(`Location upsert failed for warehouseProjectId ${project.warehouseProjectId}: ${error.message}`);
        continue;
      }
      stats.locationsUpserted++;
    }
  }
}

async function processPage(data: CadtProject[], supabase: SupabaseClient, stats: Stats) {
  const rows = data.map((p) => toProjectRow(p, stats)).filter((r): r is ProjectRow => r !== null);
  const idByWarehouseId = await upsertProjectRows(supabase, rows, stats);
  await upsertRatings(supabase, data, idByWarehouseId, stats);
  await upsertLocations(supabase, data, idByWarehouseId, stats);
}

/** PostgREST caps an unpaginated select at 1000 rows by default. Page
 * through with .range() for tables that can exceed that (cad_trust_projects
 * is ~16.5k+ after this sync runs; assets is currently ~550 but paginated
 * defensively anyway). */
async function loadAllRows<T>(
  supabase: SupabaseClient,
  table: string,
  columns: string,
  filter?: (query: any) => any,
): Promise<T[]> {
  const all: T[] = [];
  const pageSize = 1000;
  let offset = 0;
  while (true) {
    let query = supabase.from(table).select(columns).range(offset, offset + pageSize - 1);
    if (filter) query = filter(query);
    const { data, error } = await query;
    if (error) throw new Error(`Failed to load ${table} (offset ${offset}): ${error.message}`);
    all.push(...((data ?? []) as T[]));
    if (!data || data.length < pageSize) break;
    offset += pageSize;
  }
  return all;
}

async function relinkAssets(supabase: SupabaseClient): Promise<number> {
  const unmatched = await loadAllRows<AssetRow>(
    supabase,
    "assets",
    "id, registry, external_id, metadata",
    (q) => q.is("cad_trust_project_id", null),
  );
  if (unmatched.length === 0) return 0;

  const projects = await loadAllRows<{ id: string; project_id: string }>(
    supabase,
    "cad_trust_projects",
    "id, project_id",
  );
  const idByProjectId = new Map(projects.map((p) => [p.project_id, p.id]));

  const toRelink = unmatched
    .map((asset) => ({ asset, key: assetMatchKey(asset) }))
    .filter((x): x is { asset: AssetRow; key: string } => x.key !== null)
    .map(({ asset, key }) => ({ asset, projectId: idByProjectId.get(key) }))
    .filter((x): x is { asset: AssetRow; projectId: string } => x.projectId !== undefined);

  let relinked = 0;
  await runWithConcurrency(toRelink, WRITE_CONCURRENCY, async ({ asset, projectId }) => {
    const { error } = await supabase
      .from("assets")
      .update({ cad_trust_project_id: projectId })
      .eq("id", asset.id);
    if (error) {
      console.warn(`Relink failed for asset ${asset.id}: ${error.message}`);
      return;
    }
    relinked++;
  });
  return relinked;
}

serve(async (_req: Request) => {
  try {
    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

    const stats: Stats = {
      projectsUpserted: 0,
      projectsReconciled: 0,
      projectUpsertErrors: 0,
      duplicateProjectIds: 0,
      ratingsMatched: 0,
      ratingsUpserted: 0,
      ratingUpsertErrors: 0,
      locationsUpserted: 0,
      locationUpsertErrors: 0,
      unmatchedRatedProjects: [],
      unmappedRegistries: new Set(),
      seenProjectIds: new Set(),
    };

    const first = await fetchPage(1);
    const pageCount = first.pageCount ?? 1;
    await processPage(first.data, supabase, stats);

    for (let start = 2; start <= pageCount; start += PAGE_CONCURRENCY) {
      const pageNums: number[] = [];
      for (let p = start; p < start + PAGE_CONCURRENCY && p <= pageCount; p++) pageNums.push(p);
      const results = await Promise.all(pageNums.map((p) => fetchPage(p)));
      for (const r of results) await processPage(r.data, supabase, stats);
      console.log(`Processed page(s) ${pageNums.join(",")}/${pageCount}`);
    }

    const assetsRelinked = await relinkAssets(supabase);

    const result = {
      ok: true,
      pageCount,
      projectsUpserted: stats.projectsUpserted,
      projectsReconciled: stats.projectsReconciled,
      projectUpsertErrors: stats.projectUpsertErrors,
      duplicateProjectIds: stats.duplicateProjectIds,
      ratingsMatched: stats.ratingsMatched,
      ratingsUpserted: stats.ratingsUpserted,
      ratingUpsertErrors: stats.ratingUpsertErrors,
      locationsUpserted: stats.locationsUpserted,
      locationUpsertErrors: stats.locationUpsertErrors,
      unmatchedRatedProjectCount: stats.unmatchedRatedProjects.length,
      unmappedRegistries: [...stats.unmappedRegistries],
      assetsRelinked,
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
