import { NextResponse } from "next/server";
import { spawn } from "child_process";
import path from "path";

import { requireAdminApiAccess } from "@/lib/auth/server";
import { logger } from "@/lib/utils/logger";

export const dynamic = "force-dynamic";

/**
 * Allowlist of runnable maintenance scripts. A request naming anything else is
 * rejected before any process is created; never interpolate request data into
 * the command itself.
 */
const ALLOWED_SCRIPTS = [
  "check-domains.ts",
  "check-new-users.ts",
  "debug-resend.ts",
  "generate-sql.ts",
  "insert-credits.ts",
  "insert-projects.ts",
  "send-drip-emails.ts",
  "send-newsletter.ts",
  "summary-drip.ts",
  "sync-contacts-to-resend.ts",
  "verify-drip-status.ts",
] as const;

type AllowedScript = (typeof ALLOWED_SCRIPTS)[number];

function isAllowedScript(value: unknown): value is AllowedScript {
  return typeof value === "string" && (ALLOWED_SCRIPTS as readonly string[]).includes(value);
}

const SAFE_ARG_REGEX = /^[a-zA-Z0-9@%\-_./\\:]+$/;
const MAX_ARGS = 8;
const MAX_ARG_LENGTH = 200;

/**
 * Environment variables a maintenance script legitimately needs.
 *
 * The handler used to pass the whole of `process.env` to the child, which
 * exposed every secret in the deployment to any script on the allowlist and to
 * anything those scripts transitively executed. Forward only these.
 */
const FORWARDED_ENV_KEYS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "RESEND_API_KEY",
  "NODE_ENV",
  "PATH",
  "HOME",
  "SystemRoot",
  "APPDATA",
] as const;

/** Hard stop for a runaway script, so a request cannot pin a worker forever. */
const SCRIPT_TIMEOUT_MS = 5 * 60 * 1000;

function buildChildEnv(): NodeJS.ProcessEnv {
  // Built as a plain record then widened: ProcessEnv declares NODE_ENV as a
  // required readonly key, which an allowlisted subset cannot satisfy.
  const env: Record<string, string> = {};
  for (const key of FORWARDED_ENV_KEYS) {
    const value = process.env[key];
    if (value !== undefined) {
      env[key] = value;
    }
  }
  return env as NodeJS.ProcessEnv;
}

function sanitizeArgs(args: unknown): string[] {
  if (!Array.isArray(args)) return [];
  return args
    .filter(
      (a): a is string =>
        typeof a === "string"
        && a.length > 0
        && a.length <= MAX_ARG_LENGTH
        && SAFE_ARG_REGEX.test(a),
    )
    .slice(0, MAX_ARGS);
}

export async function POST(request: Request) {
  let script = "";
  try {
    const access = await requireAdminApiAccess();
    if (!access.ok) {
      return access.response;
    }

    const body = await request.json();
    const rawArgs = body?.args;
    const args = sanitizeArgs(rawArgs);

    if (!isAllowedScript(body?.script)) {
      return new NextResponse("Invalid script", { status: 400 });
    }
    script = body.script;

    // Resolve, then confirm the result is still inside scripts/. `script` comes
    // from the allowlist so this cannot currently escape, but the check keeps
    // that guarantee local rather than depending on the list staying clean.
    const scriptsDir = path.join(process.cwd(), "scripts");
    const scriptPath = path.join(scriptsDir, script);
    if (path.relative(scriptsDir, scriptPath).startsWith("..")) {
      return new NextResponse("Invalid script", { status: 400 });
    }

    // warn, not info: logger.info is silenced in production and this is an
    // audit record of a privileged execution.
    logger.warn("Executando script administrativo", {
      script,
      argCount: args.length,
      userId: access.user.id,
    });

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        const child = spawn("npx", ["tsx", scriptPath, ...args], {
          env: buildChildEnv(),
          cwd: process.cwd(),
          shell: false,
        });

        let settled = false;

        const finish = (message: string) => {
          if (settled) return;
          settled = true;
          clearTimeout(timer);
          controller.enqueue(encoder.encode(`${message}\n\n`));
          controller.close();
        };

        const timer = setTimeout(() => {
          child.kill("SIGKILL");
          logger.error("Script administrativo excedeu o tempo limite", { script });
          finish(`error: Tempo limite de ${SCRIPT_TIMEOUT_MS / 1000}s excedido; processo encerrado.`);
        }, SCRIPT_TIMEOUT_MS);

        child.stdout.on("data", (data) => {
          if (settled) return;
          controller.enqueue(encoder.encode(`data: ${data.toString()}\n\n`));
        });

        child.stderr.on("data", (data) => {
          if (settled) return;
          controller.enqueue(encoder.encode(`error: ${data.toString()}\n\n`));
        });

        child.on("close", (code) => {
          finish(`done: Process exited with code ${code}`);
        });

        child.on("error", (err) => {
          logger.error("Falha ao iniciar script administrativo", { error: err, script });
          finish("error: Failed to start process.");
        });
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  }
  catch (error) {
    logger.error("Erro ao executar script", { error, script });
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
