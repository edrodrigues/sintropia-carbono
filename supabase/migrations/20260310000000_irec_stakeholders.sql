-- Tabela: irec_stakeholders (Brasil e Mundo)
CREATE TABLE IF NOT EXISTS public.irec_stakeholders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ranking INTEGER NOT NULL,
  region VARCHAR(20) NOT NULL DEFAULT 'brazil', -- 'brazil' ou 'world'
  empresa VARCHAR(255) NOT NULL,
  setor VARCHAR(100),
  papel_mercado VARCHAR(100),
  volume_2024 BIGINT,
  volume_2025 BIGINT,
  volume_2026 BIGINT,
  delta_num BIGINT,
  delta_pct DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(ranking, region)
);

-- Index para consultas frequentes
CREATE INDEX IF NOT EXISTS idx_irec_stakeholders_ranking_region ON public.irec_stakeholders(ranking, region);
CREATE INDEX IF NOT EXISTS idx_irec_stakeholders_setor ON public.irec_stakeholders(setor);

-- RLS (Row Level Security)
ALTER TABLE public.irec_stakeholders ENABLE ROW LEVEL SECURITY;

-- Política de leitura pública
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'irec_stakeholders' AND policyname = 'Public read access to irec_stakeholders'
    ) THEN
        CREATE POLICY "Public read access to irec_stakeholders"
        ON public.irec_stakeholders FOR SELECT
        USING (true);
    END IF;
END $$;

-- Tabela de Metadados: data_sources
CREATE TABLE IF NOT EXISTS public.data_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_name VARCHAR(255) NOT NULL UNIQUE,
  source_url TEXT,
  data_type VARCHAR(50) NOT NULL, -- 'irec', 'carbon', 'prices'
  last_updated TIMESTAMPTZ,
  refresh_frequency VARCHAR(50), -- 'daily', 'weekly', 'monthly'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS para data_sources
ALTER TABLE public.data_sources ENABLE ROW LEVEL SECURITY;

-- Política de leitura pública para data_sources
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'data_sources' AND policyname = 'Public read access to data_sources'
    ) THEN
        CREATE POLICY "Public read access to data_sources"
        ON public.data_sources FOR SELECT
        USING (true);
    END IF;
END $$;
