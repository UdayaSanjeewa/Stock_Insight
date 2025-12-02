/*
  # Setup Daily Stock Updates

  1. Configuration
    - Enable pg_cron extension for scheduled jobs
    - Create function to trigger Edge Function
    - Schedule daily updates at market close (4:30 PM ET = 9:30 PM UTC)

  2. Important Notes
    - Uses pg_net to make HTTP requests to Edge Function
    - Runs automatically every weekday at 9:30 PM UTC
    - Edge Function handles the actual data fetching from Yahoo Finance
*/

-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable pg_net extension for HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Create function to call the Edge Function
CREATE OR REPLACE FUNCTION trigger_stock_update()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  request_id bigint;
  supabase_url text;
BEGIN
  supabase_url := current_setting('app.settings.supabase_url', true);
  
  IF supabase_url IS NULL THEN
    supabase_url := 'https://0ec90b57d6e95fcbda19832f.supabase.co';
  END IF;

  SELECT extensions.http_post(
    url := supabase_url || '/functions/v1/update-stock-data',
    headers := jsonb_build_object(
      'Content-Type', 'application/json'
    ),
    body := '{}'::jsonb
  ) INTO request_id;
  
  RAISE NOTICE 'Stock update triggered with request_id: %', request_id;
END;
$$;

-- Schedule the job to run daily at 9:30 PM UTC (4:30 PM ET, after market close)
-- Only run on weekdays (Monday-Friday)
SELECT cron.schedule(
  'daily-stock-update',
  '30 21 * * 1-5',
  $$SELECT trigger_stock_update();$$
);