# Plan: Ingest Toucan Protocol + KlimaDAO on-chain data into Sintropia

## Status as of 2026-08-22

**Shipped and live.** The full pipeline is deployed to production
(`tashftatbucseafjlfdw`), scheduled every 6 hours, and has ingested real
data: **402 Toucan assets, 5 Klima assets, 6 on-chain retirements, 7 Klima
pool prices**, zero ingest errors on the last run.

Two production bugs were found and fixed along the way that no amount of
local review would have caught — both only showed up once the function ran
against the real database (see §5.4 and §5.5 for detail):

1. `carbon_credits.quantity` is `INTEGER` in production (not `NUMERIC` as
   assumed) — every fractional on-chain retirement amount was rejected
   until the edge function started rounding for that one column.
2. `price_references.reference_type`'s `CHECK` constraint didn't allow
   `'klima_pool'` — every Klima price insert failed until a new migration
   widened it.

Nothing has been committed to git yet — see §5.1.

Files touched this pass:

- `supabase/migrations/20260822000000_toucan_klima_ingest.sql` (pre-existing, one guard fixed — §5.2)
- `supabase/functions/ingest-toucan-klima/index.ts` (pre-existing, one bug fixed — §5.4)
- `supabase/migrations/20260822000001_schedule_ingest_toucan_klima.sql` (new — §5.3)
- `supabase/migrations/20260822000002_allow_klima_pool_reference_type.sql` (new — §5.5)
- `scripts/sync-toucan-klima.ts` (new)
- `src/app/api/carbon-projects/route.ts` (fixed — §5.6)
- `scripts/verify-app-queries.cjs` (updated to match)
- `README.md` (new script listed)

The sections below describe what's implemented, what's left, and where the
implementation diverges from the original design sketch (field names,
cursor strategy, result shape, cron pattern).

## 1. What this unlocks

- **Asset catalog**: real, verifiable project-level TCO2 tokens (one per
  project+vintage bridge) from Toucan's Base subgraph, feeding the live
  markets explorer automatically since it already filters by
  `asset_type`/`provider`.
- **Retirement data**: on-chain redemptions land in `carbon_credits`
  (`transaction_type='retirement'`) and in the new `onchain_retirements`
  table (raw source of truth).
- **Pool prices/liquidity**: Klima carbon-class spot USDC/tonne + pool
  liquidity from `x402.klimalabs.com/api/discover` → `price_references`
  (`reference_type='klima_pool'`).

## 2. Architecture (implemented)

`supabase/functions/ingest-toucan-klima/index.ts`, mirroring
`ingest-carbonmark`:

1. `resolveGraphKey(supabase)` — reads `THE_GRAPH_API_KEY` from env, falls
   back to `get_app_secret('THE_GRAPH_API_KEY')` via RPC. Same pattern as
   `resolveCarbonmarkKey`.
2. POSTs GraphQL to
   `https://gateway-arbitrum.network.thegraph.com/api/{key}/subgraphs/id/AEJ5PEDye6Z198HRQBioG6mZ6ZacHenBg2HTopZPsUCi`.
3. GETs Klima `/discover` (no key needed).
4. Upserts into existing tables plus the new `onchain_retirements` table.
5. Returns a result object (see §5.8.4 — shape differs from Carbonmark's).

**Deviations from the original sketch, now confirmed against the live
subgraph schema:**

- The retirement entity is `retirements` (not `redemptions`). Fields used:
  `id`, `creationTx`, `amount`, `timestamp`, `eventId`, `creator.id`,
  `token.{address,symbol,name,totalRetired,projectVintage.{...}}`,
  `certificate.{id,beneficiaryString,retiringEntityString,retirementMessage,beneficiaryLocation,consumptionCountryCode}`.
- Token/project fields are `tco2Tokens.projectVintage.project.{projectId,
  standard, methodology, region, category, emissionType, method}` — richer
  than the `standard/sector/country/methodology` sketch assumed.
- **Incremental cursor is already implemented**, and differently than
  planned: instead of a state row in `data_sources.metadata`, it queries
  `MAX(onchain_retirements.retired_at)` for `provider='toucan'` on each run
  and uses that as `timestamp_gte` (falling back to a `?days=` lookback,
  default 30). Simpler than a separate state table and reuses data already
  being written.
- Pool liquidity comes from a separate `pooledTokens` query (capped at 5
  pages / 5,000 rows) and is merged into asset `metadata.pooledAmountTonnes`
  by token symbol — not part of the original sketch.
- Full catalog backfill (`tco2Tokens`, not just tokens seen in retirements)
  is gated behind `?full=1`, capped at `MAX_TOKEN_PAGES=10` (10k tokens).

## 3. Data mapping (implemented)

- **`data_sources`**: upserts "Toucan Protocol" and "KlimaDAO" rows
  (`onConflict: source_name`), same convention as Carbonmark.
- **`assets`** (`provider='toucan'`, `asset_type='carbon_credit'`): from
  `tco2Tokens`/retirement `token`. `slug = symbol` (unique), `external_id =
  address`, `registry = project.standard`, `country = project.region`,
  `project_category = project.category`, `methodology =
  project.methodology`, `is_active = max(issued - retired, 0) > 0`,
  `metadata` carries the full vintage/project payload plus
  `network: 'base'`.
- **`assets`** (`provider='klima'`): one row per Klima carbon class
  (`slug = 'klima-{carbonClassId}'`), plus per-credit price rows joined back
  to Toucan assets by token address where possible.
- **`price_references`** (`reference_type='klima_pool'`): class-level price
  (`onConflict: asset_id,source_identifier` with `source_identifier =
  carbonClassId`) and token-level price (`source_identifier =
  'klima:{classId}:{tokenAddress}'`) when the token address matches an
  existing Toucan asset's `external_id`.
- **`carbon_credits`** (`transaction_type='retirement'`): `project_id`
  links to `carbon_projects.project_id` only if a matching row exists
  (checked per page, batched via `IN` chunks of 100) — otherwise `null`
  (FK is nullable, safe). `retirement_account = creator.id`,
  `retirement_beneficiary = certificate.beneficiaryString`,
  `retirement_note = certificate.retirementMessage`, `source='toucan'`,
  `chain_tx_hash = '{creationTx}:{eventId}'` (composite, since a single tx
  can contain multiple retirement events).
- **`onchain_retirements`** (new table, immutable source of truth): richer
  than `carbon_credits` — also stores `subgraph_id` (unique per
  provider+id, used as the upsert key and the incremental cursor's join
  point), `retiring_entity` (`certificate.retiringEntityString`, distinct
  from `beneficiary`), `certificate_id`, `token_symbol`, `registry`,
  `methodology`, `country`, raw `original_data`. RLS enabled, no policies
  (deny-by-default, matches baseline convention — writes go through the
  service role).

## 4. Migration detail (implemented)

`20260822000000_toucan_klima_ingest.sql` is additive/idempotent (guarded
`ADD COLUMN IF NOT EXISTS` / `CREATE ... IF NOT EXISTS`, matches the
baseline convention in `docs/schema-baseline.md`):

- `carbon_credits` gains nullable `source` and `chain_tx_hash`, plus a
  **non-partial** unique index on `(source, chain_tx_hash)` — chosen
  because supabase-js can't express a partial-index `ON CONFLICT`
  predicate; legacy rows with both columns `NULL` are unaffected since a
  unique index permits multiple `NULL`s.
- `price_references` needs a unique index on `(asset_id,
  source_identifier)` for `ingest-carbonmark`'s and this function's
  upserts. Production turned out to already have one, under a different
  name than the migration originally assumed — see §5.2 for the fix.
- `onchain_retirements` created with RLS enabled, no policies.

## 5. Work log

1. ⬜ **Commit the drafted files.** Everything below is still untracked
   local changes. Not committed — per project convention this repo only
   commits on explicit request. Ready to commit whenever asked.
2. ✅ **Schema migration applied to production**, with one fix first.
   `20260822000000_toucan_klima_ingest.sql`'s price_references index
   guard originally used `CREATE UNIQUE INDEX IF NOT EXISTS
   uq_price_references_asset_source` — but live inspection (via the
   Supabase MCP, `pg_indexes`) showed production **already had** an
   equivalent unique index on `(asset_id, source_identifier)`, just under
   a different name (`idx_price_references_asset_source`, added by a
   migration not present in this repo's history). Since `IF NOT EXISTS`
   only matches by name, the original SQL would have silently created a
   redundant duplicate index. Rewrote it as a `DO $$` block that checks
   `pg_indexes` for an equivalent index under any name first. Applied via
   `mcp__supabase__apply_migration` — `{"success":true}`.
3. ✅ **Schedule migration written to match the *actual* working
   Carbonmark cron, not the stale local file.** The local
   `20260716000001_schedule_ingest_carbonmark.sql` builds the URL and auth
   header from `vault.decrypted_secrets` (`SUPABASE_URL`,
   `SUPABASE_SERVICE_ROLE_KEY`) — but neither secret exists in
   `vault.secrets` in production (checked directly). Pulling the live
   function definition of `tasks.trigger_ingest_carbonmark()` showed it
   was rewritten by a migration not in this repo
   ("fix_carbonmark_ingest_vault_and_cron") to hardcode the URL and send
   **no** Authorization header, relying on the target function being
   deployed with `verify_jwt=false`. `20260822000001_schedule_ingest_toucan_klima.sql`
   mirrors that live version. Applied — `{"success":true}`. Confirmed
   `cron.job` now lists `ingest-toucan-klima` at `0 */6 * * *`.
4. ✅ **Edge function deployed, one integer-rounding bug fixed first.**
   Live schema inspection showed `carbon_credits.quantity` is `INTEGER`
   (the local PGlite baseline schema is the same — this was always the
   real type, not a drift artifact). On-chain retirement amounts
   (`wei / 1e18`) are essentially always fractional, and Postgres's
   integer input parser rejects any value with a decimal point outright.
   The first real invoke confirmed this: 6 retirements in, 6
   `carbon_credits` insert failures. Fixed by rounding only the
   `carbon_credits.quantity` value (`Math.round(quantity)`); full
   precision is kept in `onchain_retirements.quantity`, which is
   `NUMERIC(20,6)`. Redeployed
   (`mcp__supabase__deploy_edge_function`, `verify_jwt: false` to match
   `ingest-carbonmark`'s config, required since the cron call above sends
   no auth header) — re-invoke then showed `creditErrors: 0`.
5. ✅ **New migration: widen `price_references.reference_type`'s CHECK
   constraint to allow `'klima_pool'`.** Not something any local review
   would have caught — this constraint isn't in this repo's migration
   history at all (added directly to production at some point). The first
   real invoke logged (via `mcp__supabase__query_logs`, `function_logs`
   source) 5/5 Klima classes failing with `violates check constraint
   "price_references_reference_type_check"`. Its actual definition only
   allowed `trade, bid, ask, indicative, closing, rfq, range,
   carbonmark_listing, carbonmark_pool, market`. Added
   `20260822000002_allow_klima_pool_reference_type.sql`: additive-only
   (widens, never narrows), and guarded so it's a no-op both if the
   constraint already allows `klima_pool` *and* if the constraint doesn't
   exist at all (true on a fresh/local rebuild, since this repo never
   defined it) — deliberately does not invent a new constraint where none
   existed, since that could reject other `reference_type` values this
   migration hasn't audited. Applied — `{"success":true}`. Re-invoke then
   showed `klimaPriceCount: 5, klimaErrors: 0`.
6. ✅ **`carbon-projects/route.ts` stats double-counting — fixed.**
   Confirmed this was a real bug, not just a judgment call: the UI card
   this feeds is literally labeled "Créditos Emitidos" (Credits **Issued**)
   in `CarbonPlanChart.tsx:335`, so summing retirement rows into it was
   always wrong, independent of this ingestion. Fixed in
   `src/app/api/carbon-projects/route.ts`:
   - `totalCredits` / `vintageStats` / `creditsByCountry` now exclude
     `transaction_type = 'retirement'` rows (added `transaction_type` to
     the `carbon_credits` select).
   - Added a new `stats.totalRetired` field (sum of the excluded rows) so
     retirement data is actually exposed via the API, per the original
     goal — no UI changes made, the field is there for the UI to pick up
     later.
   - Kept `scripts/verify-app-queries.cjs`'s "credits stats pagination"
     check in sync with the new `SELECT` column list.
   - Verified: `npx tsc --noEmit` clean, `npm run db:verify` passes
     end-to-end after every migration edit above (installed
     `@electric-sql/pglite` on demand, as its own error message instructs).
7. ✅ **Local dev/backfill runner — done and used.**
   `scripts/sync-toucan-klima.ts`: thin wrapper that POSTs to
   `{NEXT_PUBLIC_SUPABASE_URL}/functions/v1/ingest-toucan-klima` with the
   service-role bearer token; `--full` / `--days=N` map to the function's
   `?full=1`/`?days=`. Added to the README script index next to
   `sync-carbonmark-prices.ts`. Used for every invoke in this work log.
8. ✅ **Verification and rollout — complete:**
   1. `npm run db:verify` — passing.
   2. Migrations applied, function deployed (`verify_jwt: false`,
      matching `ingest-carbonmark`).
   3. `THE_GRAPH_API_KEY` — turned out to **already be set** in
      `vault.secrets` (checked via `execute_sql`, value not printed) —
      someone had set this ahead of today, so it needed no action.
   4. Invoked manually multiple times (`--days=7`, `--full`) while fixing
      the two bugs above. Final clean run:
      ```
      { ok: true, assetCount: 403, assetErrors: 0, retirementCount: 1,
        creditCount: 1, creditErrors: 0, klimaClassCount: 5,
        klimaPriceCount: 5, klimaTokenPriceCount: 2, klimaErrors: 0 }
      ```
   5. Full Toucan catalog backfill run (`--full`) — 403 assets, 0 errors.
   6. Confirmed via direct query (`execute_sql`) that data actually
      landed: **402 `assets` rows with `provider='toucan'`, 5 with
      `provider='klima'`, 6 `onchain_retirements`, 6 `carbon_credits`
      rows with `source='toucan'`, 7 `price_references` rows with
      `reference_type='klima_pool'`.** Did not additionally open the
      Live Markets page in a browser — that's still worth a manual look
      whenever it's convenient, but the data these pages read from is
      confirmed live and correctly shaped.
9. ✅ **Security check.** `mcp__supabase__get_advisors(type: 'security')`
   after all migrations: the only new-looking item is `onchain_retirements`
   has RLS enabled with no policies — that's the intended deny-by-default
   posture (service role writes, no anon/authenticated access needed), not
   a gap. Every other advisory finding (a `SECURITY DEFINER` view, a
   function with a mutable search_path, a couple of `SECURITY DEFINER`
   RPCs exposed to `anon`/`authenticated`, leaked-password protection
   disabled) predates this work and is out of scope here.

## 6. Risks / notes carried over from the original sketch (still valid)

- **Gateway limits**: the function already uses per-entity pagination and
  per-item try/catch (`assetErrors`, `creditErrors`, `klimaErrors` counters
  instead of aborting the whole run) — but there's no `Promise.allSettled`
  batching across pages, so a slow/failing page blocks subsequent ones.
  Fine at current volume; revisit if Toucan/Klima query credits become a
  bottleneck.
- **Project join**: Toucan `project.projectId` vs `carbon_projects
  .project_id` — the function checks existence per page before linking;
  unmatched retirements get `project_id = null`, which is acceptable and
  already handled.
- **No double-count across providers**: a TCO2 token may also exist as a
  separate `assets` row via Carbonmark (different `provider`) — intentional
  and already the existing pattern for other dual-sourced data.
