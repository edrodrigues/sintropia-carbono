-- Enable pg_cron extension if not already enabled
-- Note: This requires the extension to be available in your Supabase project (Project Settings -> Database -> Extensions)
create extension if not exists pg_cron;

-- Enable net extension for HTTP requests
create extension if not exists net;

-- Create a schema for our scheduled tasks if it doesn't exist
create schema if not exists tasks;

-- Function to call the sync-contacts edge function
create or replace function tasks.trigger_sync_contacts()
returns void as $$
begin
  perform net.http_post(
    url := (select value from vault.decrypted_secrets where name = 'SUPABASE_URL') || '/functions/v1/sync-contacts',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || (select value from vault.decrypted_secrets where name = 'SUPABASE_SERVICE_ROLE_KEY'),
      'Content-Type', 'application/json'
    ),
    body := '{}'
  );
end;
$$ language plpgsql security definer;

-- Function to call the send-newsletter edge function
create or replace function tasks.trigger_send_newsletter()
returns void as $$
begin
  perform net.http_post(
    url := (select value from vault.decrypted_secrets where name = 'SUPABASE_URL') || '/functions/v1/send-newsletter',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || (select value from vault.decrypted_secrets where name = 'SUPABASE_SERVICE_ROLE_KEY'),
      'Content-Type', 'application/json'
    ),
    body := '{}'
  );
end;
$$ language plpgsql security definer;

-- Placeholder for resetting weekly missions
create or replace function tasks.reset_weekly_missions()
returns void as $$
begin
  -- Here we would update the users_missions table or similar
  -- update profiles set weekly_karma = 0;
  raise notice 'Weekly missions reset logic goes here';
end;
$$ language plpgsql security definer;

-- Schedule the sync-contacts task to run daily at 02:00 AM
select cron.schedule(
  'sync-resend-contacts',
  '0 2 * * *',
  'select tasks.trigger_sync_contacts();'
);

-- Schedule the newsletter task to run every Monday at 08:00 AM
select cron.schedule(
  'send-weekly-newsletter',
  '0 8 * * 1',
  'select tasks.trigger_send_newsletter();'
);

-- Schedule the weekly missions reset to run every Sunday at 23:59 PM
select cron.schedule(
  'reset-weekly-missions',
  '59 23 * * 0',
  'select tasks.reset_weekly_missions();'
);
