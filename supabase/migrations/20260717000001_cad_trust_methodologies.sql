CREATE TABLE cad_trust_methodologies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  methodology_code TEXT NOT NULL,
  methodology_name TEXT NOT NULL,
  methodology_version TEXT,
  methodology_date DATE,
  methodology_link TEXT,
  methodology_type TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE cad_trust_project_methodologies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cad_trust_project_id UUID NOT NULL REFERENCES cad_trust_projects(id) ON DELETE CASCADE,
  cad_trust_methodology_id UUID NOT NULL REFERENCES cad_trust_methodologies(id) ON DELETE CASCADE,
  project_methodology_date DATE,
  project_methodology_description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX idx_cad_trust_project_methodologies_unique
  ON cad_trust_project_methodologies(cad_trust_project_id, cad_trust_methodology_id);

ALTER TABLE cad_trust_methodologies ENABLE ROW LEVEL SECURITY;
ALTER TABLE cad_trust_project_methodologies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access for cad_trust_methodologies"
  ON cad_trust_methodologies FOR SELECT USING (true);

CREATE POLICY "Public read access for cad_trust_project_methodologies"
  ON cad_trust_project_methodologies FOR SELECT USING (true);
