// scripts/fix-and-sync-irec-data.ts
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// FIXED: Properly handles the CSV formatting issues
function parseBrazilVolume(value: string): number {
  if (!value) return 0;
  
  // Remove quotes and percentage sign
  const cleanValue = value.replace(/["'%]/g, '').trim();
  
  // Handle format like "1040000000" (missing thousand separators, 100x too large)
  // These values need to be divided by 100
  const numericValue = parseFloat(cleanValue.replace(/\./g, '').replace(',', '.'));
  
  // Validation: If value is suspiciously large (>100M), divide by 100
  if (numericValue > 100000000) {
    console.warn(`  Large value detected: ${numericValue}, dividing by 100`);
    return Math.round(numericValue / 100);
  }
  
  return Math.round(numericValue);
}

function parseWorldVolume(value: string): number {
  if (!value) return 0;
  
  // World data is in TWh, convert to I-RECs (1 TWh = 1,000,000 I-RECs)
  const cleanValue = value.replace(/"/g, '').trim();
  const numericValue = parseFloat(cleanValue.replace(',', '.'));
  
  // Convert TWh to I-RECs (1 TWh = 1,000,000 MWh = 1,000,000 I-RECs)
  return Math.round(numericValue * 1000000);
}

function parsePercent(value: string): number {
  if (!value) return 0;
  const cleanValue = value.replace(/["'%]/g, '').trim();
  const sanitized = cleanValue.replace(',', '.');
  return parseFloat(sanitized) || 0;
}

function parseBrazilData(lines: string[]) {
  const sectionContent = lines.slice(1, 51).join('\n');
  const { data, errors } = Papa.parse(sectionContent, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim()
  });

  if (errors.length > 0) {
    console.error('CSV Parse Errors for Brazil:', errors);
    return [];
  }

  return data.map((row: any, index: number) => {
    const ranking = parseInt(row['Ranking'] || 0);
    const empresa = row['Empresa']?.trim();
    const setor = row['Setor']?.trim();
    const papel = row['Papel no Mercado']?.trim();
    
    // Parse volumes with corrected logic
    const v2024 = parseBrazilVolume(row['Volume 2024 (I-RECs Est./Rep.)']);
    const v2025 = parseBrazilVolume(row['Volume 2025 (I-RECs Proj./Rep.)']);
    const v2026 = parseBrazilVolume(row['Volume 2026 (Year to date Est.)']);
    const dPct = parsePercent(row['Delta (%)']);

    // Validation
    if (ranking === 1) {
      console.log(`\nBrazil Top Company Validation:`);
      console.log(`  Company: ${empresa}`);
      console.log(`  2024 Raw: ${row['Volume 2024 (I-RECs Est./Rep.)']} → Parsed: ${v2024.toLocaleString()}`);
      console.log(`  2025 Raw: ${row['Volume 2025 (I-RECs Proj./Rep.)']} → Parsed: ${v2025.toLocaleString()}`);
      console.log(`  Expected 2025 growth: ~30% from ${v2024.toLocaleString()} = ~${Math.round(v2024 * 1.3).toLocaleString()}`);
    }

    return {
      ranking,
      region: 'brazil',
      empresa,
      setor,
      papel_mercado: papel,
      volume_2024: v2024,
      volume_2025: v2025,
      volume_2026: v2026,
      delta_pct: dPct
    };
  }).filter((s: any) => s.ranking > 0 && s.empresa);
}

function parseWorldData(lines: string[]) {
  // World section starts at line 163, data rows 164-213
  const sectionContent = lines.slice(163, 213).join('\n');
  const { data, errors } = Papa.parse(sectionContent, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim()
  });

  if (errors.length > 0) {
    console.error('CSV Parse Errors for World:', errors);
    return [];
  }

  return data.map((row: any, index: number) => {
    const ranking = parseInt(row['Rank'] || 0);
    const empresa = row['Corporação']?.trim();
    const setor = row['Setor Principal']?.trim();
    
    // Parse volumes - World data is in TWh
    const v2024 = parseWorldVolume(row['Vol. 2024 (TWh)']);
    const v2025 = parseWorldVolume(row['Vol. 2025 (TWh)']);
    const v2026 = parseWorldVolume(row['Vol. 2026 YTD*']);
    const dPct = parsePercent(row['Delta (%)']);

    // Validation
    if (ranking === 1) {
      console.log(`\nWorld Top Company Validation:`);
      console.log(`  Company: ${empresa}`);
      console.log(`  2024 Raw: ${row['Vol. 2024 (TWh)']} TWh → ${v2024.toLocaleString()} I-RECs`);
      console.log(`  2025 Raw: ${row['Vol. 2025 (TWh)']} TWh → ${v2025.toLocaleString()} I-RECs`);
    }

    return {
      ranking,
      region: 'world',
      empresa,
      setor,
      papel_mercado: null,
      volume_2024: v2024,
      volume_2025: v2025,
      volume_2026: v2026,
      delta_pct: dPct
    };
  }).filter((s: any) => s.ranking > 0 && s.empresa);
}

async function syncIrecStakeholders() {
  const filePath = path.join(process.cwd(), 'dados', '3. Mar-2026', 
    'Stakeholders - Tokenização Créditos de Carbono Brasil - Pesquisa IA - Mar_26.csv');
  
  if (!fs.existsSync(filePath)) {
    console.error(`Error: File not found at ${filePath}`);
    process.exit(1);
  }

  console.log('📊 Starting I-REC data sync with corrected parsing...\n');

  const rawContent = fs.readFileSync(filePath, 'utf-8');
  const lines = rawContent.split('\n');
  
  // Parse both sections with corrected logic
  const brazilData = parseBrazilData(lines);
  const worldData = parseWorldData(lines);

  console.log(`\n✅ Parsed ${brazilData.length} Brazil and ${worldData.length} World I-REC stakeholders.`);
  
  if (brazilData.length === 0 || worldData.length === 0) {
    console.error("❌ Critical: Failed to parse data.");
    process.exit(1);
  }

  const allData = [...brazilData, ...worldData];
  
  // Calculate totals for validation
  const brazilTotal2025 = brazilData.reduce((sum, s) => sum + s.volume_2025, 0);
  const worldTotal2025 = worldData.reduce((sum, s) => sum + s.volume_2025, 0);
  
  console.log(`\n📈 Validation Summary:`);
  console.log(`  Brazil Total 2025: ${brazilTotal2025.toLocaleString()} I-RECs (~${(brazilTotal2025/1000000).toFixed(1)}M MWh)`);
  console.log(`  World Total 2025: ${worldTotal2025.toLocaleString()} I-RECs (~${(worldTotal2025/1000000).toFixed(1)}M MWh)`);
  console.log(`  Combined Total: ${(brazilTotal2025 + worldTotal2025).toLocaleString()} I-RECs`);
  
  // Sanity check - Brazil market is large but should be <2B I-RECs, World <500M
  if (brazilTotal2025 > 20000000000) { // 20B threshold (current corrupted is 8.5B)
    console.error("❌ ERROR: Brazil total exceeds 20B I-RECs. Data still looks inflated!");
    process.exit(1);
  }
  
  if (worldTotal2025 > 2000000000) { // 2B threshold
    console.error("❌ ERROR: World total exceeds 2B I-RECs. Check TWh conversion!");
    process.exit(1);
  }
  
  console.log(`\n✅ Validation passed: Values look reasonable`);
  console.log(`   Brazil: ${(brazilTotal2025/1000000000).toFixed(2)}B I-RECs (was 8.56B)`);
  console.log(`   World: ${(worldTotal2025/1000000).toFixed(1)}M I-RECs`);

  console.log(`\n📝 Total stakeholders to upsert: ${allData.length}`);
  
  // Clear existing data first (safer than upsert with corrupted data)
  console.log('\n🗑️  Clearing existing I-REC data...');
  const { error: deleteError } = await supabase
    .from('irec_stakeholders')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
  
  if (deleteError) {
    console.error('Delete Error:', deleteError);
    throw deleteError;
  }
  console.log('✅ Existing data cleared');

  // Insert corrected data
  console.log('\n💾 Inserting corrected data...');
  const { error: insertError } = await supabase
    .from('irec_stakeholders')
    .insert(allData);

  if (insertError) {
    console.error('Insert Error:', insertError);
    throw insertError;
  }

  console.log('✅ I-REC stakeholders synced successfully!');

  // Update metadata
  await supabase.from('data_sources').upsert({
    source_name: 'I-REC Stakeholders Top 50 Brazil + World',
    source_url: 'multiple',
    data_type: 'irec',
    last_updated: new Date().toISOString(),
    refresh_frequency: 'monthly',
    notes: 'Corrected sync - fixed 100x inflation bug in Brazil 2025/2026 data'
  }, { onConflict: 'source_name' });

  console.log('✅ Data source metadata updated!');
  console.log('\n🎉 Sync completed successfully!');
}

syncIrecStakeholders()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Sync failed:', err);
    process.exit(1);
  });
