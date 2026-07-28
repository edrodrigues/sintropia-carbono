import { NextResponse } from "next/server";
import { spawn } from "child_process";
import path from "path";

import { requireAdminApiAccess } from "@/lib/auth/server";
import { logger } from "@/lib/utils/logger";

export const dynamic = "force-dynamic";

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
];

const SAFE_ARG_REGEX = /^[a-zA-Z0-9@%\-_./\\:]+$/;

function sanitizeArgs(args: unknown): string[] {
  if (!Array.isArray(args)) return [];
  return args.filter(
    (a): a is string => typeof a === "string" && SAFE_ARG_REGEX.test(a),
  );
}

export async function POST(request: Request) {
  let script = "";
  try {
    const access = await requireAdminApiAccess();
    if (!access.ok) {
      return access.response;
    }

    const body = await request.json();
    script = body.script;
    const rawArgs = body.args;
    const args = sanitizeArgs(rawArgs);

    if (!ALLOWED_SCRIPTS.includes(script)) {
      return new NextResponse("Invalid script", { status: 400 });
    }

    const scriptPath = path.join(process.cwd(), "scripts", script);

    // We'll use a TransformStream to stream the output back to the client
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        // Run the script using tsx
        // Note: In some production environments, you might need to use 'node' with pre-compiled scripts
        // or ensure 'tsx' is available.
        const child = spawn("npx", ["tsx", scriptPath, ...args], {
          env: { ...process.env },
        });

        child.stdout.on("data", (data) => {
          controller.enqueue(encoder.encode(`data: ${data.toString()}\n\n`));
        });

        child.stderr.on("data", (data) => {
          controller.enqueue(encoder.encode(`error: ${data.toString()}\n\n`));
        });

        child.on("close", (code) => {
          controller.enqueue(encoder.encode(`done: Process exited with code ${code}\n\n`));
          controller.close();
        });

        child.on("error", (err) => {
          controller.enqueue(encoder.encode(`error: Failed to start process: ${err.message}\n\n`));
          controller.close();
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
