INSERT INTO cad_trust_locations (cad_trust_project_id, country)
SELECT p.id, cp.country
FROM cad_trust_projects p
JOIN carbon_projects cp ON cp.project_id = p.project_id
WHERE cp.country IS NOT NULL AND cp.country != '';
