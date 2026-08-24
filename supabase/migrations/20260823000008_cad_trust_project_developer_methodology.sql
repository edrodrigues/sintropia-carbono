-- CAD Trust's live Observer API returns methodology/methodology2 per project
-- (e.g. "CDM - AR-ACM0003") that ingest-cadtrust-ratings previously discarded.
-- cad_trust_projects has no dedicated column for either, so add two flat text
-- columns matching the table's existing style (project_sector, project_type,
-- etc.) rather than routing through the separate cad_trust_methodologies
-- join tables, which model versioned methodology metadata CAD Trust's feed
-- doesn't actually give us here.
--
-- proponent already exists on this table (unused legacy CSV-seed column) and
-- is repurposed to hold CAD Trust's projectDeveloper field, consistent with
-- this pipeline's existing pattern of live data overwriting the one-time seed.
ALTER TABLE cad_trust_projects
  ADD COLUMN project_methodology TEXT,
  ADD COLUMN project_methodology_secondary TEXT;

-- Required as the onConflict target for upsertLocations() in
-- ingest-cadtrust-ratings, which will now populate cad_trust_locations from
-- CAD Trust's projectLocations on every sync (previously only ever populated
-- by the one-time 2026-07-17 CSV seed, going stale for every project
-- discovered since). A project can legitimately have multiple locations, so
-- the natural key is (project, country), not (project) alone.
CREATE UNIQUE INDEX idx_cad_trust_locations_project_country
  ON cad_trust_locations(cad_trust_project_id, country);
