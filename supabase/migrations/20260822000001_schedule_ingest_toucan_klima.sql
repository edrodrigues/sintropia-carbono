-- Schedule the ingest-toucan-klima edge function to run every 6 hours.
--
-- Mirrors tasks.trigger_ingest_carbonmark() as it actually exists in
-- production today (inspected live via the Supabase MCP), NOT the
-- vault-secret-based version in 20260716000001_schedule_ingest_carbonmark.sql
-- in this repo's history -- that version was superseded remotely by a
-- migration ("fix_carbonmark_ingest_vault_and_cron") that isn't in this
-- repo. The working version hardcodes the project URL and sends no
-- Authorization header at all, relying on the target function being
-- deployed with verify_jwt=false (as ingest-carbonmark and
-- ingest-toucan-klima both are).
create or replace function tasks.trigger_ingest_toucan_klima()
returns void
language plpgsql
security definer
set search_path to 'tasks', 'public', 'net'
as $$
begin
  perform net.http_post(
    url := 'https://tashftatbucseafjlfdw.supabase.co/functions/v1/ingest-toucan-klima',
    headers := jsonb_build_object('Content-Type', 'application/json'),
    body := '{}'::jsonb,
    timeout_milliseconds := 120000
  );
end;
$$;

select cron.schedule(
  'ingest-toucan-klima',
  '0 */6 * * *',
  'select tasks.trigger_ingest_toucan_klima();'
);
