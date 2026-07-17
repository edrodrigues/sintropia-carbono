CREATE TABLE cad_trust_co_benefits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cad_trust_project_id UUID NOT NULL REFERENCES cad_trust_projects(id) ON DELETE CASCADE,
  co_benefit_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_cad_trust_co_benefits_project ON cad_trust_co_benefits(cad_trust_project_id);

CREATE TABLE cad_trust_labels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cad_trust_project_id UUID NOT NULL REFERENCES cad_trust_projects(id) ON DELETE CASCADE,
  label_name TEXT NOT NULL,
  label_type TEXT NOT NULL,
  label_link TEXT,
  label_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_cad_trust_labels_project ON cad_trust_labels(cad_trust_project_id);
CREATE INDEX idx_cad_trust_labels_type ON cad_trust_labels(label_type);

ALTER TABLE cad_trust_co_benefits ENABLE ROW LEVEL SECURITY;
ALTER TABLE cad_trust_labels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access for cad_trust_co_benefits"
  ON cad_trust_co_benefits FOR SELECT USING (true);

CREATE POLICY "Public read access for cad_trust_labels"
  ON cad_trust_labels FOR SELECT USING (true);
