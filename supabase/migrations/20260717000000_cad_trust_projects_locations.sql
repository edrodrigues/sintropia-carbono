CREATE TABLE cad_trust_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_uid TEXT NOT NULL,
  project_registry_name TEXT NOT NULL,
  project_id TEXT NOT NULL UNIQUE,
  project_crediting_program TEXT,
  project_name TEXT NOT NULL,
  project_description TEXT,
  project_link TEXT,
  project_sector TEXT,
  project_type TEXT,
  project_subtype TEXT,
  project_status TEXT NOT NULL DEFAULT 'Listed',
  project_status_date DATE,
  project_unit_metric TEXT DEFAULT 'tCO2e',
  category TEXT,
  project_type_source TEXT,
  proponent TEXT,
  protocol TEXT,
  is_compliance BOOLEAN DEFAULT FALSE,
  issued INTEGER DEFAULT 0,
  retired INTEGER DEFAULT 0,
  first_issuance_at TIMESTAMP,
  first_retirement_at TIMESTAMP,
  listed_at TIMESTAMP,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_cad_trust_projects_registry ON cad_trust_projects(project_registry_name);
CREATE INDEX idx_cad_trust_projects_status ON cad_trust_projects(project_status);
CREATE INDEX idx_cad_trust_projects_sector ON cad_trust_projects(project_sector);
CREATE INDEX idx_cad_trust_projects_type ON cad_trust_projects(project_type);

CREATE TABLE cad_trust_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cad_trust_project_id UUID NOT NULL REFERENCES cad_trust_projects(id) ON DELETE CASCADE,
  country TEXT NOT NULL,
  in_country_region TEXT,
  geographic_identifier TEXT,
  map_type TEXT,
  map_file_link TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_cad_trust_locations_project ON cad_trust_locations(cad_trust_project_id);
CREATE INDEX idx_cad_trust_locations_country ON cad_trust_locations(country);

ALTER TABLE cad_trust_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE cad_trust_locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access for cad_trust_projects"
  ON cad_trust_projects FOR SELECT USING (true);

CREATE POLICY "Public read access for cad_trust_locations"
  ON cad_trust_locations FOR SELECT USING (true);
