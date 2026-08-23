-- v_market_snapshot picked one row per (project, rating_name) via a flat
-- LEFT JOIN. Now that cad_trust_ratings can hold both a 'direct' row (e.g.
-- straight from Sylvera's own API) and a 'cadtrust' row (mirrored via the
-- CAD Trust Observer API) for the same rating_name, that flat join would
-- fan out into duplicate snapshot rows whenever both exist for a project.
-- Replace it with a LATERAL pick per rating that prefers 'direct' and falls
-- back to 'cadtrust' when no direct rating is available.
--
-- NOTE: the live view (confirmed via pg_get_viewdef before writing this)
-- also selects ds.source_url, positioned right after ds.source_name -- this
-- repo's copy of 20260718000000_market_snapshot_dedup_and_cad_trust.sql
-- does not have it at all (same class of drift already called out in
-- 20260822000001_schedule_ingest_toucan_klima.sql for a different
-- migration). Postgres's CREATE OR REPLACE VIEW only allows NEW columns to
-- be appended at the end, not inserted mid-list, so replaying this
-- migration against this repo's (source_url-less) checked-in baseline
-- requires source_url to go last here, not in its actual live position.
-- Live itself was migrated with source_url kept in its original position
-- (applied directly, verified working) -- column order has no effect on
-- named-column consumers (Supabase-js, PostgREST), so this local-replay
-- vs. live ordering difference is cosmetic only.
CREATE OR REPLACE VIEW v_market_snapshot AS
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
  ds.source_url
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
WHERE pr.id IN (
  SELECT DISTINCT ON (asset_id) id
  FROM price_references
  ORDER BY asset_id, reference_date DESC
);
