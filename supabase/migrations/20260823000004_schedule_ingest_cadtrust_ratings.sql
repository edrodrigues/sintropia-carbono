-- Schedule the ingest-cadtrust-ratings edge function to run once daily.
-- Mirrors tasks.trigger_ingest_toucan_klima() (see
-- 20260822000001_schedule_ingest_toucan_klima.sql): hardcoded project URL,
-- no Authorization header, relies on the function being deployed with
-- verify_jwt=false. Scheduled at 05:00 UTC -- checked cron.job live first:
-- existing slots are 02:30 (refresh-price-series), 03:00
-- (cleanup-old-price-references), 04:00 (ingest-carbonmark), 06:00
-- (sync-resend-audience), plus */6h (ingest-toucan-klima at 00/06/12/18) --
-- 05:00 is the free slot between ingest-carbonmark and sync-resend-audience.
create or replace function tasks.trigger_ingest_cadtrust_ratings()
returns void
language plpgsql
security definer
set search_path to 'tasks', 'public', 'net'
as $$
begin
  perform net.http_post(
    url := 'https://tashftatbucseafjlfdw.supabase.co/functions/v1/ingest-cadtrust-ratings',
    headers := jsonb_build_object('Content-Type', 'application/json'),
    body := '{}'::jsonb,
    timeout_milliseconds := 180000
  );
end;
$$;

select cron.schedule(
  'ingest-cadtrust-ratings',
  '0 5 * * *',
  'select tasks.trigger_ingest_cadtrust_ratings();'
);
