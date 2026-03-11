// src/lib/queries/irec.ts
import { createClient } from '@/lib/supabase/client';
import { cache } from 'react';
import { withMonitoring } from '@/lib/utils/monitoring';

export interface Stakeholder {
  id: string;
  ranking: number;
  region: 'brazil' | 'world';
  empresa: string;
  setor: string | null;
  papel_mercado: string | null;
  volume_2024: number | null;
  volume_2025: number | null;
  volume_2026: number | null;
  delta_num: number | null;
  delta_pct: number | null;
  created_at: string;
  updated_at: string;
}

export const getIrecStakeholders = cache(async (region: 'brazil' | 'world' = 'brazil') => {
  return withMonitoring(`getIrecStakeholders(${region})`, async () => {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('irec_stakeholders')
      .select('*')
      .eq('region', region)
      .order('ranking', { ascending: true });

    if (error) {
      console.error(`Error fetching irec_stakeholders for ${region}:`, error);
      return [];
    }

    return data as Stakeholder[];
  });
});

export const getIrecStakeholdersBySector = cache(async (setor: string, region: 'brazil' | 'world' = 'brazil') => {
  return withMonitoring(`getIrecStakeholdersBySector(${setor}, ${region})`, async () => {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('irec_stakeholders')
      .select('*')
      .eq('setor', setor)
      .eq('region', region)
      .order('ranking', { ascending: true });

    if (error) {
      console.error(`Error fetching irec_stakeholders for sector ${setor} in ${region}:`, error);
      return [];
    }
    
    return data as Stakeholder[];
  });
});

export const getTopIrecStakeholders = cache(async (limit: number = 10, region: 'brazil' | 'world' = 'brazil') => {
  return withMonitoring(`getTopIrecStakeholders(${limit}, ${region})`, async () => {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('irec_stakeholders')
      .select('*')
      .eq('region', region)
      .order('ranking', { ascending: true })
      .limit(limit);

    if (error) {
      console.error(`Error fetching top ${limit} irec_stakeholders for ${region}:`, error);
      return [];
    }
    
    return data as Stakeholder[];
  });
});

export const getIrecStats = cache(async (region: 'brazil' | 'world' = 'brazil') => {
  return withMonitoring(`getIrecStats(${region})`, async () => {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('v_irec_dashboard')
      .select('*')
      .eq('region', region)
      .single();

    if (error || !data) {
      if (error && error.code !== 'PGRST116') {
        console.error(`Error fetching irec stats for ${region}:`, error);
      }
      
      // Fallback
      const stakeholders = await getIrecStakeholders(region);
      if (stakeholders.length === 0) {
        return { total2024: 0, total2025: 0, total2026: 0, crescimento: 0 };
      }

      const total2024 = stakeholders.reduce((sum, s) => sum + (Number(s.volume_2024) || 0), 0);
      const total2025 = stakeholders.reduce((sum, s) => sum + (Number(s.volume_2025) || 0), 0);
      const total2026 = stakeholders.reduce((sum, s) => sum + (Number(s.volume_2026) || 0), 0);
      const crescimento = total2024 > 0 ? ((total2025 - total2024) / total2024) * 100 : 0;

      return { total2024, total2025, total2026, crescimento };
    }

    return {
      total2024: data.total_volume_2024,
      total2025: data.total_volume_2025,
      total2026: data.total_volume_2026,
      crescimento: data.crescimento_pct
    };
  });
});

export interface IrecPrice {
  id: string;
  category: 'brazil' | 'latam' | 'asia_pacific';
  country: string | null;
  technology: string | null;
  price_range: string | null;
  vintage: string | null;
  observation: string | null;
  trend: string | null;
  update_date: string | null;
  created_at: string;
}

export const getIrecPrices = cache(async (category: string) => {
  return withMonitoring(`getIrecPrices(${category})`, async () => {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('irec_prices')
      .select('*')
      .eq('category', category)
      .order('created_at', { ascending: true });

    if (error) {
      console.error(`Error fetching irec_prices for ${category}:`, error);
      return [];
    }

    return data as IrecPrice[];
  });
});
