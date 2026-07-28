-- ============================================================
-- Market listings (peer marketplace): supply (offer) + demand
-- Broker user_type support on profiles (no DB enum; free text)
-- ============================================================

-- ---------------------------------------------------------------
-- 1. buyer_profiles: one row per user (demand Section 1 profile)
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS buyer_profiles (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  company_name TEXT,
  buyer_country TEXT,
  purchase_purpose TEXT[] DEFAULT '{}',
  bought_br_credits_before BOOLEAN,
  annual_budget_range TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE buyer_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "buyer_profiles_select" ON buyer_profiles
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "buyer_profiles_insert" ON buyer_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND NOT EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'banned'
    )
  );

CREATE POLICY "buyer_profiles_update" ON buyer_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "buyer_profiles_delete" ON buyer_profiles
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ---------------------------------------------------------------
-- 2. market_listings (supply + demand unified by `side`)
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS market_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- author / classification
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  buyer_profile_id UUID REFERENCES buyer_profiles(user_id) ON DELETE SET NULL,

  side TEXT NOT NULL CHECK (side IN ('supply','demand')),
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('draft','active','paused','closed','expired')),
  asset_type TEXT NOT NULL CHECK (asset_type IN ('carbon_credit','irec','both')),

  -- === SHARED ===
  volume NUMERIC,                    -- supply: required integer volume; demand: maybe
  unit TEXT CHECK (unit IN ('tCO2e','MWh')),
  delivery_term TEXT,                 -- Spot, Forward Q1 2027, Q4 2026...

  -- === SUPPLY: obrigatórios ===
  registry TEXT,                      -- Verra VCS, Gold Standard, I-REC, CCEE Origem
  project_registry_id TEXT,           -- VCS-1234 / IREC-BR-2025-XXXX
  project_name TEXT,
  vintage INT,                        -- single vintage year
  origin_country TEXT,                -- Brazil

  -- price (optional; sob consulta allowed)
  price_amount NUMERIC,
  price_currency TEXT DEFAULT 'USD',
  price_on_request BOOLEAN DEFAULT false,

  -- === SUPPLY: recomendados ===
  methodology TEXT,                   -- REDD+, Solar, Hydro, ARR...
  ccp_status TEXT CHECK (ccp_status IN ('ccp_eligible','under_assessment','not_applicable') OR ccp_status IS NULL),
  ratings JSONB,                      -- { sylvera:"B", bezero:"A-", renoster:72 }
  co_benefits TEXT[] DEFAULT '{}',    -- SDG 13, SDG 15, CCB Gold...
  ccee_origem TEXT CHECK (ccee_origem IN ('yes','no','pending') OR ccee_origem IS NULL),
  min_transaction_size NUMERIC,
  documentation TEXT[] DEFAULT '{}', -- pdd, verification_report, community_consent
  media_urls TEXT[] DEFAULT '{}',
  contract_type TEXT,                 -- spot | offtake | forward

  -- === DEMAND: requisitos ===
  registries TEXT[] DEFAULT '{}',     -- multi
  volume_min NUMERIC,
  volume_max NUMERIC,
  vintage_from INT,
  vintage_to INT,
  methodologies TEXT[] DEFAULT '{}',
  regions TEXT[] DEFAULT '{}',
  price_min NUMERIC,
  price_max NUMERIC,
  ccp_requirement TEXT CHECK (ccp_requirement IN ('required','preferred','irrelevant') OR ccp_requirement IS NULL),
  certifications TEXT[] DEFAULT '{}',

  -- === DEMAND: qualidade ===
  min_ratings JSONB,
  co_benefit_prefs TEXT[] DEFAULT '{}',
  needs_extra_dd BOOLEAN,
  open_to_multi_year_offtake BOOLEAN,
  offtake_until_year INT,

  -- === DEMAND: processo ===
  proposal_deadline TIMESTAMPTZ,
  response_format TEXT,                -- free | template
  evaluation_criteria JSONB,           -- { quality:40, price:25, cobenefits:15, trackrecord:20 }
  prefer_deal_room BOOLEAN,

  -- === meta ===
  completeness_score INT DEFAULT 0,    -- 0-100, computed app-side
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE market_listings ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_market_listings_side_status
  ON market_listings (side, status);
CREATE INDEX IF NOT EXISTS idx_market_listings_asset_type
  ON market_listings (asset_type);
CREATE INDEX IF NOT EXISTS idx_market_listings_origin_country
  ON market_listings (origin_country);
CREATE INDEX IF NOT EXISTS idx_market_listings_created_at
  ON market_listings (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_market_listings_author
  ON market_listings (author_id);

-- Policies
CREATE POLICY "market_listings_select" ON market_listings
  FOR SELECT
  USING (
    status = 'active'
    OR author_id = auth.uid()
  );

CREATE POLICY "market_listings_insert" ON market_listings
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = author_id
    AND NOT EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'banned'
    )
  );

CREATE POLICY "market_listings_update" ON market_listings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "market_listings_delete" ON market_listings
  FOR DELETE
  TO authenticated
  USING (auth.uid() = author_id);

-- ---------------------------------------------------------------
-- 3. updated_at trigger
-- ---------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_buyer_profiles_updated_at ON buyer_profiles;
CREATE TRIGGER trg_buyer_profiles_updated_at
  BEFORE UPDATE ON buyer_profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_market_listings_updated_at ON market_listings;
CREATE TRIGGER trg_market_listings_updated_at
  BEFORE UPDATE ON market_listings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------
-- 4. View: market_listings + author profile snapshot
-- ---------------------------------------------------------------
CREATE OR REPLACE VIEW v_market_listings
WITH (security_invoker = true) AS
SELECT
  l.*,
  p.username    AS author_username,
  p.display_name AS author_display_name,
  p.avatar_url  AS author_avatar_url,
  p.user_type   AS author_user_type,
  p.karma       AS author_karma,
  p.role        AS author_role
FROM market_listings l
JOIN profiles p ON p.id = l.author_id;

COMMENT ON VIEW v_market_listings IS 'Market listings enriched with author profile for P2P marketplace browse.';

-- Revoke direct RPC on security definer helper
REVOKE EXECUTE ON FUNCTION set_updated_at() FROM PUBLIC, anon, authenticated;