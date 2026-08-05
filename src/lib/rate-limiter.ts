import { createHash } from "crypto";

import { createClient } from "@/lib/supabase/server";
import { logger } from "@/lib/utils/logger";

/**
 * Persistent rate limiting for auth endpoints.
 *
 * Backed by the `consume_rate_limit` SQL function (see the rate_limits
 * migration) because the previous implementation kept counters in a
 * module-level Map. Every serverless instance had its own Map, so the limit was
 * effectively multiplied by the number of warm instances and reset on each cold
 * start.
 */

export const DEFAULT_WINDOW_SECONDS = 60;
export const DEFAULT_MAX_REQUESTS = 5;

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  /** Seconds until the current window rolls over. */
  resetIn: number;
}

interface RateLimitOptions {
  maxRequests?: number;
  windowSeconds?: number;
}

/**
 * Build a bucket key from an action name and a client identifier.
 *
 * The identifier (usually an IP address) is hashed: it is personal data, and the
 * limiter only ever needs equality, never the original value.
 */
export function buildRateLimitKey(action: string, identifier: string): string {
  const digest = createHash("sha256").update(identifier).digest("base64url").slice(0, 32);
  return `auth:${action}:${digest}`;
}

/**
 * Consume one unit from `key`'s budget.
 *
 * Fails CLOSED: if the limiter cannot be reached we deny the request rather than
 * silently letting unlimited traffic through, since these buckets guard
 * credential endpoints.
 */
export async function checkRateLimit(
  key: string,
  options?: RateLimitOptions,
): Promise<RateLimitResult> {
  const maxRequests = options?.maxRequests ?? DEFAULT_MAX_REQUESTS;
  const windowSeconds = options?.windowSeconds ?? DEFAULT_WINDOW_SECONDS;

  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .rpc("consume_rate_limit", {
        p_key: key,
        p_max_requests: maxRequests,
        p_window_seconds: windowSeconds,
      })
      .single();

    if (error || !data) {
      logger.error("Rate limiter indisponível; negando requisição", { error, key });
      return { allowed: false, remaining: 0, resetIn: windowSeconds };
    }

    return {
      allowed: data.allowed,
      remaining: data.remaining,
      resetIn: data.reset_in_seconds,
    };
  }
  catch (error) {
    logger.error("Erro inesperado no rate limiter; negando requisição", { error, key });
    return { allowed: false, remaining: 0, resetIn: windowSeconds };
  }
}
