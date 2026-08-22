-- Adds price_references to the supabase_realtime publication so client
-- components can subscribe to postgres_changes (INSERT) and react the moment
-- the ingest-carbonmark / ingest-toucan-klima edge functions write new rows.
--
-- price_references already has a "Public read access" RLS policy (see
-- 20260716000000_assets_price_references.sql), so this only broadcasts rows
-- that are already publicly readable.
alter publication supabase_realtime add table public.price_references;
