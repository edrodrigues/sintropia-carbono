# Enrich Live Markets listings with more CAD Trust data

## Context

Sintropia's Live Markets feature (`/carbono/mercados-ao-vivo`) already enriches listed
assets with a slice of CAD Trust (Climate Action Data Trust) data — BeZero/Sylvera
ratings, CCP alignment, registry status/link, and (as of
`20260823000007_market_snapshot_cad_trust_project_fields.sql`) issued/retired units and
location country — via `CadTrustScore` and the "Atributos" panel in `AssetDrawer`.

While tracing this, two gaps turned up:

1. **A live-verified data gap.** CAD Trust's own API (`observer.climateactiondata.org`)
   already returns `projectDeveloper`, `methodology`/`methodology2`, and
   `projectLocations`, `labels`, `coBenefits` per project (confirmed by fetching the
   live endpoint directly) — but `supabase/functions/ingest-cadtrust-ratings/index.ts`
   only reads a subset of fields into `cad_trust_projects`, and never writes to
   `cad_trust_locations` at all during the daily sync.
2. **A staleness bug.** `cad_trust_locations` — the table that migration just wired
   into `v_market_snapshot.cad_trust_location_country` — was only ever populated by a
   one-time 2026-07-17 CSV seed. Every project discovered by the daily sync since then
   has no location row, so that column is silently blank for a growing share of assets.

Per priority call, this plan covers two of three candidate directions:
- Fix the location staleness bug + surface the Renoster rating (already anticipated by
  `RATING_AGENCIES` in `market-listing-options.ts:79` but never wired into `CadTrustScore`).
- Surface project developer (`proponent`, an existing but always-null
  `cad_trust_projects` column) and methodology (new columns) in `AssetDrawer`.

The validation/verification + co-benefits/labels direction is deferred.

## Changes

### 1. `supabase/functions/ingest-cadtrust-ratings/index.ts`

- Extend `CadtProject` with `projectDeveloper`, `methodology`, `methodology2`, and
  `projectLocations?: { country?: string | null }[] | null`.
- In `toProjectRow()`: add `proponent` (from `projectDeveloper`; treat `"n.a."`
  case-insensitively as null, same null-coalescing style already used for every other
  optional field in this function) and two new columns, `project_methodology` /
  `project_methodology_secondary` (from `methodology` / `methodology2`).
- Add `upsertLocations(supabase, projects, idByWarehouseId, stats)`, mirroring
  `upsertRatings()`'s shape: for each project's `projectLocations`, upsert
  `{ cad_trust_project_id, country, in_country_region, geographic_identifier }` into
  `cad_trust_locations`, `onConflict: "cad_trust_project_id,country"`. Call it from
  `processPage()` alongside `upsertRatings()`.
- Add `locationsUpserted` / `locationUpsertErrors` to `Stats` and the final JSON result,
  matching the existing counters.

### 2. Migrations (new files, after `20260823000007`)

**`20260823000008_cad_trust_project_developer_methodology.sql`**
- `ALTER TABLE cad_trust_projects ADD COLUMN project_methodology TEXT, ADD COLUMN project_methodology_secondary TEXT;` (`proponent` already exists — it's an unused legacy CSV-seed column being repurposed, consistent with this pipeline's existing pattern of live data overwriting the one-time seed.)
- `CREATE UNIQUE INDEX idx_cad_trust_locations_project_country ON cad_trust_locations(cad_trust_project_id, country);` — required as the `onConflict` target for the new upsert; `cad_trust_locations` currently has no unique constraint.

**`20260823000009_market_snapshot_developer_methodology_renoster.sql`**
- `CREATE OR REPLACE VIEW v_market_snapshot`, appending three columns at the end (per the append-only convention `20260823000003`/`20260823000007` already establish — do not reorder existing columns):
  - A third rating LATERAL join (`rating_name = 'Renoster'`) → `rating_value AS rating_renoster`, alongside the existing BeZero/Sylvera ones.
  - `p.proponent AS cad_trust_developer`
  - `p.project_methodology AS cad_trust_methodology`

### 3. Frontend

- **`src/components/live-markets/CadTrustScore.tsx`**: add `ratingRenoster` prop, include it in the `hasAny` check, add it to `AGENCY_URLS` (confirm Renoster's real site URL before hardcoding — don't guess), and render a third badge in both `compact` (`RN:{value}`) and `row` (`Renoster: {value}`) variants, matching the BeZero/Sylvera pattern exactly.
- Pass `ratingRenoster={...rating_renoster}` at all 5 existing call sites: `AssetDrawer.tsx:156-157`, `WatchlistTab.tsx:105-106`, `ComparatorTab.tsx:61-62`, `OverviewTab.tsx:182-183`, `ExplorerTab.tsx:213-214`.
- **`AssetDrawer.tsx`**: add two entries to the existing "Atributos" `dl` array (around line 197-210, near the other `cad_trust_*` fields): `{ label: "Desenvolvedor", value: asset.cad_trust_developer || "—" }` and `{ label: "Metodologia", value: asset.cad_trust_methodology || "—" }`.
- **`src/types/supabase.ts`**: add `rating_renoster`, `cad_trust_developer`, `cad_trust_methodology` (all `string | null`) to `v_market_snapshot.Row` (~line 2602-2633). Regenerate via the Supabase MCP/CLI if available at implementation time; otherwise hand-edit to match.

## Verification

1. `npm run db:verify` — replays all migrations locally (PGlite) and checks the schema contract, app queries, and constraints; must pass after adding the two new migration files.
2. `npm run typecheck` — catches any mismatch from the `supabase.ts` and component prop changes.
3. Before wiring Renoster, confirm CAD Trust actually emits a `"Renoster"` `ratingType` somewhere in its live feed (the 3 sample projects fetched during exploration had empty `projectRatings`, so this wasn't directly confirmed) — spot-check a few more pages, or just ship it: absent data degrades to `—` exactly like BeZero/Sylvera already do.
4. Deploy and manually trigger `ingest-cadtrust-ratings` (or wait for its daily cron), then check its JSON log for `locationsUpserted` > 0 and no new `locationUpsertErrors`.
5. Load `/carbono/mercados-ao-vivo`, open the `AssetDrawer` for an asset with a linked `cad_trust_project_id`, and confirm: developer/methodology render when present, fall back to "—" when not (no layout breakage), and any Renoster rating shows alongside BeZero/Sylvera in both compact and row variants.
