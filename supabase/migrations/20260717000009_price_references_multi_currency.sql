ALTER TABLE price_references
  ADD COLUMN local_price NUMERIC,
  ADD COLUMN local_currency TEXT;
