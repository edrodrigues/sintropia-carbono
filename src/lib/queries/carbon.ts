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
  volume_2026: number | null;
  delta_pct: number | null;
  created_at: string;
  updated_at: string;
}

export interface CarbonSectorCount {
  setor: string;
  count: number;
  totalVolume: number;
}

export interface CarbonFullStats {
  totalVolume: number;
  crescimento: number;
  totalStakeholders: number;
  totalSectors: number;
  leader: CarbonStakeholder | null;
  sectorDistribution: CarbonSectorCount[];
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

export const getCarbonStakeholdersBySector = cache(async (setor: string, region: 'brazil' | 'world' = 'brazil') => {
  return withMonitoring(`getCarbonStakeholdersBySector(${setor}, ${region})`, async () => {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('carbon_stakeholders' as any)
      .select('*')
      .eq('setor', setor)
      .eq('region', region)
      .order('ranking', { ascending: true });

    if (error) {
      console.error(`Error fetching carbon_stakeholders for sector ${setor} in ${region}:`, error);
      return [];
    }
    
    return data as unknown as CarbonStakeholder[];
  });
});

export const searchCarbonStakeholders = cache(async (query: string, region: 'brazil' | 'world' = 'brazil') => {
  return withMonitoring(`searchCarbonStakeholders(${query}, ${region})`, async () => {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('carbon_stakeholders' as any)
      .select('*')
      .eq('region', region)
      .ilike('empresa', `%${query}%`)
      .order('ranking', { ascending: true });

    if (error) {
      console.error(`Error searching carbon_stakeholders:`, error);
      return [];
    }

    return data as unknown as CarbonStakeholder[];
  });
});

export const getCarbonSectorDistribution = cache(async (region: 'brazil' | 'world' = 'brazil'): Promise<CarbonSectorCount[]> => {
  return withMonitoring(`getCarbonSectorDistribution(${region})`, async () => {
    const stakeholders = await getCarbonStakeholders(region);
    
    const sectorMap = new Map<string, { count: number; totalVolume: number }>();
    
    for (const s of stakeholders) {
      const setor = s.setor || 'Outros';
      const current = sectorMap.get(setor) || { count: 0, totalVolume: 0 };
      sectorMap.set(setor, {
        count: current.count + 1,
        totalVolume: current.totalVolume + (Number(s.volume_2025) || Number(s.volume_2024) || 0)
      });
    }

    return Array.from(sectorMap.entries())
      .map(([setor, data]) => ({ setor, ...data }))
      .sort((a, b) => b.totalVolume - a.totalVolume);
  });
});

export const getCarbonFullStats = cache(async (region: 'brazil' | 'world' = 'brazil'): Promise<CarbonFullStats> => {
  return withMonitoring(`getCarbonFullStats(${region})`, async () => {
    const [stakeholders, sectorDistribution] = await Promise.all([
      getCarbonStakeholders(region),
      getCarbonSectorDistribution(region)
    ]);

    if (stakeholders.length === 0) {
      return {
        totalVolume: 0,
        crescimento: 0,
        totalStakeholders: 0,
        totalSectors: 0,
        leader: null,
        sectorDistribution: []
      };
    }

    const total2025 = stakeholders.reduce((sum, s) => sum + (Number(s.volume_2025) || 0), 0);
    const total2024 = stakeholders.reduce((sum, s) => sum + (Number(s.volume_2024) || 0), 0);
    const crescimento = total2024 > 0 ? ((total2025 - total2024) / total2024) * 100 : 0;

    const uniqueSectors = new Set(stakeholders.map(s => s.setor).filter(Boolean));

    return {
      totalVolume: total2025,
      crescimento,
      totalStakeholders: stakeholders.length,
      totalSectors: uniqueSectors.size,
      leader: stakeholders[0] || null,
      sectorDistribution
    };
  });
});

export const getCarbonByYear = cache(async (year: 2024 | 2025 | 2026, region: 'brazil' | 'world' = 'brazil') => {
  return withMonitoring(`getCarbonByYear(${year}, ${region})`, async () => {
    const stakeholders = await getCarbonStakeholders(region);
    
    const volumeKey = `volume_${year}` as keyof CarbonStakeholder;
    
    return stakeholders
      .filter(s => s[volumeKey] !== null && Number(s[volumeKey]) > 0)
      .map(s => ({
        ...s,
        volume: Number(s[volumeKey]) || 0
      }))
      .sort((a, b) => b.volume - a.volume);
  });
});
