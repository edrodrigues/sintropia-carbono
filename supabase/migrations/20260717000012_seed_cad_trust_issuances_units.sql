INSERT INTO cad_trust_issuances (cad_trust_project_id, issuance_id, issuance_date)
SELECT
  p.id,
  'AGG-' || p.project_id,
  MIN(cc.transaction_date)
FROM cad_trust_projects p
JOIN carbon_credits cc ON cc.project_id = p.project_id
GROUP BY p.id, p.project_id;

INSERT INTO cad_trust_units (
  cad_trust_issuance_id,
  org_uid,
  unit_serial_id,
  unit_start_block,
  unit_end_block,
  unit_count,
  unit_type,
  unit_vintage_year,
  unit_status,
  unit_retirement_detail,
  unit_retirement_beneficiary
)
SELECT
  iss.id,
  p.project_registry_name,
  'CC-' || cc.id,
  '0',
  '0',
  cc.quantity,
  'Reduction',
  cc.vintage,
  CASE
    WHEN cc.transaction_type = 'retirement' THEN 'Retired'
    ELSE 'Issued'
  END,
  cc.retirement_note,
  cc.retirement_beneficiary_harmonized
FROM carbon_credits cc
JOIN cad_trust_projects p ON p.project_id = cc.project_id
JOIN cad_trust_issuances iss ON iss.cad_trust_project_id = p.id;
