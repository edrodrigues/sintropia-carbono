type LogLevel = "info" | "warn" | "error";

interface LogPayload {
  message: string;
  level: LogLevel;
  timestamp: string;
  [key: string]: unknown;
}

function log(level: LogLevel, message: string, context?: Record<string, unknown>) {
  const entry: LogPayload = {
    message,
    level,
    timestamp: new Date().toISOString(),
    ...context,
  };

  const prefix = `[${level.toUpperCase()}]`;

  switch (level) {
    case "error":
      console.error(prefix, message, entry);
      break;
    case "warn":
      console.warn(prefix, message, entry);
      break;
    case "info":
      if (process.env.NODE_ENV !== "production") {
        console.log(prefix, message, entry);
      }
      break;
  }
}

export const logger = {
  info: (message: string, context?: Record<string, unknown>) => log("info", message, context),
  warn: (message: string, context?: Record<string, unknown>) => log("warn", message, context),
  error: (message: string, context?: Record<string, unknown>) => log("error", message, context),
};
