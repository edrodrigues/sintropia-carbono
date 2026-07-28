-- v_price_changes estava comparando listings do mesmo ativo no mesmo dia
-- (LAG ordenado por reference_date com empates) gerando variações absurdas.
-- Agora agrega preço por ativo/dia e retorna apenas a variação mais recente
-- de cada ativo (1 linha por ativo).
DROP VIEW v_price_changes;

CREATE VIEW v_price_changes AS
WITH daily AS (
  SELECT
    pr.asset_id,
    (pr.reference_date::date) AS day,
    AVG(pr.price) AS avg_price,
    pr.currency
  FROM price_references pr
  WHERE pr.price IS NOT NULL AND pr.price > 0
  GROUP BY pr.asset_id, (pr.reference_date::date), pr.currency
),
changes AS (
  SELECT
    d.asset_id,
    d.day,
    d.avg_price,
    d.currency,
    LAG(d.avg_price) OVER (PARTITION BY d.asset_id ORDER BY d.day) AS prev_price,
    LAG(d.day) OVER (PARTITION BY d.asset_id ORDER BY d.day) AS prev_day,
    ROW_NUMBER() OVER (PARTITION BY d.asset_id ORDER BY d.day DESC) AS rn
  FROM daily d
)
SELECT
  c.asset_id,
  a.name AS asset_name,
  a.asset_type,
  a.country,
  a.slug,
  a.technology,
  c.currency,
  c.avg_price AS current_price,
  c.day AS current_date,
  c.prev_price AS previous_price,
  c.prev_day AS previous_date,
  ((c.avg_price - c.prev_price) / c.prev_price * 100)::numeric AS change_pct
FROM changes c
JOIN assets a ON a.id = c.asset_id
WHERE c.rn = 1
  AND c.prev_price IS NOT NULL;
