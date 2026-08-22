-- Toucan Protocol + KlimaDAO on-chain ingestion support.
--
-- Additive and idempotent: every statement is guarded so it is a strict
-- no-op on any database that already has the objects (mirrors the baseline
-- migrations' convention -- see docs/schema-baseline.md).
--
-- 1. carbon_credits gains two nullable provenance columns plus a unique
--    index that makes service-side upserts deterministic. The index is NOT
--    partial: supabase-js cannot express ON CONFLICT index predicates, and
--    legacy rows leave both columns NULL, which a unique index permits in
--    multiples.
--
-- 2. price_references needs a unique index on (asset_id, source_identifier)
--    for upserts with onConflict "asset_id,source_identifier" to work.
--    Production already has one (idx_price_references_asset_source, added
--    by a migration not present in this repo's history) -- IF NOT EXISTS
--    only matches by name, so this checks pg_indexes for an equivalent
--    index under any name before creating a same-purpose duplicate. On a
--    fresh database with no such index yet, it creates one.
--
-- 3. onchain_retirements stores raw subgraph redemptions as the immutable
--    source of truth. RLS is enabled with no policies: deny-by-default is
--    the safe failure mode and matches every baselined table; ingestion
--    writes through the service role.

ALTER TABLE public.carbon_credits
  ADD COLUMN IF NOT EXISTS source TEXT;

ALTER TABLE public.carbon_credits
  ADD COLUMN IF NOT EXISTS chain_tx_hash TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS uq_carbon_credits_source_tx
  ON public.carbon_credits (source, chain_tx_hash);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = 'public'
      AND tablename = 'price_references'
      AND indexdef ILIKE '%UNIQUE%(asset_id, source_identifier)%'
  ) THEN
    CREATE UNIQUE INDEX uq_price_references_asset_source
      ON public.price_references (asset_id, source_identifier);
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('public.onchain_retirements') IS NULL THEN
    CREATE TABLE public.onchain_retirements (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      provider VARCHAR(50) NOT NULL DEFAULT 'toucan',
      chain VARCHAR(50) NOT NULL DEFAULT 'base',
      subgraph_id VARCHAR(255) NOT NULL,
      tx_hash VARCHAR(255),
      event_id VARCHAR(100),
      token_address VARCHAR(100),
      token_symbol VARCHAR(255),
      registry VARCHAR(100),
      methodology VARCHAR(255),
      country VARCHAR(100),
      project_id VARCHAR(100),
      vintage INTEGER,
      quantity NUMERIC(20,6) NOT NULL,
      retiring_address VARCHAR(100),
      beneficiary TEXT,
      retiring_entity TEXT,
      message TEXT,
      certificate_id VARCHAR(255),
      retired_at TIMESTAMPTZ,
      original_data JSONB,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE UNIQUE INDEX uq_onchain_retirements_provider_subgraph
      ON public.onchain_retirements (provider, subgraph_id);
    CREATE INDEX idx_onchain_retirements_retired_at
      ON public.onchain_retirements (retired_at);
    CREATE INDEX idx_onchain_retirements_project_id
      ON public.onchain_retirements (project_id);

    ALTER TABLE public.onchain_retirements ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;
