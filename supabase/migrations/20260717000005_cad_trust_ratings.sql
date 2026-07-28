CREATE TABLE cad_trust_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cad_trust_project_id UUID NOT NULL REFERENCES cad_trust_projects(id) ON DELETE CASCADE,
  rating_name TEXT NOT NULL,
  rating_type TEXT,
  rating_value TEXT NOT NULL,
  rating_link TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_cad_trust_ratings_project ON cad_trust_ratings(cad_trust_project_id);
CREATE INDEX idx_cad_trust_ratings_name ON cad_trust_ratings(rating_name);

ALTER TABLE cad_trust_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access for cad_trust_ratings"
  ON cad_trust_ratings FOR SELECT USING (true);
