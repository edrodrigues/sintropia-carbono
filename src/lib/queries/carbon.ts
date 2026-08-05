// src/lib/queries/carbon.ts
import { createClient } from "@/lib/supabase/server";
import { cache } from "react";
import { withMonitoring } from "@/lib/utils/monitoring";
import { logger } from "@/lib/utils/logger";

export interface CarbonStakeholder {
  id: string;
  ranking: number;
  region: "brazil" | "world";
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

export const getCarbonStakeholders = cache(async (region: "brazil" | "world" = "brazil") => {
  return withMonitoring(`getCarbonStakeholders(${region})`, async () => {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("carbon_stakeholders")
      .select("*")
      .eq("region", region)
      .order("ranking", { ascending: true });

    if (error) {
      logger.error(`Erro ao buscar stakeholders de carbono para ${region}`, { error });
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

export const getCarbonStats = cache(async (region: "brazil" | "world" = "brazil"): Promise<CarbonDashboardStats> => {
  return withMonitoring(`getCarbonStats(${region})`, async () => {
    const supabase = await createClient();

    // Use the view for stats
    const { data, error } = await supabase
      .from("v_carbon_dashboard")
      .select("*")
      .eq("region", region)
      .single();

    if (error || !data) {
      if (error && error.code !== "PGRST116") {
        logger.error(`Erro ao buscar estatísticas de carbono para ${region}`, { error });
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
        total_stakeholders: stakeholders.length,
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
      total_stakeholders: viewData.total_stakeholders,
    };
  });
});

export const getCarbonStakeholdersBySector = cache(async (setor: string, region: "brazil" | "world" = "brazil") => {
  return withMonitoring(`getCarbonStakeholdersBySector(${setor}, ${region})`, async () => {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("carbon_stakeholders")
      .select("*")
      .eq("setor", setor)
      .eq("region", region)
      .order("ranking", { ascending: true });

    if (error) {
      logger.error(`Erro ao buscar stakeholders de carbono do setor ${setor} em ${region}`, { error });
      return [];
    }

    return data as unknown as CarbonStakeholder[];
  });
});

export const searchCarbonStakeholders = cache(async (query: string, region: "brazil" | "world" = "brazil") => {
  return withMonitoring(`searchCarbonStakeholders(${query}, ${region})`, async () => {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("carbon_stakeholders")
      .select("*")
      .eq("region", region)
      .ilike("empresa", `%${query}%`)
      .order("ranking", { ascending: true });

    if (error) {
      logger.error("Erro ao pesquisar stakeholders de carbono", { error });
      return [];
    }

    return data as unknown as CarbonStakeholder[];
  });
});

export const getCarbonSectorDistribution = cache(async (region: "brazil" | "world" = "brazil"): Promise<CarbonSectorCount[]> => {
  return withMonitoring(`getCarbonSectorDistribution(${region})`, async () => {
    const stats = await getCarbonFullStats(region);
    return stats.sectorDistribution;
  });
});

export const getCarbonFullStats = cache(async (region: "brazil" | "world" = "brazil"): Promise<CarbonFullStats> => {
  return withMonitoring(`getCarbonFullStats(${region})`, async () => {
    const stakeholders = await getCarbonStakeholders(region);

    if (stakeholders.length === 0) {
      return {
        totalVolume: 0,
        crescimento: 0,
        totalStakeholders: 0,
        totalSectors: 0,
        leader: null,
        sectorDistribution: [],
      };
    }

    let total2024 = 0;
    let total2025 = 0;
    const sectorMap = new Map<string, { count: number; totalVolume: number }>();
    const uniqueSectors = new Set<string>();

    // Single pass optimization: O(n) instead of O(5n)
    // We calculate totals, unique sectors, and sector distribution in one go
    for (const s of stakeholders) {
      const vol2024 = Number(s.volume_2024) || 0;
      const vol2025 = Number(s.volume_2025) || 0;

      total2024 += vol2024;
      total2025 += vol2025;

      if (s.setor) {
        uniqueSectors.add(s.setor);
      }

      const setor = s.setor || "Outros";
      const current = sectorMap.get(setor) || { count: 0, totalVolume: 0 };

      sectorMap.set(setor, {
        count: current.count + 1,
        // Use 2025 volume for distribution if available, fallback to 2024
        totalVolume: current.totalVolume + (vol2025 || vol2024),
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
      sectorDistribution,
    };
  });
});

export const getCarbonByYear = cache(async (year: 2024 | 2025 | 2026, region: "brazil" | "world" = "brazil") => {
  return withMonitoring(`getCarbonByYear(${year}, ${region})`, async () => {
    const stakeholders = await getCarbonStakeholders(region);

    const volumeKey = `volume_${year}` as keyof CarbonStakeholder;

    return stakeholders
      .filter(s => s[volumeKey] !== null && Number(s[volumeKey]) > 0)
      .map(s => ({
        ...s,
        volume: Number(s[volumeKey]) || 0,
      }))
      .sort((a, b) => b.volume - a.volume);
  });
});
