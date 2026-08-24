-- Append three more CAD Trust fields to v_market_snapshot: a third rating
-- agency (Renoster, already anticipated by RATING_AGENCIES in
-- market-listing-options.ts but never wired into CadTrustScore), and the
-- project developer / methodology now captured by ingest-cadtrust-ratings
-- (via cad_trust_projects.proponent / project_methodology).
--
-- Per the append-only convention established in
-- 20260823000003_market_snapshot_prefer_direct_ratings.sql and
-- 20260823000007_market_snapshot_cad_trust_project_fields.sql, new columns
-- are added at the end only -- CREATE OR REPLACE VIEW cannot reorder or
-- rename existing columns.
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
  loc.country AS cad_trust_location_country,
  r3.rating_value AS rating_renoster,
  p.proponent AS cad_trust_developer,
  p.project_methodology AS cad_trust_methodology
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
LEFT JOIN LATERAL (
  SELECT rating_value FROM cad_trust_ratings
  WHERE cad_trust_project_id = a.cad_trust_project_id AND rating_name = 'Renoster'
  ORDER BY (rating_source = 'direct') DESC
  LIMIT 1
) r3 ON true
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
