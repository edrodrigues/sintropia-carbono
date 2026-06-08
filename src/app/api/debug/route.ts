import { NextRequest, NextResponse } from "next/server";

import { requireAdminApiAccess } from "@/lib/auth/server";

export async function GET(request: NextRequest) {
  const start = Date.now();
  const access = await requireAdminApiAccess({ developmentOnly: true });
  if (!access.ok) {
    return access.response;
  }

  const timings = {
    auth: Date.now() - start,
    total: Date.now() - start,
  };

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    url: request.url,
    method: request.method,
    auth: {
      role: access.role,
      userId: access.user.id,
    },
    timings,
    environment: {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      nodeEnv: process.env.NODE_ENV,
    },
  });
}
