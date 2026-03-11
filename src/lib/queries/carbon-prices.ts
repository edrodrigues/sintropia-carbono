// src/lib/queries/carbon-prices.ts
import { createClient } from '@/lib/supabase/client';
import { cache } from 'react';
import { withMonitoring } from '@/lib/utils/monitoring';

export interface CarbonPrice {
  id: string;
  market_type: 'compliance' | 'voluntary';
  market_name: string;
  region: string | null;
  price_range: string | null;
  currency: string | null;
  unit: string | null;
  observation: string | null;
  trend: string | null;
  update_date: string | null;
  created_at: string;
}

export const getCarbonPrices = cache(async (marketType?: 'compliance' | 'voluntary') => {
  return withMonitoring(`getCarbonPrices(${marketType || 'all'})`, async () => {
    const supabase = createClient();
    
    let query = supabase
      .from('carbon_prices' as any)
      .select('*');
    
    if (marketType) {
      query = query.eq('market_type', marketType);
    }

    const { data, error } = await query.order('created_at', { ascending: true });

    if (error) {
      console.error(`Error fetching carbon_prices:`, error);
      return [];
    }

    return data as unknown as CarbonPrice[];
  });
});
