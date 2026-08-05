import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { logger } from "@/lib/utils/logger";

const countryToContinent: Record<string, string> = {
  "Colombia": "South America",
  "Philippines": "Asia",
  "India": "Asia",
  "Canada": "North America",
  "Brazil": "South America",
  "Peru": "South America",
  "Cameroon": "Africa",
  "Argentina": "South America",
  "Congo Republic": "Africa",
  "Togo": "Africa",
  "Senegal": "Africa",
  "Malawi": "Africa",
  "Gabon": "Africa",
  "Madagascar": "Africa",
  "Kenya": "Africa",
  "Uganda": "Africa",
  "Zambia": "Africa",
  "DR Congo": "Africa",
  "Portugal": "Europe",
  "Papua New Guinea": "Oceania",
  "Indonesia": "Asia",
  "Kazakhstan": "Asia",
  "Spain": "Europe",
  "Honduras": "Central America",
  "Mongolia": "Asia",
  "United States": "North America",
  "China": "Asia",
  "South Africa": "Africa",
  "United Kingdom": "Europe",
  "Thailand": "Asia",
  "Vietnam": "Asia",
  "Myanmar": "Asia",
  "Malaysia": "Asia",
  "Nepal": "Asia",
  "Laos": "Asia",
  "Tanzania": "Africa",
  "Ghana": "Africa",
  "Ethiopia": "Africa",
  "Nigeria": "Africa",
  "Sierra Leone": "Africa",
  "Costa Rica": "Central America",
  "Mexico": "North America",
  "Chile": "South America",
  "Australia": "Oceania",
  "Israel": "Asia",
  "Turkey": "Europe",
  "Pakistan": "Asia",
  "Bangladesh": "Asia",
  "Sri Lanka": "Asia",
  "Cambodia": "Asia",
  "Timor-Leste": "Asia",
  "New Zealand": "Oceania",
  "Fiji": "Oceania",
  "Haiti": "Central America",
  "Jamaica": "Central America",
  "Dominican Republic": "Central America",
  "Cuba": "Central America",
  "Guatemala": "Central America",
  "Panama": "Central America",
  "Nicaragua": "Central America",
  "El Salvador": "Central America",
  "Belize": "Central America",
  "Puerto Rico": "Central America",
  "Japan": "Asia",
  "South Korea": "Asia",
  "Taiwan": "Asia",
  "Singapore": "Asia",
  "United Arab Emirates": "Asia",
  "Saudi Arabia": "Asia",
  "Qatar": "Asia",
  "Oman": "Asia",
  "Kuwait": "Asia",
  "Jordan": "Asia",
  "Egypt": "Africa",
  "Morocco": "Africa",
  "Rwanda": "Africa",
  "Mozambique": "Africa",
  "Namibia": "Africa",
  "Botswana": "Africa",
  "Lesotho": "Africa",
  "Guinea": "Africa",
  "Liberia": "Africa",
  "Mali": "Africa",
  "Burkina Faso": "Africa",
  "Niger": "Africa",
  "Benin": "Africa",
  "Equatorial Guinea": "Africa",
  "Chad": "Africa",
  "Central African Republic": "Africa",
  "Somalia": "Africa",
  "Sudan": "Africa",
  "Iran": "Asia",
  "Iraq": "Asia",
  "Russia": "Europe",
  "Ukraine": "Europe",
  "Germany": "Europe",
  "France": "Europe",
  "Italy": "Europe",
  "Sweden": "Europe",
  "Norway": "Europe",
  "Netherlands": "Europe",
  "Poland": "Europe",
  "Greece": "Europe",
  "Romania": "Europe",
};

const DEFAULT_LIMIT = 100;
const MAX_LIMIT = 1000;

/** Parse an integer query param, falling back and clamping to a safe range. */
function clampInt(raw: string | null, fallback: number, min: number, max: number): number {
  const parsed = Number.parseInt(raw ?? "", 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(Math.max(parsed, min), max);
}

/**
 * Escape a user-supplied term for use inside a PostgREST `ilike` pattern in an
 * `.or()` filter, where , . : ( ) and quotes are structural.
 */
function escapePostgrestPattern(term: string): string {
  return term.replace(/[,.:()"']/g, " ").trim();
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const country = searchParams.get("country");
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    // Clamp pagination: parseInt previously let NaN or an unbounded limit
    // through, producing a broken range or an enormous response.
    const limit = clampInt(searchParams.get("limit"), DEFAULT_LIMIT, 1, MAX_LIMIT);
    const offset = clampInt(searchParams.get("offset"), 0, 0, Number.MAX_SAFE_INTEGER);

    // This endpoint reports corpus-wide totals, so it deliberately uses the
    // service-role client to see every row. Falling back to the anon client (as
    // this route used to) silently returns an RLS-filtered subset that is
    // indistinguishable from a complete answer, so a misconfigured environment
    // would quietly publish understated statistics. Fail loudly instead.
    let supabase;
    try {
      supabase = getSupabaseAdmin();
    }
    catch (error) {
      logger.error("Cliente admin indisponível em carbon-projects", { error });
      return NextResponse.json({
        error: "Database not configured",
      }, { status: 500 });
    }

    // Build query
    let query = supabase
      .from("carbon_projects")
      .select("*", { count: "exact" });

    if (country) {
      query = query.eq("country", country);
    }

    if (category) {
      query = query.eq("category", category);
    }

    if (search) {
      // PostgREST treats , . : ( ) and quotes as filter syntax, so an
      // unescaped term could alter the query rather than be matched literally.
      const safeSearch = escapePostgrestPattern(search);
      query = query.or(`name.ilike.%${safeSearch}%,project_id.ilike.%${safeSearch}%`);
    }

    // Fetch the page. `count: "exact"` on the select above already returns the
    // matching total, so the previous separate head-count query was both
    // redundant and wrong: it ignored the filters and always counted the whole
    // table.
    const { data: projects, error, count } = await query
      .range(offset, offset + limit - 1)
      .order("country", { ascending: true });

    if (error) {
      logger.error("Erro na consulta Supabase (carbon-projects)", { error });
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // --- DATA AGGREGATION VIA DATABASE ---
    // Fetch ALL projects for stats using pagination (batches of 1000)
    // Supabase seems to limit to 1000 rows regardless of range/limit
    interface ProjectStat {
      project_id: string;
      country: string;
      category: string;
    }
    let allProjectsData: ProjectStat[] = [];
    let page = 0;
    const pageSize = 1000;

    while (true) {
      const { data: batch } = await supabase
        .from("carbon_projects")
        .select("project_id, country, category")
        .range(page * pageSize, (page + 1) * pageSize - 1);

      if (!batch || batch.length === 0) break;
      allProjectsData = [...allProjectsData, ...batch as ProjectStat[]];
      page++;
      if (batch.length < pageSize) break;
    }

    const allProjects = allProjectsData || [];
    const totalProjects = allProjects.length;
    const forestProjects = allProjects.filter(p => p.category === "forest").length;

    // Country stats
    const countryStats: Record<string, number> = {};
    const continentStats: Record<string, number> = {};
    const countriesSet = new Set<string>();

    allProjects.forEach((p) => {
      countryStats[p.country] = (countryStats[p.country] || 0) + 1;
      const continent = countryToContinent[p.country] || "Unknown";
      continentStats[continent] = (continentStats[continent] || 0) + 1;
      countriesSet.add(p.country);
    });

    const countries = countriesSet.size;
    const continents = Object.keys(continentStats).length;

    // Category stats
    const categoryStats: Record<string, number> = {};
    allProjects.forEach((p) => {
      categoryStats[p.category] = (categoryStats[p.category] || 0) + 1;
    });

    // Build project_id to country map
    const projectCountryMap: Record<string, string> = {};
    allProjects.forEach((p) => {
      projectCountryMap[p.project_id] = p.country;
    });

    // Get credits data - fetch ALL credits using pagination
    interface CreditStat {
      vintage: number;
      quantity: number;
      project_id: string;
    }
    let allCredits: CreditStat[] = [];
    let creditPage = 0;
    const creditPageSize = 1000;

    while (true) {
      const { data: creditBatch } = await supabase
        .from("carbon_credits")
        .select("vintage, quantity, project_id")
        .range(creditPage * creditPageSize, (creditPage + 1) * creditPageSize - 1);

      if (!creditBatch || creditBatch.length === 0) break;
      allCredits = [...allCredits, ...creditBatch as CreditStat[]];
      creditPage++;
      if (creditBatch.length < creditPageSize) break;
    }

    // Calculate totalCredits from allCredits
    const totalCredits = (allCredits || []).reduce((sum, c) => sum + (c.quantity || 0), 0);

    // Calculate vintageStats
    const vintageStats: Record<string, number> = {};
    (allCredits || []).forEach((c) => {
      if (c.vintage) {
        vintageStats[c.vintage.toString()] = (vintageStats[c.vintage.toString()] || 0) + (c.quantity || 0);
      }
    });

    // Credits by country
    const creditsByCountry: Record<string, number> = {};
    (allCredits || []).forEach((c) => {
      const country = projectCountryMap[c.project_id];
      if (country) {
        creditsByCountry[country] = (creditsByCountry[country] || 0) + (c.quantity || 0);
      }
    });

    return NextResponse.json({
      projects: projects || [],
      stats: {
        totalProjects,
        forestProjects,
        countries,
        continents,
        totalCredits,
        countryStats,
        continentStats,
        categoryStats,
        creditsByCountry,
        vintageStats,
      },
      pagination: {
        total: count || 0,
        limit,
        offset,
      },
    }, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  }
  catch (error) {
    logger.error("Erro ao buscar carbon-projects", { error });
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Unknown error",
      fallback: true,
    }, { status: 500 });
  }
}
