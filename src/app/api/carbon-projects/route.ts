import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const country = searchParams.get('country');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Use admin client to bypass RLS and get all records
    let supabase;
    try {
      supabase = getSupabaseAdmin();
    } catch (error) {
      // Fallback to anon client if admin not available
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (!supabaseUrl || !supabaseAnonKey) {
        return NextResponse.json({
          error: 'Database not configured',
          fallback: true
        }, { status: 500 });
      }
      supabase = createClient(supabaseUrl, supabaseAnonKey);
    }

    // Build query
    let query = supabase
      .from('carbon_projects')
      .select('*', { count: 'exact' });

    if (country) {
      query = query.eq('country', country);
    }

    if (category) {
      query = query.eq('category', category);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,project_id.ilike.%${search}%`);
    }

    // Get total count first
    const { count } = await supabase
      .from('carbon_projects')
      .select('*', { count: 'exact', head: true });

    // Fetch paginated data
    const { data: projects, error } = await query
      .range(offset, offset + limit - 1)
      .order('country', { ascending: true });

    if (error) {
      console.error('Supabase query error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // --- DATA AGGREGATION VIA DATABASE ---
    // Fetch ALL projects for stats using pagination (batches of 1000)
    // Supabase seems to limit to 1000 rows regardless of range/limit
    let allProjectsData: any[] = [];
    let page = 0;
    const pageSize = 1000;
    
    while (true) {
      const { data: batch } = await supabase
        .from('carbon_projects')
        .select('project_id, country, category')
        .range(page * pageSize, (page + 1) * pageSize - 1);
      
      if (!batch || batch.length === 0) break;
      allProjectsData = [...allProjectsData, ...batch];
      page++;
      if (batch.length < pageSize) break;
    }

    const allProjects = allProjectsData || [];
    const totalProjects = allProjects.length;
    const forestProjects = allProjects.filter(p => p.category === 'forest').length;

    // Country stats
    const countryStats: Record<string, number> = {};
    const continentStats: Record<string, number> = {};
    const countriesSet = new Set<string>();

    allProjects.forEach(p => {
      countryStats[p.country] = (countryStats[p.country] || 0) + 1;
      const continent = countryToContinent[p.country] || 'Unknown';
      continentStats[continent] = (continentStats[continent] || 0) + 1;
      countriesSet.add(p.country);
    });

    const countries = countriesSet.size;
    const continents = Object.keys(continentStats).length;

    // Category stats
    const categoryStats: Record<string, number> = {};
    allProjects.forEach(p => {
      categoryStats[p.category] = (categoryStats[p.category] || 0) + 1;
    });

    // Build project_id to country map
    const projectCountryMap: Record<string, string> = {};
    allProjects.forEach(p => {
      projectCountryMap[p.project_id] = p.country;
    });

    // Get credits data - fetch ALL credits using pagination
    let allCredits: any[] = [];
    let creditPage = 0;
    const creditPageSize = 1000;
    
    while (true) {
      const { data: creditBatch } = await supabase
        .from('carbon_credits')
        .select('vintage, quantity, project_id')
        .range(creditPage * creditPageSize, (creditPage + 1) * creditPageSize - 1);
      
      if (!creditBatch || creditBatch.length === 0) break;
      allCredits = [...allCredits, ...creditBatch];
      creditPage++;
      if (creditBatch.length < creditPageSize) break;
    }

    // Calculate totalCredits from allCredits
    const totalCredits = (allCredits || []).reduce((sum, c) => sum + (c.quantity || 0), 0);

    // Calculate vintageStats
    const vintageStats: Record<string, number> = {};
    (allCredits || []).forEach(c => {
      if (c.vintage) {
        vintageStats[c.vintage.toString()] = (vintageStats[c.vintage.toString()] || 0) + (c.quantity || 0);
      }
    });

    // Credits by country
    const creditsByCountry: Record<string, number> = {};
    (allCredits || []).forEach(c => {
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
      }
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });

  } catch (error) {
    console.error('Fetch error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      fallback: true
    }, { status: 500 });
  }
}
