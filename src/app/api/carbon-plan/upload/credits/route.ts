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
    const credits = data.map((row: Record<string, string>) => ({
      project_id: row.project_id?.toString() || '',
      quantity: parseInt(row.quantity) || 0,
      vintage: parseInt(row.vintage) || 0,
      transaction_date: row.transaction_date ? new Date(row.transaction_date).toISOString() : null,
      transaction_type: row.transaction_type || '',
      retirement_account: row.retirement_account || '',
      retirement_beneficiary: row.retirement_beneficiary || '',
      retirement_beneficiary_harmonized: row.retirement_beneficiary_harmonized || '',
      retirement_note: row.retirement_note || '',
      retirement_reason: row.retirement_reason || '',
    }));

    // Insert credits (using any to bypass type issues)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from('carbon_credits') as any)
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
