import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const CSV_PATH = path.join(__dirname, '..', 'dados', 'CarbonPlan', 'projects.csv');

function parseCSV(content) {
  const lines = content.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = values[index]?.trim() || '';
    });
    rows.push(row);
  }
  return rows;
}

async function insertProjects(projects, batchSize = 100) {
  const totalBatches = Math.ceil(projects.length / batchSize);
  
  for (let i = 0; i < projects.length; i += batchSize) {
    const batch = projects.slice(i, i + batchSize);
    const batchNum = Math.floor(i / batchSize) + 1;
    
    const records = batch.map(p => ({
      project_id: p.project_id,
      name: p.name || null,
      category: p.category || null,
      country: p.country || null,
      project_type: p.project_type || null,
      project_type_source: p.project_type_source || null,
      project_url: p.project_url || null,
      proponent: p.proponent || null,
      protocol: p.protocol || null,
      registry: p.registry || null,
      status: p.status || null,
      is_compliance: p.is_compliance === 'True',
      issued: parseInt(p.issued) || 0,
      retired: parseInt(p.retired) || 0,
    }));
    
    const { data, error } = await supabase
      .from('carbon_projects')
      .upsert(records, { onConflict: 'project_id' });
    
    if (error) {
      console.error(`Batch ${batchNum}/${totalBatches} error:`, error.message);
    } else {
      console.log(`Batch ${batchNum}/${totalBatches} inserted/updated successfully (${records.length} records)`);
    }
  }
}

async function main() {
  console.log('Reading CSV file...');
  const content = fs.readFileSync(CSV_PATH, 'utf-8');
  
  console.log('Parsing CSV...');
  const projects = parseCSV(content);
  console.log(`Found ${projects.length} projects`);
  
  console.log('Inserting projects into database...');
  await insertProjects(projects);
  
  console.log('Done!');
  
  const { count } = await supabase
    .from('carbon_projects')
    .select('*', { count: 'exact', head: true });
  
  console.log(`Total projects in database: ${count}`);
}

main().catch(console.error);
