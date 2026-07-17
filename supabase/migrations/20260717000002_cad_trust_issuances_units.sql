CREATE TABLE cad_trust_issuances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cad_trust_project_id UUID NOT NULL REFERENCES cad_trust_projects(id) ON DELETE CASCADE,
  issuance_id TEXT NOT NULL,
  issuance_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_cad_trust_issuances_project ON cad_trust_issuances(cad_trust_project_id);

CREATE TABLE cad_trust_units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cad_trust_issuance_id UUID NOT NULL REFERENCES cad_trust_issuances(id) ON DELETE CASCADE,
  org_uid TEXT NOT NULL,
  unit_serial_id TEXT NOT NULL,
  unit_start_block TEXT,
  unit_end_block TEXT,
  unit_count NUMERIC(20,2),
  unit_type TEXT,
  unit_vintage_year INTEGER NOT NULL,
  unit_status TEXT DEFAULT 'Issued',
  unit_status_reason TEXT,
  unit_status_date DATE,
  unit_retirement_detail TEXT,
  unit_retirement_beneficiary TEXT,
  unit_link TEXT,
  unit_metric TEXT DEFAULT 'tCO2e',
  unit_current_owner TEXT,
  unit_itmos_reference_id TEXT,
  marketplace TEXT,
  marketplace_link TEXT,
  marketplace_identifier TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_cad_trust_units_issuance ON cad_trust_units(cad_trust_issuance_id);
CREATE INDEX idx_cad_trust_units_vintage ON cad_trust_units(unit_vintage_year);
CREATE INDEX idx_cad_trust_units_status ON cad_trust_units(unit_status);
CREATE INDEX idx_cad_trust_units_type ON cad_trust_units(unit_type);

ALTER TABLE cad_trust_issuances ENABLE ROW LEVEL SECURITY;
ALTER TABLE cad_trust_units ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access for cad_trust_issuances"
  ON cad_trust_issuances FOR SELECT USING (true);

CREATE POLICY "Public read access for cad_trust_units"
  ON cad_trust_units FOR SELECT USING (true);
