-- Tabela para tracking da drip campaign de emails
-- Substitui o arquivo JSON local que não persiste em múltiplas instâncias
CREATE TABLE IF NOT EXISTS public.drip_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email_type VARCHAR(50) NOT NULL, -- 'welcome', 'carbon_credits', 'irec', 'community', 'action'
  email_sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status VARCHAR(20) NOT NULL DEFAULT 'sent', -- 'sent', 'failed', 'bounced'
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, email_type)
);

-- Index para consultas frequentes
CREATE INDEX IF NOT EXISTS idx_drip_tracking_user_id ON public.drip_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_drip_tracking_email_type ON public.drip_tracking(email_type);

-- RLS
ALTER TABLE public.drip_tracking ENABLE ROW LEVEL SECURITY;

-- Política: admins podem ver tudo
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'drip_tracking' AND policyname = 'Admin full access to drip_tracking'
  ) THEN
    CREATE POLICY "Admin full access to drip_tracking"
    ON public.drip_tracking FOR ALL
    USING (
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
      )
    );
  END IF;
END $$;
