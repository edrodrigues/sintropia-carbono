CREATE TABLE cad_trust_validations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cad_trust_project_id UUID NOT NULL REFERENCES cad_trust_projects(id) ON DELETE CASCADE,
  validation_id TEXT,
  validation_type TEXT,
  validation_body TEXT,
  validation_date DATE,
  crediting_period_start_date DATE,
  crediting_period_end_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_cad_trust_validations_project ON cad_trust_validations(cad_trust_project_id);

CREATE TABLE cad_trust_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cad_trust_project_id UUID NOT NULL REFERENCES cad_trust_projects(id) ON DELETE CASCADE,
  cad_trust_validation_id UUID REFERENCES cad_trust_validations(id),
  verification_start_date DATE,
  verification_end_date DATE,
  verification_body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_cad_trust_verifications_project ON cad_trust_verifications(cad_trust_project_id);

ALTER TABLE cad_trust_validations ENABLE ROW LEVEL SECURITY;
ALTER TABLE cad_trust_verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access for cad_trust_validations"
  ON cad_trust_validations FOR SELECT USING (true);

CREATE POLICY "Public read access for cad_trust_verifications"
  ON cad_trust_verifications FOR SELECT USING (true);
