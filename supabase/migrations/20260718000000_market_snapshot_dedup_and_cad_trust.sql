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
  ) AS is_ccp_aligned
FROM price_references pr
JOIN assets a ON a.id = pr.asset_id
LEFT JOIN data_sources ds ON ds.id = pr.data_source_id
LEFT JOIN cad_trust_ratings r
  ON r.cad_trust_project_id = a.cad_trust_project_id
  AND r.rating_name = 'BeZero'
LEFT JOIN cad_trust_ratings r2
  ON r2.cad_trust_project_id = a.cad_trust_project_id
  AND r2.rating_name = 'Sylvera'
WHERE pr.id IN (
  SELECT DISTINCT ON (asset_id) id
  FROM price_references
  ORDER BY asset_id, reference_date DESC
);
