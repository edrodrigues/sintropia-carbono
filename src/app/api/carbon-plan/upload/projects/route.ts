import { NextRequest, NextResponse } from 'next/server';
import type { Database } from '@/types/supabase';
import { requireAdminApiAccess } from '@/lib/auth/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { carbonProjectUploadSchema } from '@/lib/validation/carbon-plan';

type CarbonProjectInsert = Database['public']['Tables']['carbon_projects']['Insert'];

export async function POST(request: NextRequest) {
  try {
    const access = await requireAdminApiAccess();
    if (!access.ok) {
      return access.response;
    }

    const parsed = carbonProjectUploadSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        {
          details: parsed.error.flatten(),
          error: 'Invalid data format',
        },
        { status: 400 },
      );
    }

    const supabase = getSupabaseAdmin();
    const projects: CarbonProjectInsert[] = parsed.data.data.map((row) => ({
      category: row.category ?? 'unknown',
      country: row.country,
      first_issuance_at: row.first_issuance_at,
      first_retirement_at: row.first_retirement_at,
      is_compliance: row.is_compliance,
      issued: row.issued ?? 0,
      listed_at: row.listed_at,
      name: row.name,
      project_id: row.project_id,
      project_type: row.project_type,
      project_type_source: row.project_type_source,
      project_url: row.project_url,
      proponent: row.proponent,
      protocol: row.protocol,
      registry: row.registry,
      retired: row.retired ?? 0,
      status: row.status ?? 'listed',
    }));

    const { error } = await supabase
      .from('carbon_projects')
      .upsert(projects, { 
        onConflict: 'project_id',
        ignoreDuplicates: false 
      })
      .select();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      count: projects.length,
      message: `Successfully uploaded ${projects.length} projects`
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
