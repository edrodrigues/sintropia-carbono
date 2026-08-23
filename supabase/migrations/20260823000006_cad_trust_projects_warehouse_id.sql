-- cad_trust_projects was seeded from a one-time CSV import whose project_id
-- values are partially garbage and, even where well-formed, barely overlap
-- with what our own `assets` reference. warehouse_project_id is CAD Trust's
-- own stable identifier for a project -- used as the upsert key for the live
-- daily sync in ingest-cadtrust-ratings, so re-running it correctly updates
-- the same row instead of accumulating duplicates.
--
-- A plain (non-partial) UNIQUE constraint is required here, not a partial
-- index: PostgREST's upsert onConflict=warehouse_project_id generates a bare
-- `ON CONFLICT (warehouse_project_id)`, which only matches a full unique
-- constraint/index as its arbiter -- a partial index needs a matching WHERE
-- clause in the ON CONFLICT clause itself, which PostgREST doesn't emit.
-- This is safe for the ~7.7k existing rows (all NULL today): a standard
-- UNIQUE constraint allows any number of NULLs, only non-NULL values must
-- be distinct.
ALTER TABLE cad_trust_projects
  ADD COLUMN warehouse_project_id TEXT;

ALTER TABLE cad_trust_projects
  ADD CONSTRAINT cad_trust_projects_warehouse_project_id_key UNIQUE (warehouse_project_id);
