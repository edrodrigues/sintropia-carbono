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
  ds.source_name
FROM price_references pr
JOIN assets a ON a.id = pr.asset_id
LEFT JOIN data_sources ds ON ds.id = pr.data_source_id;

CREATE OR REPLACE VIEW v_price_changes AS
WITH ordered AS (
  SELECT
    pr.asset_id,
    pr.price AS current_price,
    pr.price_display AS current_display,
    pr.reference_date AS current_date,
    pr.currency,
    LAG(pr.price) OVER (PARTITION BY pr.asset_id ORDER BY pr.reference_date) AS previous_price,
    LAG(pr.reference_date) OVER (PARTITION BY pr.asset_id ORDER BY pr.reference_date) AS previous_date
  FROM price_references pr
)
SELECT
  o.asset_id,
  a.name AS asset_name,
  a.asset_type,
  a.country,
  a.slug,
  a.technology,
  o.currency,
  o.current_price,
  o.current_display,
  o.current_date,
  o.previous_price,
  o.previous_date,
  CASE
    WHEN o.previous_price > 0
    THEN ((o.current_price - o.previous_price) / o.previous_price * 100)::numeric
    ELSE NULL
  END AS change_pct
FROM ordered o
JOIN assets a ON a.id = o.asset_id;

CREATE OR REPLACE VIEW price_series AS
SELECT
  asset_id,
  (reference_date::date)::text AS day,
  AVG(price) AS avg_price,
  MIN(price) AS min_price,
  MAX(price) AS max_price,
  COUNT(*) AS sample_count,
  currency,
  unit,
  reference_type
FROM price_references
WHERE reference_date IS NOT NULL
GROUP BY asset_id, (reference_date::date), currency, unit, reference_type;

CREATE OR REPLACE VIEW v_price_references_latest AS
SELECT
  pr.*,
  a.name AS asset_name,
  a.slug AS asset_slug,
  a.asset_type,
  a.country,
  a.technology,
  ds.source_name
FROM price_references pr
JOIN assets a ON a.id = pr.asset_id
LEFT JOIN data_sources ds ON ds.id = pr.data_source_id
WHERE pr.id IN (
  SELECT DISTINCT ON (asset_id) id
  FROM price_references
  ORDER BY asset_id, reference_date DESC
);
