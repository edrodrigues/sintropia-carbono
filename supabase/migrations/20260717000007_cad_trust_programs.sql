CREATE TABLE cad_trust_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_name TEXT NOT NULL,
  program_registry TEXT NOT NULL,
  program_registry_id TEXT,
  program_description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE cad_trust_programs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access for cad_trust_programs"
  ON cad_trust_programs FOR SELECT USING (true);
