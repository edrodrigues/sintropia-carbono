-- Persistent, atomic rate limiting for auth endpoints.
--
-- Replaces an in-process Map in src/lib/rate-limiter.ts. On Vercel every
-- serverless instance held its own counter, so the "5 requests per minute"
-- limit on login / signup / password-reset was multiplied by the number of warm
-- instances and reset on every cold start. Brute-force protection was
-- effectively absent.
--
-- Counting happens inside a single SQL function so concurrent requests cannot
-- interleave a read-modify-write and overshoot the limit.

CREATE TABLE IF NOT EXISTS public.rate_limits (
  -- Bucket identity, e.g. 'auth:login:203.0.113.7'. Hashed by the caller when
  -- it contains anything user-identifying.
  key TEXT PRIMARY KEY,
  count INTEGER NOT NULL DEFAULT 0,
  -- Start of the current fixed window.
  window_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Supports the sweep of expired buckets.
CREATE INDEX IF NOT EXISTS idx_rate_limits_window_start
  ON public.rate_limits (window_start);

ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- No policies: the table is reachable only through the SECURITY DEFINER
-- function below, never directly from anon/authenticated clients. RLS with zero
-- policies denies all direct access by default.

-- Atomically consume one unit from a bucket.
--
-- Returns the post-increment state. `allowed` is false once the window's budget
-- is spent. A window older than p_window_seconds is reset rather than extended
-- (fixed window, not sliding).
CREATE OR REPLACE FUNCTION public.consume_rate_limit(
  p_key TEXT,
  p_max_requests INTEGER,
  p_window_seconds INTEGER
)
RETURNS TABLE (
  allowed BOOLEAN,
  remaining INTEGER,
  reset_in_seconds INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_now TIMESTAMPTZ := NOW();
  v_window_start TIMESTAMPTZ;
  v_count INTEGER;
BEGIN
  IF p_max_requests IS NULL OR p_max_requests < 1 THEN
    RAISE EXCEPTION 'p_max_requests must be >= 1';
  END IF;

  IF p_window_seconds IS NULL OR p_window_seconds < 1 THEN
    RAISE EXCEPTION 'p_window_seconds must be >= 1';
  END IF;

  -- One statement, so two concurrent callers serialize on the primary key
  -- instead of both reading a stale count.
  INSERT INTO public.rate_limits AS rl (key, count, window_start, updated_at)
  VALUES (p_key, 1, v_now, v_now)
  ON CONFLICT (key) DO UPDATE
    SET
      count = CASE
        WHEN rl.window_start < v_now - MAKE_INTERVAL(secs => p_window_seconds)
          THEN 1
        ELSE rl.count + 1
      END,
      window_start = CASE
        WHEN rl.window_start < v_now - MAKE_INTERVAL(secs => p_window_seconds)
          THEN v_now
        ELSE rl.window_start
      END,
      updated_at = v_now
  RETURNING rl.count, rl.window_start INTO v_count, v_window_start;

  RETURN QUERY SELECT
    v_count <= p_max_requests,
    GREATEST(p_max_requests - v_count, 0),
    GREATEST(
      CEIL(
        EXTRACT(
          EPOCH FROM (v_window_start + MAKE_INTERVAL(secs => p_window_seconds) - v_now)
        )
      )::INTEGER,
      0
    );
END;
$$;

-- Callable by unauthenticated visitors: login and signup must be rate limited
-- before a session exists.
GRANT EXECUTE ON FUNCTION public.consume_rate_limit(TEXT, INTEGER, INTEGER)
  TO anon, authenticated, service_role;

-- Housekeeping: drop buckets that can no longer deny anything. Safe to call
-- from cron; the limiter does not depend on it.
CREATE OR REPLACE FUNCTION public.prune_rate_limits(p_older_than_seconds INTEGER DEFAULT 86400)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_deleted INTEGER;
BEGIN
  DELETE FROM public.rate_limits
  WHERE window_start < NOW() - MAKE_INTERVAL(secs => p_older_than_seconds);

  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$$;

REVOKE ALL ON FUNCTION public.prune_rate_limits(INTEGER) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.prune_rate_limits(INTEGER) TO service_role;

-- Sweep stale buckets daily. Uses the same pg_cron setup as the other
-- scheduled tasks (see 20260305000000_setup_cron.sql). Idempotent: unschedule
-- first so re-running the migration does not create a duplicate job.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'prune-rate-limits') THEN
      PERFORM cron.unschedule('prune-rate-limits');
    END IF;

    PERFORM cron.schedule(
      'prune-rate-limits',
      '17 3 * * *',
      $job$SELECT public.prune_rate_limits();$job$
    );
  END IF;
END $$;
