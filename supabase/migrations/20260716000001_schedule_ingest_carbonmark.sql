-- Schedule the ingest-carbonmark edge function to run every 6 hours
create or replace function tasks.trigger_ingest_carbonmark()
returns void as $$
begin
  perform net.http_post(
    url := (select value from vault.decrypted_secrets where name = 'SUPABASE_URL') || '/functions/v1/ingest-carbonmark',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || (select value from vault.decrypted_secrets where name = 'SUPABASE_SERVICE_ROLE_KEY'),
      'Content-Type', 'application/json'
    ),
    body := '{}'
  );
end;
$$ language plpgsql security definer;

select cron.schedule(
  'ingest-carbonmark',
  '0 */6 * * *',
  'select tasks.trigger_ingest_carbonmark();'
);
