ALTER TABLE assets
  ADD COLUMN provider TEXT,
  ADD COLUMN external_id TEXT,
  ADD COLUMN cad_trust_project_id UUID REFERENCES cad_trust_projects(id);

CREATE UNIQUE INDEX idx_assets_provider_external
  ON assets (provider, external_id)
  WHERE provider IS NOT NULL AND external_id IS NOT NULL;

CREATE INDEX idx_assets_cad_trust_project ON assets(cad_trust_project_id);
