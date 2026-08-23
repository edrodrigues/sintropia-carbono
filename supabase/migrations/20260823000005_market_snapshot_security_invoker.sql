-- v_market_snapshot was missing security_invoker=true (unlike its siblings
-- v_normalized_assets / v_price_references_latest, fixed in
-- 20260725191917_views_security_invoker.sql) -- confirmed pre-existing via
-- Supabase security advisors, not introduced by the CREATE OR REPLACE in
-- 20260823000003_market_snapshot_prefer_direct_ratings.sql. Safe to enable:
-- every table this view reads from (assets, price_references, data_sources,
-- cad_trust_ratings, cad_trust_labels) already has an unconditional public
-- SELECT RLS policy, so enforcing RLS as the querying role instead of the
-- view owner's role has no effect on the public Live Markets page.
ALTER VIEW v_market_snapshot SET (security_invoker = true);
