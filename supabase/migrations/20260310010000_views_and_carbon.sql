-- View para dashboard de I-RECs com métricas pré-calculadas por Região
CREATE OR REPLACE VIEW v_irec_dashboard AS
SELECT 
  region,
  COUNT(*) as total_stakeholders,
  SUM(volume_2024) as total_volume_2024,
  SUM(volume_2025) as total_volume_2025,
  SUM(volume_2026) as total_volume_2026,
  AVG(delta_pct) as crescimento_medio,
  CASE 
    WHEN SUM(volume_2024) > 0 THEN (SUM(volume_2025) - SUM(volume_2024))::float / SUM(volume_2024) * 100 
    ELSE 0 
  END as crescimento_pct
FROM public.irec_stakeholders
GROUP BY region;

-- View para ranking de I-RECs por setor
CREATE OR REPLACE VIEW v_irec_by_setor AS
SELECT 
  setor,
  COUNT(*) as empresas,
  SUM(volume_2024) as volume_2024,
  SUM(volume_2025) as volume_2025,
  SUM(volume_2026) as volume_2026,
  AVG(delta_pct) as crescimento_medio
FROM public.irec_stakeholders
GROUP BY setor
ORDER BY volume_2025 DESC;

-- Tabela para Carbon Stakeholders (Brasil e Mundo)
CREATE TABLE IF NOT EXISTS public.carbon_stakeholders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ranking INTEGER NOT NULL,
  region VARCHAR(20) NOT NULL DEFAULT 'brazil', -- 'brazil' ou 'world'
  empresa VARCHAR(255) NOT NULL,
  setor VARCHAR(100),
  volume_2024 DECIMAL(10,2), -- Em Milhões de tCO2e
  volume_2025 DECIMAL(10,2), -- Em Milhões de tCO2e
  delta_pct DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(ranking, region)
);

-- RLS para carbon_stakeholders
ALTER TABLE public.carbon_stakeholders ENABLE ROW LEVEL SECURITY;

-- Política de leitura pública para carbon_stakeholders
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'carbon_stakeholders' AND policyname = 'Public read access to carbon_stakeholders'
    ) THEN
        CREATE POLICY "Public read access to carbon_stakeholders"
        ON public.carbon_stakeholders FOR SELECT
        USING (true);
    END IF;
END $$;

-- View para dashboard de Carbono por Região
CREATE OR REPLACE VIEW v_carbon_dashboard AS
SELECT 
  region,
  COUNT(*) as total_stakeholders,
  SUM(volume_2024) as total_volume_2024,
  SUM(volume_2025) as total_volume_2025,
  AVG(delta_pct) as crescimento_medio,
  CASE 
    WHEN SUM(volume_2024) > 0 THEN (SUM(volume_2025) - SUM(volume_2024))::float / SUM(volume_2024) * 100 
    ELSE 0 
  END as crescimento_pct
FROM public.carbon_stakeholders
GROUP BY region;
