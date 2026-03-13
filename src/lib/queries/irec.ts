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

export interface SectorCount {
  setor: string;
  count: number;
  totalVolume: number;
}

export interface IrecFullStats {
  totalVolume: number;
  crescimento: number;
  totalStakeholders: number;
  totalSectors: number;
  leader: Stakeholder | null;
  sectorDistribution: SectorCount[];
}

export const getIrecStakeholders = cache(async (region: 'brazil' | 'world' = 'brazil') => {
  return withMonitoring(`getIrecStakeholders(${region})`, async () => {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('irec_stakeholders' as any)
      .select('*')
      .eq('region', region)
      .order('ranking', { ascending: true });

    if (error) {
      console.error(`Error fetching irec_stakeholders for ${region}:`, error);
      return [];
    }

    return data as unknown as Stakeholder[];
  });
});

export const getIrecStakeholdersBySector = cache(async (setor: string, region: 'brazil' | 'world' = 'brazil') => {
  return withMonitoring(`getIrecStakeholdersBySector(${setor}, ${region})`, async () => {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('irec_stakeholders' as any)
      .select('*')
      .eq('setor', setor)
      .eq('region', region)
      .order('ranking', { ascending: true });

    if (error) {
      console.error(`Error fetching irec_stakeholders for sector ${setor} in ${region}:`, error);
      return [];
    }
    
    return data as unknown as Stakeholder[];
  });
});

export const getTopIrecStakeholders = cache(async (limit: number = 10, region: 'brazil' | 'world' = 'brazil') => {
  return withMonitoring(`getTopIrecStakeholders(${limit}, ${region})`, async () => {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('irec_stakeholders' as any)
      .select('*')
      .eq('region', region)
      .order('ranking', { ascending: true })
      .limit(limit);

    if (error) {
      console.error(`Error fetching top ${limit} irec_stakeholders for ${region}:`, error);
      return [];
    }
    
    return data as unknown as Stakeholder[];
  });
});

export interface IrecDashboardStats {
  total2024: number;
  total2025: number;
  total2026: number;
  crescimento: number;
}

export const getIrecStats = cache(async (region: 'brazil' | 'world' | 'world_total' = 'brazil'): Promise<IrecDashboardStats> => {
  return withMonitoring(`getIrecStats(${region})`, async () => {
    const supabase = createClient();
    
    // Use corrected view that includes Brazil in world totals
    const viewName = region === 'world_total' ? 'v_irec_dashboard_corrected' : 'v_irec_dashboard';
    const regionParam = region === 'world_total' ? 'world_total' : region;
    
    const { data, error } = await supabase
      .from(viewName as any)
      .select('*')
      .eq('region', regionParam)
      .single();

    if (error || !data) {
      if (error && error.code !== 'PGRST116') {
        console.error(`Error fetching irec stats for ${region}:`, error);
      }
      
      // Fallback: calculate manually
      if (region === 'world_total') {
        // Calculate world total including Brazil
        const allStakeholders = await getIrecStakeholders('brazil').then(brazil => 
          getIrecStakeholders('world').then(world => [...brazil, ...world])
        );
        
        if (allStakeholders.length === 0) {
          return { total2024: 0, total2025: 0, total2026: 0, crescimento: 0 };
        }

        const total2024 = allStakeholders.reduce((sum, s) => sum + (Number(s.volume_2024) || 0), 0);
        const total2025 = allStakeholders.reduce((sum, s) => sum + (Number(s.volume_2025) || 0), 0);
        const total2026 = allStakeholders.reduce((sum, s) => sum + (Number(s.volume_2026) || 0), 0);
        const crescimento = total2024 > 0 ? ((total2025 - total2024) / total2024) * 100 : 0;

        return { total2024, total2025, total2026, crescimento };
      }
      
      // Fallback for specific regions
      const stakeholders = await getIrecStakeholders(region as 'brazil' | 'world');
      if (stakeholders.length === 0) {
        return { total2024: 0, total2025: 0, total2026: 0, crescimento: 0 };
      }

      const total2024 = stakeholders.reduce((sum, s) => sum + (Number(s.volume_2024) || 0), 0);
      const total2025 = stakeholders.reduce((sum, s) => sum + (Number(s.volume_2025) || 0), 0);
      const total2026 = stakeholders.reduce((sum, s) => sum + (Number(s.volume_2026) || 0), 0);
      const crescimento = total2024 > 0 ? ((total2025 - total2024) / total2024) * 100 : 0;

      return { total2024, total2025, total2026, crescimento };
    }

    const viewData = data as unknown as {
      total_volume_2024: number;
      total_volume_2025: number;
      total_volume_2026: number;
      crescimento_pct: number;
    };

    return {
      total2024: viewData.total_volume_2024,
      total2025: viewData.total_volume_2025,
      total2026: viewData.total_volume_2026,
      crescimento: viewData.crescimento_pct
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
      .from('irec_prices' as any)
      .select('*')
      .eq('category', category)
      .order('created_at', { ascending: true });

    if (error) {
      console.error(`Error fetching irec_prices for ${category}:`, error);
      return [];
    }

    return data as unknown as IrecPrice[];
  });
});

export const searchIrecStakeholders = cache(async (query: string, region: 'brazil' | 'world' = 'brazil') => {
  return withMonitoring(`searchIrecStakeholders(${query}, ${region})`, async () => {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('irec_stakeholders' as any)
      .select('*')
      .eq('region', region)
      .ilike('empresa', `%${query}%`)
      .order('ranking', { ascending: true });

    if (error) {
      console.error(`Error searching irec_stakeholders:`, error);
      return [];
    }

    return data as unknown as Stakeholder[];
  });
});

export const getIrecSectorDistribution = cache(async (region: 'brazil' | 'world' = 'brazil'): Promise<SectorCount[]> => {
  return withMonitoring(`getIrecSectorDistribution(${region})`, async () => {
    const stats = await getIrecFullStats(region);
    return stats.sectorDistribution;
  });
});

export const getIrecFullStats = cache(async (region: 'brazil' | 'world' = 'brazil'): Promise<IrecFullStats> => {
  return withMonitoring(`getIrecFullStats(${region})`, async () => {
    const stakeholders = await getIrecStakeholders(region);

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

    let total2024 = 0;
    let total2025 = 0;
    const sectorMap = new Map<string, { count: number; totalVolume: number }>();
    const uniqueSectors = new Set<string>();

    // Single pass optimization: O(n) instead of O(5n)
    for (const s of stakeholders) {
      const vol2024 = Number(s.volume_2024) || 0;
      const vol2025 = Number(s.volume_2025) || 0;
      const vol2026 = Number(s.volume_2026) || 0;

      total2024 += vol2024;
      total2025 += vol2025;

      if (s.setor) {
        uniqueSectors.add(s.setor);
      }

      const setor = s.setor || 'Outros';
      const current = sectorMap.get(setor) || { count: 0, totalVolume: 0 };

      sectorMap.set(setor, {
        count: current.count + 1,
        // Match original logic for distribution volume
        totalVolume: current.totalVolume + (vol2026 || vol2025 || 0)
      });
    }

    const crescimento = total2024 > 0 ? ((total2025 - total2024) / total2024) * 100 : 0;

    const sectorDistribution = Array.from(sectorMap.entries())
      .map(([setor, data]) => ({ setor, ...data }))
      .sort((a, b) => b.totalVolume - a.totalVolume);

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

export const getIrecByYear = cache(async (year: 2024 | 2025 | 2026, region: 'brazil' | 'world' = 'brazil') => {
  return withMonitoring(`getIrecByYear(${year}, ${region})`, async () => {
    const stakeholders = await getIrecStakeholders(region);
    
    const volumeKey = `volume_${year}` as keyof Stakeholder;
    
    return stakeholders
      .filter(s => s[volumeKey] !== null && Number(s[volumeKey]) > 0)
      .map(s => ({
        ...s,
        volume: Number(s[volumeKey]) || 0
      }))
      .sort((a, b) => b.volume - a.volume);
  });
});
