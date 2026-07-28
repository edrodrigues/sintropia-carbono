-- Tabela: assets (ativos de carbono / I-REC)
CREATE TABLE IF NOT EXISTS public.assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(500) NOT NULL,
  asset_type VARCHAR(50) NOT NULL DEFAULT 'carbon_credit',
  registry VARCHAR(100),
  technology VARCHAR(100),
  country VARCHAR(100),
  region VARCHAR(100),
  project_category VARCHAR(100),
  methodology VARCHAR(255),
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_assets_slug ON public.assets(slug);
CREATE INDEX IF NOT EXISTS idx_assets_asset_type ON public.assets(asset_type);
CREATE INDEX IF NOT EXISTS idx_assets_registry ON public.assets(registry);
CREATE INDEX IF NOT EXISTS idx_assets_country ON public.assets(country);

-- Tabela: price_references (preços históricos por ativo)
CREATE TABLE IF NOT EXISTS public.price_references (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID REFERENCES public.assets(id) ON DELETE CASCADE,
  price DECIMAL(18,6),
  price_high DECIMAL(18,6),
  price_low DECIMAL(18,6),
  price_display VARCHAR(50),
  currency VARCHAR(10) DEFAULT 'USD',
  unit VARCHAR(50) DEFAULT 'tCO2e',
  vintage_year INTEGER,
  volume DECIMAL(18,6),
  volume_unit VARCHAR(50) DEFAULT 'tonnes',
  reference_date TIMESTAMPTZ,
  reference_type VARCHAR(50) NOT NULL DEFAULT 'market',
  data_source_id UUID REFERENCES public.data_sources(id),
  source_identifier VARCHAR(500),
  original_data JSONB,
  fetched_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_price_references_asset_id ON public.price_references(asset_id);
CREATE INDEX IF NOT EXISTS idx_price_references_reference_date ON public.price_references(reference_date);
CREATE INDEX IF NOT EXISTS idx_price_references_source ON public.price_references(source_identifier);

-- RLS
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_references ENABLE ROW LEVEL SECURITY;

-- Política de leitura pública para assets
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'assets' AND policyname = 'Public read access to assets'
    ) THEN
        CREATE POLICY "Public read access to assets"
        ON public.assets FOR SELECT
        USING (true);
    END IF;
END $$;

-- Política de leitura pública para price_references
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'price_references' AND policyname = 'Public read access to price_references'
    ) THEN
        CREATE POLICY "Public read access to price_references"
        ON public.price_references FOR SELECT
        USING (true);
    END IF;
END $$;
