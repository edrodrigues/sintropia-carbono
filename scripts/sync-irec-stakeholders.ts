// scripts/sync-irec-stakeholders.ts
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
  // Handle 8.000.000 or "24,5" formats
  const sanitized = value.replace(/\./g, '').replace(',', '.').trim();
  return parseFloat(sanitized) || 0;
}

function parsePercent(value: string): number {
  if (!value) return 0;
  const sanitized = value.replace('%', '').replace(',', '.').trim();
  return parseFloat(sanitized) || 0;
}

function extractSection(lines: string[], startLine: number, endLine: number, region: 'brazil' | 'world') {
  // Map lines to remove leading comma if it exists
  const cleanedLines = lines.slice(startLine, endLine + 1).map(line => {
      if (line.startsWith(',')) return line.substring(1);
      return line;
  });
  
  const sectionContent = cleanedLines.join('\n');
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
    const ranking = parseInt(row['Ranking'] || row['Rank'] || row['rank'] || 0);
    const empresa = row['Empresa'] || row['Corporação'] || row['corporacao'] || row['Corporacao'];
    const setor = row['Setor'] || row['Setor Principal'] || row['setor'];
    const papel = row['Papel no Mercado'] || row['papel'];
    
    const v2024Key = Object.keys(row).find(k => k.includes('2024')) || '';
    const v2025Key = Object.keys(row).find(k => k.includes('2025')) || '';
    const v2026Key = Object.keys(row).find(k => k.includes('2026')) || '';
    const deltaPctKey = Object.keys(row).find(k => k.includes('Delta (%)')) || '';
    
    let v2024 = parseNumber(row[v2024Key]);
    let v2025 = parseNumber(row[v2025Key]);
    let v2026 = parseNumber(row[v2026Key]);
    
    if (region === 'world') {
        v2024 *= 1000000;
        v2025 *= 1000000;
        v2026 *= 1000000;
    }

    const dPct = parsePercent(row[deltaPctKey]);

    return {
      ranking,
      region,
      empresa: empresa?.trim(),
      setor: setor?.trim(),
      papel_mercado: papel?.trim(),
      volume_2024: Math.round(v2024),
      volume_2025: Math.round(v2025),
      volume_2026: Math.round(v2026),
      delta_pct: dPct
    };
  }).filter(s => s.ranking > 0 && s.empresa);
}

async function syncIrecStakeholders() {
  const filePath = path.join(process.cwd(), 'dados', '3. Mar-2026', 
    'Stakeholders - Tokenização Créditos de Carbono Brasil - Pesquisa IA - Mar_26.csv');
  
  if (!fs.existsSync(filePath)) {
    console.error(`Error: File not found at ${filePath}`);
    process.exit(1);
  }

  const rawContent = fs.readFileSync(filePath, 'utf-8');
  const lines = rawContent.split('\n');
  
  // Brazil: header is at index 1 (line 2)
  const brazilData = extractSection(lines, 1, 51, 'brazil');
  
  // World: header is at index 163 (line 164)
  const worldData = extractSection(lines, 163, 213, 'world');

  console.log(`Parsed ${brazilData.length} Brazil and ${worldData.length} World I-REC stakeholders.`);
  
  if (brazilData.length === 0 || worldData.length === 0) {
      console.error("Critical: Failed to parse data. Check indices and leading commas.");
      process.exit(1);
  }

  const allData = [...brazilData, ...worldData];
  console.log(`Total stakeholders to upsert: ${allData.length}`);

  const { error } = await supabase
    .from('irec_stakeholders')
    .upsert(allData, { onConflict: 'ranking,region' });

  if (error) {
    console.error('Upload Error:', error);
    throw error;
  }

  console.log('✅ irec_stakeholders synced successfully (100 total)!');

  // Update metadata
  await supabase.from('data_sources').upsert({
    source_name: 'I-REC Stakeholders Top 50 Brazil + World',
    source_url: 'multiple',
    data_type: 'irec',
    last_updated: new Date().toISOString(),
    refresh_frequency: 'monthly'
  }, { onConflict: 'source_name' });

  console.log('✅ Data source metadata updated!');
}

syncIrecStakeholders()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
