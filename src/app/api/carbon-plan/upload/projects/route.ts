import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { data } = body;

    if (!data || !Array.isArray(data)) {
      return NextResponse.json({ error: 'Invalid data format' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // Transform and insert data
    const projects = data.map((row: Record<string, string>) => ({
      project_id: row.project_id?.toString() || '',
      name: row.name || '',
      category: row.category || 'unknown',
      country: row.country || '',
      project_type: row.project_type || '',
      project_type_source: row.project_type_source || '',
      project_url: row.project_url || '',
      proponent: row.proponent || '',
      protocol: row.protocol || '',
      registry: row.registry || '',
      status: row.status || 'listed',
      is_compliance: row.is_compliance === 'True' || row.is_compliance === 'true',
      issued: parseInt(row.issued) || 0,
      retired: parseInt(row.retired) || 0,
      first_issuance_at: row.first_issuance_at ? new Date(row.first_issuance_at).toISOString() : null,
      first_retirement_at: row.first_retirement_at ? new Date(row.first_retirement_at).toISOString() : null,
      listed_at: row.listed_at ? new Date(row.listed_at).toISOString() : null,
    }));

    // Use upsert to handle existing records (using any to bypass type issues)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from('carbon_projects') as any)
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
