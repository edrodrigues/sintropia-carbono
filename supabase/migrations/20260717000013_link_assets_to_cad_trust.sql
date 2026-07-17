UPDATE assets a
SET cad_trust_project_id = p.id
FROM cad_trust_projects p
WHERE LOWER(a.name) = LOWER(p.project_name)
  AND a.cad_trust_project_id IS NULL;

UPDATE assets
SET provider = 'carbonmark'
WHERE provider IS NULL;
