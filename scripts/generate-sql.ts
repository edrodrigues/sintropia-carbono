import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECTS_CSV_PATH = path.join(__dirname, '..', 'dados', 'CarbonPlan', 'projects.csv');
const CREDITS_CSV_PATH = path.join(__dirname, '..', 'dados', 'CarbonPlan', 'credits.csv');

type CSVRow = Record<string, string>;

function parseCSV(content: string): CSVRow[] {
  const lines = content.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  
  const rows: CSVRow[] = [];
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

function generateProjectsSQL(projects: CSVRow[]) {
  let sql = 'INSERT INTO carbon_projects (project_id, name, category, country, project_type, project_type_source, project_url, proponent, protocol, registry, status, is_compliance, issued, retired) VALUES\n';
  
  const values = projects.map(p => {
    const isCompliances = p.is_compliance === 'True' ? 'true' : 'false';
    return `('${p.project_id}', '${p.name.replace(/'/g, "''")}', '${p.category}', '${p.country}', '${p.project_type}', '${p.project_type_source}', '${p.project_url}', '${p.proponent.replace(/'/g, "''")}', '${p.protocol}', '${p.registry}', '${p.status}', ${isCompliances}, ${parseInt(p.issued) || 0}, ${parseInt(p.retired) || 0})`;
  });
  
  sql += values.join(',\n');
  sql += '\nON CONFLICT (project_id) DO NOTHING;';
  
  return sql;
}

function generateCreditsSQL(credits: CSVRow[]) {
  let sql = 'INSERT INTO carbon_credits (project_id, quantity, vintage, transaction_date, transaction_type) VALUES\n';
  
  const values = credits.map(c => {
    const date = c.transaction_date ? c.transaction_date.split(' ')[0] : 'NULL';
    return `('${c.project_id}', ${parseInt(c.quantity) || 0}, ${parseInt(c.vintage) || 0}, '${date}', '${c.transaction_type}')`;
  });
  
  sql += values.join(',\n');
  sql += '\nON CONFLICT DO NOTHING;';
  
  return sql;
}

async function main() {
  console.log('Reading projects CSV...');
  const projectsContent = fs.readFileSync(PROJECTS_CSV_PATH, 'utf-8');
  const projects = parseCSV(projectsContent);
  console.log(`Found ${projects.length} projects`);
  
  console.log('Reading credits CSV...');
  const creditsContent = fs.readFileSync(CREDITS_CSV_PATH, 'utf-8');
  const credits = parseCSV(creditsContent);
  console.log(`Found ${credits.length} credits`);
  
  const projectIds = new Set(projects.map(p => p.project_id));
  const validCredits = credits.filter(c => projectIds.has(c.project_id));
  console.log(`Found ${validCredits.length} credits with valid project_ids`);
  
  console.log('\nGenerating projects SQL...');
  const projectsSQL = generateProjectsSQL(projects);
  fs.writeFileSync('projects_insert.sql', projectsSQL);
  console.log('Written to projects_insert.sql');
  
  console.log('\nGenerating credits SQL (chunked)...');
  const chunkSize = 5000;
  for (let i = 0; i < validCredits.length; i += chunkSize) {
    const chunk = validCredits.slice(i, i + chunkSize);
    const chunkNum = Math.floor(i / chunkSize) + 1;
    const creditsSQL = generateCreditsSQL(chunk);
    fs.writeFileSync(`credits_insert_${chunkNum}.sql`, creditsSQL);
    console.log(`Written credits_insert_${chunkNum}.sql (${chunk.length} records)`);
  }
  
  console.log('\nDone!');
}

main().catch(console.error);
