-- Reconcile carbon_stakeholders with the live schema.
--
-- 20260310010000_views_and_carbon.sql creates carbon_stakeholders WITHOUT
-- volume_2026 and delta_num, but:
--   * the view in that same migration selects SUM(volume_2026)
--   * 20260608000001_update_stakeholders_data.sql INSERTs into both columns
--
-- Both columns exist in the live database (they are present in the generated
-- types), so they were added by hand and never captured here. Replaying this
-- repository against an empty database therefore fails partway through.
--
-- Add them idempotently, before the migration that depends on them. The types
-- match the neighbouring volume columns.

ALTER TABLE public.carbon_stakeholders
  ADD COLUMN IF NOT EXISTS volume_2026 DECIMAL(10,2);

ALTER TABLE public.carbon_stakeholders
  ADD COLUMN IF NOT EXISTS delta_num DECIMAL(10,2);
