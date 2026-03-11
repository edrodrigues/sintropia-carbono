// scripts/sync-carbon-brazil-top50.ts
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Static data for Carbon World (from upload-carbon-stakeholders.ts)
const worldCarbonData = [
  { ranking: 1, empresa: "Microsoft", setor: "Tecnologia", volume_2024: 5.5, volume_2025: 29.5, delta_pct: 81.36, region: 'world' },
  { ranking: 2, empresa: "Shell", setor: "Energia", volume_2024: 14.5, volume_2025: 9.75, delta_pct: -48.72, region: 'world' },
  { ranking: 3, empresa: "AtmosClear", setor: "CDR Tech", volume_2024: 0.32, volume_2025: 6.75, delta_pct: 95.26, region: 'world' },
  { ranking: 4, empresa: "Eni", setor: "Energia", volume_2024: 3.58, volume_2025: 6.44, delta_pct: 44.41, region: 'world' },
  { ranking: 5, empresa: "Banco Votorantim", setor: "Financeiro", volume_2024: 3.8, volume_2025: 5.2, delta_pct: 26.92, region: 'world' },
  { ranking: 6, empresa: "Netflix", setor: "Media/Tech", volume_2024: 0.82, volume_2025: 4.8, delta_pct: 82.92, region: 'world' },
  { ranking: 7, empresa: "Stockholm Exergi", setor: "Energia", volume_2024: 0.3, volume_2025: 3.3, delta_pct: 90.91, region: 'world' },
  { ranking: 8, empresa: "Guacolda Energía", setor: "Energia", volume_2024: 1.8, volume_2025: 3.1, delta_pct: 41.94, region: 'world' },
  { ranking: 9, empresa: "Organizacion Terpel", setor: "Energia", volume_2024: 1.6, volume_2025: 2.4, delta_pct: 33.33, region: 'world' },
  { ranking: 10, empresa: "CO280", setor: "CDR Tech", volume_2024: 0.25, volume_2025: 2.0, delta_pct: 87.50, region: 'world' },
];

function parseNumber(value: string): number {
  if (!value) return 0;
  // Handle 10.492.730 format or 9.750.000
  const sanitized = value.replace(/\./g, '').replace(',', '.').trim();
  return parseFloat(sanitized) || 0;
}

function parsePercent(value: string): number {
  if (!value) return 0;
  // Handle "122,80%" or "-30,36%"
  const sanitized = value.replace('%', '').replace(',', '.').trim();
  return parseFloat(sanitized) || 0;
}

async function syncCarbonBrazilTop50() {
  const filePath = path.join(process.cwd(), 'dados', '3. Mar-2026', 
    'Stakeholders - Tokenização Créditos de Carbono Brasil - Pesquisa IA - Mar_26.csv');
  
  if (!fs.existsSync(filePath)) {
    console.error(`Error: File not found at ${filePath}`);
    process.exit(1);
  }

  const rawContent = fs.readFileSync(filePath, 'utf-8');
  const lines = rawContent.split('\n');
  
  // Section for Carbon Brazil starts at line 55 (index 54)
  // Header is at line 56 (index 55)
  // Data starts at line 57 (index 56)
  const carbonBrazilSection = lines.slice(55, 106).join('\n');
  
  const { data, errors } = Papa.parse(carbonBrazilSection, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim()
  });

  if (errors.length > 0) {
    console.error('CSV Parse Errors:', errors);
    throw new Error('Failed to parse CSV');
  }

  const brazilStakeholders = data.map((row: any) => {
    // CSV has Rank, Empresa, Setor, Volume 2024 (tCO2​e), Volume 2025 (tCO2​e), Delta (%), Delta (tCO2​), Volume 2026 (YTD)
    const ranking = parseInt(row['Rank'] || row['rank'] || 0);
    const empresa = row['Empresa'] || row['empresa'];
    const setor = row['Setor'] || row['setor'];
    
    // The volume keys might have hidden characters (like the Zero Width Space in tCO2​e)
    // Let's use flexible key matching
    const v2024Key = Object.keys(row).find(k => k.includes('2024')) || '';
    const v2025Key = Object.keys(row).find(k => k.includes('2025')) || '';
    const deltaPctKey = Object.keys(row).find(k => k.includes('Delta (%)')) || '';
    
    const v2024 = parseNumber(row[v2024Key]);
    const v2025 = parseNumber(row[v2025Key]);
    const dPct = parsePercent(row[deltaPctKey]);

    return {
      ranking,
      region: 'brazil',
      empresa: empresa?.trim(),
      setor: setor?.trim(),
      volume_2024: v2024,
      volume_2025: v2025,
      delta_pct: dPct
    };
  }).filter(s => s.ranking > 0 && s.empresa);

  console.log(`Parsed ${brazilStakeholders.length} Brazil carbon stakeholders.`);
  
  const allData = [...brazilStakeholders, ...worldCarbonData];
  console.log(`Total stakeholders to upsert: ${allData.length}`);

  const { error } = await supabase
    .from('carbon_stakeholders')
    .upsert(allData, { onConflict: 'ranking,region' });

  if (error) {
    console.error('Upload Error:', error);
    throw error;
  }

  console.log('✅ carbon_stakeholders synced successfully!');

  // Update metadata
  await supabase.from('data_sources').upsert({
    source_name: 'Carbon Stakeholders Top 50 Brazil',
    source_url: 'multiple',
    data_type: 'carbon',
    last_updated: new Date().toISOString(),
    refresh_frequency: 'monthly'
  }, { onConflict: 'source_name' });

  console.log('✅ Data source metadata updated!');
}

syncCarbonBrazilTop50()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
