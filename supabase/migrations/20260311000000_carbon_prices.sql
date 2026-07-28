-- Tabela para Preços de Carbono
CREATE TABLE IF NOT EXISTS public.carbon_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  market_type VARCHAR(50) NOT NULL, -- 'compliance', 'voluntary'
  market_name VARCHAR(100) NOT NULL, -- 'EU ETS', 'VCM High Integrity', etc
  region VARCHAR(100), -- 'Europe', 'Global', 'Brazil', etc
  price_range VARCHAR(100),
  currency VARCHAR(10) DEFAULT 'USD',
  unit VARCHAR(50) DEFAULT 'tCO2e',
  observation TEXT,
  trend VARCHAR(100),
  update_date VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS para carbon_prices
ALTER TABLE public.carbon_prices ENABLE ROW LEVEL SECURITY;

-- Política de leitura pública para carbon_prices
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'carbon_prices' AND policyname = 'Public read access to carbon_prices'
    ) THEN
        CREATE POLICY "Public read access to carbon_prices"
        ON public.carbon_prices FOR SELECT
        USING (true);
    END IF;
END $$;
