// In-memory rate limiter for auth endpoints
// Note: For multi-instance deployments (Vercel), consider using @upstash/ratelimit
// or a database-backed approach for production-grade rate limiting.

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

const WINDOW_MS = 60 * 1000; // 1 minute window
const MAX_REQUESTS = 5; // 5 attempts per window

function getClientIp(): string {
  // In a serverless environment, get IP from headers
  // This is a best-effort extraction
  try {
    const headers = process.env.NODE_ENV === "development"
      ? undefined
      : undefined;
    // Headers are not available in server actions easily,
    // so we use a synthetic identifier
    return "global";
  } catch {
    return "unknown";
  }
}

export function checkRateLimit(key: string): {
  allowed: boolean;
  remaining: number;
  resetIn: number;
} {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, remaining: MAX_REQUESTS - 1, resetIn: WINDOW_MS };
  }

  if (entry.count >= MAX_REQUESTS) {
    const resetIn = entry.resetAt - now;
    return { allowed: false, remaining: 0, resetIn };
  }

  entry.count++;
  return { allowed: true, remaining: MAX_REQUESTS - entry.count, resetIn: entry.resetAt - now };
}

// Clean up expired entries periodically
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
      if (now > entry.resetAt) {
        store.delete(key);
      }
    }
  }, 60 * 1000);
}
