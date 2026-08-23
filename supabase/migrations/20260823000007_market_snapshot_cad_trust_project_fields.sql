-- Add CAD Trust project verification fields to v_market_snapshot: project
-- status, the official registry link (e.g. Verra), and issuance/retirement
-- counts, joined via assets.cad_trust_project_id -> cad_trust_projects. This
-- is independent of the cad_trust_ratings pipeline (BeZero/Sylvera), which
-- is populated separately and can remain empty without affecting these
-- fields. New columns are appended at the end, per the append-only
-- convention established in 20260823000003_market_snapshot_prefer_direct_ratings.sql.
--
-- NOTE: same class of local-vs-live column-order drift as 20260823000003
-- called out. Live's pre-existing v_market_snapshot has source_url right
-- after source_name (confirmed by CREATE OR REPLACE VIEW rejecting this
-- migration until matched: "cannot change name of view column
-- 'source_url' to 'rating_bezero'"), so the migration actually applied to
-- live selects source_url there. This repo's replayed baseline (003) puts
-- source_url last instead, so this file keeps it last too -- otherwise
-- PGlite replay (scripts/verify-migrations.cjs) would hit the identical
-- "cannot change name of view column" error against the local baseline.
-- Column order has no effect on named-column consumers (Supabase-js,
-- PostgREST), so this is cosmetic only, same as 003.
CREATE OR REPLACE VIEW v_market_snapshot
WITH (security_invoker = true) AS
SELECT
  pr.asset_id,
  a.name AS asset_name,
  a.asset_type,
  a.country,
  a.slug,
  a.registry,
  a.technology,
  a.project_category,
  pr.id AS price_id,
  pr.price,
  pr.price_display,
  pr.price_high,
  pr.price_low,
  pr.currency,
  pr.unit,
  pr.vintage_year,
  pr.volume,
  pr.reference_date,
  pr.reference_type,
  pr.fetched_at,
  ds.source_name,
  r.rating_value AS rating_bezero,
  r2.rating_value AS rating_sylvera,
  COALESCE(
    (SELECT EXISTS(
      SELECT 1 FROM cad_trust_labels cl
      WHERE cl.cad_trust_project_id = a.cad_trust_project_id
        AND cl.label_type = 'CCP'
    )),
    FALSE
  ) AS is_ccp_aligned,
  ds.source_url,
  p.project_status AS cad_trust_project_status,
  p.project_link AS cad_trust_project_link,
  p.issued AS cad_trust_units_issued,
  p.retired AS cad_trust_units_retired,
  loc.country AS cad_trust_location_country
FROM price_references pr
JOIN assets a ON a.id = pr.asset_id
LEFT JOIN data_sources ds ON ds.id = pr.data_source_id
LEFT JOIN LATERAL (
  SELECT rating_value FROM cad_trust_ratings
  WHERE cad_trust_project_id = a.cad_trust_project_id AND rating_name = 'BeZero'
  ORDER BY (rating_source = 'direct') DESC
  LIMIT 1
) r ON true
LEFT JOIN LATERAL (
  SELECT rating_value FROM cad_trust_ratings
  WHERE cad_trust_project_id = a.cad_trust_project_id AND rating_name = 'Sylvera'
  ORDER BY (rating_source = 'direct') DESC
  LIMIT 1
) r2 ON true
LEFT JOIN cad_trust_projects p ON p.id = a.cad_trust_project_id
LEFT JOIN LATERAL (
  SELECT country FROM cad_trust_locations
  WHERE cad_trust_project_id = a.cad_trust_project_id
  ORDER BY created_at ASC
  LIMIT 1
) loc ON true
WHERE pr.id IN (
  SELECT DISTINCT ON (asset_id) id
  FROM price_references
  ORDER BY asset_id, reference_date DESC
);
