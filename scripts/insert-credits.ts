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

const CSV_PATH = path.join(__dirname, '..', 'dados', 'CarbonPlan', 'credits.csv');

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

async function getExistingProjectIds() {
  const { data, error } = await supabase
    .from('carbon_projects')
    .select('project_id');
  
  if (error) {
    console.error('Error fetching project IDs:', error.message);
    return new Set<string>();
  }
  
  return new Set(data.map(p => p.project_id));
}

async function insertCredits(credits, projectIds, batchSize = 1000) {
  const validCredits = credits.filter(c => projectIds.has(c.project_id));
  console.log(`Filtering to ${validCredits.length} credits with valid project_ids`);
  
  const totalBatches = Math.ceil(validCredits.length / batchSize);
  
  for (let i = 0; i < validCredits.length; i += batchSize) {
    const batch = validCredits.slice(i, i + batchSize);
    const batchNum = Math.floor(i / batchSize) + 1;
    
    const records = batch.map(c => {
      let transactionDate = null;
      if (c.transaction_date) {
        const dateStr = c.transaction_date.split(' ')[0];
        if (dateStr && dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
          transactionDate = dateStr;
        }
      }
      
      return {
        project_id: c.project_id,
        quantity: parseInt(c.quantity) || 0,
        vintage: parseInt(c.vintage) || null,
        transaction_date: transactionDate,
        transaction_type: c.transaction_type || null,
        retirement_account: c.retirement_account || null,
        retirement_beneficiary: c.retirement_beneficiary || null,
        retirement_beneficiary_harmonized: c.retirement_beneficiary_harmonized || null,
        retirement_note: c.retirement_note || null,
        retirement_reason: c.retirement_reason || null,
      };
    });
    
    const { data, error } = await supabase
      .from('carbon_credits')
      .insert(records);
    
    if (error) {
      console.error(`Batch ${batchNum}/${totalBatches} error:`, error.message);
    } else {
      console.log(`Batch ${batchNum}/${totalBatches} inserted successfully (${records.length} records)`);
    }
  }
}

async function main() {
  console.log('Reading CSV file...');
  const content = fs.readFileSync(CSV_PATH, 'utf-8');
  
  console.log('Parsing CSV...');
  const credits = parseCSV(content);
  console.log(`Found ${credits.length} credit records`);
  
  console.log('Fetching existing project IDs...');
  const projectIds = await getExistingProjectIds();
  console.log(`Found ${projectIds.size} projects in database`);
  
  console.log('Inserting credits into database...');
  await insertCredits(credits, projectIds);
  
  console.log('Done!');
  
  const { count } = await supabase
    .from('carbon_credits')
    .select('*', { count: 'exact', head: true });
  
  console.log(`Total credits in database: ${count}`);
}

main().catch(console.error);
