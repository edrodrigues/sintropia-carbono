import { logger } from "./logger";

const SLOW_QUERY_THRESHOLD_MS = 500;

export function logQuery(
  queryName: string,
  duration: number,
  success: boolean,
  error?: unknown,
) {
  const level = !success ? "error" : duration > SLOW_QUERY_THRESHOLD_MS ? "warn" : "info";
  const message = `Query ${queryName} ${success ? "completed" : "failed"}`;

  if (level === "error") {
    logger.error(message, { queryName, success, duration, error: error instanceof Error ? error.message : error });
  } else if (level === "warn") {
    logger.warn(message, { queryName, success, duration });
  } else {
    logger.info(message, { queryName, duration });
  }
}

export async function withMonitoring<T>(
  name: string,
  fn: () => Promise<T>,
): Promise<T> {
  const start = performance.now();
  try {
    const result = await fn();
    logQuery(name, performance.now() - start, true);
    return result;
  } catch (error) {
    logQuery(name, performance.now() - start, false, error);
    throw error;
  }
}
