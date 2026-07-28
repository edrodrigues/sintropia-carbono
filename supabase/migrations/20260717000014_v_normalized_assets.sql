CREATE OR REPLACE VIEW v_normalized_assets AS
WITH latest_price AS (
  SELECT DISTINCT ON (asset_id)
    id, asset_id, price, local_price, local_currency, volume,
    price_display, price_high, price_low, currency, unit,
    vintage_year, reference_date, reference_type, fetched_at, data_source_id
  FROM price_references
  ORDER BY asset_id, reference_date DESC
)
SELECT
  a.id,
  a.provider,
  a.external_id,
  a.asset_type,
  a.name,
  p.project_registry_name AS registry,
  l.country AS country_of_origin,
  u.unit_vintage_year AS vintage,
  lp.price AS base_price_usd,
  lp.local_price,
  lp.local_currency,
  lp.volume AS liquidity_available,
  r.rating_value AS rating_bezero,
  r2.rating_value AS rating_sylvera,
  COALESCE(
    (SELECT EXISTS(
      SELECT 1 FROM cad_trust_labels cl
      WHERE cl.cad_trust_project_id = p.id
        AND cl.label_type = 'CCP'
    )),
    FALSE
  ) AS is_ccp_aligned,
  a.updated_at AS last_updated,
  a.slug,
  a.registry AS legacy_registry,
  a.country AS legacy_country,
  a.technology,
  a.project_category,
  a.methodology,
  a.description,
  a.is_active,
  lp.price_display,
  lp.price_high,
  lp.price_low,
  lp.currency,
  lp.unit,
  lp.vintage_year AS price_vintage_year,
  lp.reference_date,
  lp.reference_type,
  lp.fetched_at,
  ds.source_name
FROM assets a
LEFT JOIN cad_trust_projects p ON p.id = a.cad_trust_project_id
LEFT JOIN cad_trust_locations l ON l.cad_trust_project_id = p.id
LEFT JOIN cad_trust_issuances iss ON iss.cad_trust_project_id = p.id
LEFT JOIN cad_trust_units u ON u.cad_trust_issuance_id = iss.id
LEFT JOIN latest_price lp ON lp.asset_id = a.id
LEFT JOIN cad_trust_ratings r ON r.cad_trust_project_id = p.id AND r.rating_name = 'BeZero'
LEFT JOIN cad_trust_ratings r2 ON r2.cad_trust_project_id = p.id AND r2.rating_name = 'Sylvera'
LEFT JOIN data_sources ds ON ds.id = lp.data_source_id;
