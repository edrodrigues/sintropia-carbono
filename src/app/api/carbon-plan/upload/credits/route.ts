import { NextRequest, NextResponse } from 'next/server';
import type { Database } from '@/types/supabase';
import { requireAdminApiAccess } from '@/lib/auth/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { carbonCreditUploadSchema } from '@/lib/validation/carbon-plan';

type CarbonCreditInsert = Database['public']['Tables']['carbon_credits']['Insert'];

export async function POST(request: NextRequest) {
  try {
    const access = await requireAdminApiAccess();
    if (!access.ok) {
      return access.response;
    }

    const parsed = carbonCreditUploadSchema.safeParse(await request.json());
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
    const credits: CarbonCreditInsert[] = parsed.data.data.map((row) => ({
      project_id: row.project_id ?? null,
      quantity: row.quantity,
      retirement_account: row.retirement_account ?? null,
      retirement_beneficiary: row.retirement_beneficiary ?? null,
      retirement_beneficiary_harmonized:
        row.retirement_beneficiary_harmonized ?? null,
      retirement_note: row.retirement_note ?? null,
      retirement_reason: row.retirement_reason ?? null,
      transaction_date: row.transaction_date ?? null,
      transaction_type: row.transaction_type ?? null,
      vintage: row.vintage ?? null,
    }));

    const { error } = await supabase
      .from('carbon_credits')
      .insert(credits)
      .select();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      count: credits.length,
      message: `Successfully uploaded ${credits.length} credits`
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
