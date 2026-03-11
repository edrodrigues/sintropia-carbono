// scripts/sync-carbon-stakeholders.ts
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

function parseNumber(value: string): number {
  if (!value) return 0;
  const sanitized = value.replace(/\./g, '').replace(',', '.').trim();
  return parseFloat(sanitized) || 0;
}

function parsePercent(value: string): number {
  if (!value) return 0;
  const sanitized = value.replace('%', '').replace(',', '.').trim();
  return parseFloat(sanitized) || 0;
}

function extractSection(lines: string[], startLine: number, endLine: number, region: 'brazil' | 'world') {
  const sectionContent = lines.slice(startLine, endLine + 1).join('\n');
  const { data, errors } = Papa.parse(sectionContent, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim()
  });

  if (errors.length > 0) {
    console.error(`CSV Parse Errors for ${region}:`, errors);
    return [];
  }

  return data.map((row: any) => {
    const ranking = parseInt(row['Rank'] || row['rank'] || 0);
    const empresa = row['Empresa'] || row['empresa'];
    const setor = row['Setor'] || row['setor'];
    
    const v2024Key = Object.keys(row).find(k => k.includes('2024')) || '';
    const v2025Key = Object.keys(row).find(k => k.includes('2025')) || '';
    const deltaPctKey = Object.keys(row).find(k => k.includes('Delta (%)')) || '';
    
    const v2024 = parseNumber(row[v2024Key]);
    const v2025 = parseNumber(row[v2025Key]);
    const dPct = parsePercent(row[deltaPctKey]);

    return {
      ranking,
      region,
      empresa: empresa?.trim(),
      setor: setor?.trim(),
      volume_2024: v2024,
      volume_2025: v2025,
      delta_pct: dPct
    };
  }).filter(s => s.ranking > 0 && s.empresa);
}

async function syncCarbonStakeholders() {
  const filePath = path.join(process.cwd(), 'dados', '3. Mar-2026', 
    'Stakeholders - Tokenização Créditos de Carbono Brasil - Pesquisa IA - Mar_26.csv');
  
  if (!fs.existsSync(filePath)) {
    console.error(`Error: File not found at ${filePath}`);
    process.exit(1);
  }

  const rawContent = fs.readFileSync(filePath, 'utf-8');
  const lines = rawContent.split('\n');
  
  // Brazil: starts at 55 (index 54), header 56, data ends at 105
  const brazilData = extractSection(lines, 55, 105, 'brazil');
  
  // World: starts at 109 (index 108), header 110, data ends at 159
  const worldData = extractSection(lines, 109, 159, 'world');

  console.log(`Parsed ${brazilData.length} Brazil and ${worldData.length} World carbon stakeholders.`);
  
  const allData = [...brazilData, ...worldData];
  console.log(`Total stakeholders to upsert: ${allData.length}`);

  const { error } = await supabase
    .from('carbon_stakeholders')
    .upsert(allData, { onConflict: 'ranking,region' });

  if (error) {
    console.error('Upload Error:', error);
    throw error;
  }

  console.log('✅ carbon_stakeholders synced successfully (100 total)!');

  // Update metadata
  await supabase.from('data_sources').upsert({
    source_name: 'Carbon Stakeholders Top 50 Brazil + World',
    source_url: 'multiple',
    data_type: 'carbon',
    last_updated: new Date().toISOString(),
    refresh_frequency: 'monthly'
  }, { onConflict: 'source_name' });

  console.log('✅ Data source metadata updated!');
}

syncCarbonStakeholders()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
