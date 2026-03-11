// src/lib/queries/carbon.ts
import { createClient } from '@/lib/supabase/client';
import { cache } from 'react';
import { withMonitoring } from '@/lib/utils/monitoring';

export interface CarbonStakeholder {
  id: string;
  ranking: number;
  region: 'brazil' | 'world';
  empresa: string;
  setor: string | null;
  volume_2024: number | null;
  volume_2025: number | null;
  delta_pct: number | null;
  created_at: string;
  updated_at: string;
}

export const getCarbonStakeholders = cache(async (region: 'brazil' | 'world' = 'brazil') => {
  return withMonitoring(`getCarbonStakeholders(${region})`, async () => {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('carbon_stakeholders' as any)
      .select('*')
      .eq('region', region)
      .order('ranking', { ascending: true });

    if (error) {
      console.error(`Error fetching carbon_stakeholders for ${region}:`, error);
      return [];
    }

    return data as unknown as CarbonStakeholder[];
  });
});

export interface CarbonDashboardStats {
  total2024: number;
  total2025: number;
  crescimento: number;
  total_stakeholders: number;
}

export const getCarbonStats = cache(async (region: 'brazil' | 'world' = 'brazil'): Promise<CarbonDashboardStats> => {
  return withMonitoring(`getCarbonStats(${region})`, async () => {
    const supabase = createClient();
    
    // Use the view for stats
    const { data, error } = await supabase
      .from('v_carbon_dashboard' as any)
      .select('*')
      .eq('region', region)
      .single();

    if (error || !data) {
      if (error && error.code !== 'PGRST116') {
        console.error(`Error fetching carbon stats view for ${region}:`, error);
      }
      
      // Fallback manual calculation if view fails
      const stakeholders = await getCarbonStakeholders(region);
      if (stakeholders.length === 0) {
        return { total2024: 0, total2025: 0, crescimento: 0, total_stakeholders: 0 };
      }

      const total2024 = stakeholders.reduce((sum, s) => sum + (Number(s.volume_2024) || 0), 0);
      const total2025 = stakeholders.reduce((sum, s) => sum + (Number(s.volume_2025) || 0), 0);
      const crescimento = total2024 > 0 ? ((total2025 - total2024) / total2024) * 100 : 0;

      return { 
        total2024, 
        total2025, 
        crescimento, 
        total_stakeholders: stakeholders.length 
      };
    }

    const viewData = data as unknown as {
      total_volume_2024: number;
      total_volume_2025: number;
      crescimento_pct: number;
      total_stakeholders: number;
    };

    return {
      total2024: viewData.total_volume_2024,
      total2025: viewData.total_volume_2025,
      crescimento: viewData.crescimento_pct,
      total_stakeholders: viewData.total_stakeholders
    };
  });
});
