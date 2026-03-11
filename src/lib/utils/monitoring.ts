// src/lib/utils/monitoring.ts

type LogLevel = 'info' | 'warn' | 'error';

interface LogEntry {
  message: string;
  level: LogLevel;
  timestamp: string;
  context?: Record<string, unknown>;
  duration?: number;
}

export function logQuery(
  queryName: string,
  duration: number,
  success: boolean,
  error?: unknown
) {
  const threshold = 500; // 500ms threshold for "slow" queries
  const level: LogLevel = !success ? 'error' : duration > threshold ? 'warn' : 'info';
  
  const entry: LogEntry = {
    message: `Query ${queryName} ${success ? 'completed' : 'failed'}`,
    level,
    timestamp: new Date().toISOString(),
    duration,
    context: {
      queryName,
      success,
      error: error instanceof Error ? error.message : error,
    }
  };

  // In production, you might send this to a service like Sentry, Axiom, or Datadog
  if (level === 'error') {
    console.error(`[MONITORING][ERROR] ${entry.message}`, entry);
  } else if (level === 'warn') {
    console.warn(`[MONITORING][WARN] ${entry.message} (took ${duration}ms)`, entry);
  } else {
    // Basic info logging (can be disabled in production)
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[MONITORING][INFO] ${entry.message} (took ${duration}ms)`);
    }
  }
}

export async function withMonitoring<T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> {
  const start = performance.now();
  try {
    const result = await fn();
    const duration = performance.now() - start;
    logQuery(name, duration, true);
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    logQuery(name, duration, false, error);
    throw error;
  }
}
