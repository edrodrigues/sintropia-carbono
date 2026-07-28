CREATE TABLE cad_trust_stakeholders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cad_trust_project_id UUID NOT NULL REFERENCES cad_trust_projects(id) ON DELETE CASCADE,
  stakeholder_name TEXT NOT NULL,
  stakeholder_type TEXT NOT NULL,
  stakeholder_link TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_cad_trust_stakeholders_project ON cad_trust_stakeholders(cad_trust_project_id);

ALTER TABLE cad_trust_stakeholders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access for cad_trust_stakeholders"
  ON cad_trust_stakeholders FOR SELECT USING (true);
