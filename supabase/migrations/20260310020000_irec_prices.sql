-- Tabela para Preços de I-REC
CREATE TABLE IF NOT EXISTS public.irec_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category VARCHAR(50) NOT NULL, -- 'brazil', 'latam', 'asia_pacific'
  country VARCHAR(100),
  technology VARCHAR(100),
  price_range VARCHAR(100),
  vintage VARCHAR(50),
  observation TEXT,
  trend VARCHAR(100),
  update_date VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS para irec_prices
ALTER TABLE public.irec_prices ENABLE ROW LEVEL SECURITY;

-- Política de leitura pública para irec_prices
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'irec_prices' AND policyname = 'Public read access to irec_prices'
    ) THEN
        CREATE POLICY "Public read access to irec_prices"
        ON public.irec_prices FOR SELECT
        USING (true);
    END IF;
END $$;

-- View para resumo de preços (exemplo: preço médio por categoria)
CREATE OR REPLACE VIEW v_irec_prices_summary AS
SELECT 
  category,
  COUNT(*) as entries,
  MAX(update_date) as last_update
FROM public.irec_prices
GROUP BY category;
