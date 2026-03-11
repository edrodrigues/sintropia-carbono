// scripts/upload-carbon-stakeholders.ts
import { createClient } from '@supabase/supabase-js';
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

// Data for Brazil (from Carbono Brasil page)
const brazilData = [
  { ranking: 1, empresa: "Banco Votorantim", setor: "Financeiro", volume_2024: 3.8, volume_2025: 5.2, delta_pct: 36.84, region: 'brazil' },
  { ranking: 2, empresa: "Petrobras", setor: "Energia", volume_2024: 0.68, volume_2025: 0.75, delta_pct: 10.29, region: 'brazil' },
  { ranking: 3, empresa: "Suzano", setor: "Celulose", volume_2024: 0.42, volume_2025: 0.58, delta_pct: 38.1, region: 'brazil' },
  { ranking: 4, empresa: "Vale", setor: "Mineração", volume_2024: 0.38, volume_2025: 0.45, delta_pct: 18.42, region: 'brazil' },
  { ranking: 5, empresa: "Itaú", setor: "Financeiro", volume_2024: 0.31, volume_2025: 0.39, delta_pct: 25.81, region: 'brazil' },
  { ranking: 6, empresa: "Bradesco", setor: "Financeiro", volume_2024: 0.29, volume_2025: 0.36, delta_pct: 24.14, region: 'brazil' },
  { ranking: 7, empresa: "Klabin", setor: "Celulose", volume_2024: 0.25, volume_2025: 0.32, delta_pct: 28.0, region: 'brazil' },
  { ranking: 8, empresa: "Natura", setor: "Cosméticos", volume_2024: 0.23, volume_2025: 0.29, delta_pct: 26.09, region: 'brazil' },
  { ranking: 9, empresa: "Banco do Brasil", setor: "Financeiro", volume_2024: 0.21, volume_2025: 0.27, delta_pct: 28.57, region: 'brazil' },
  { ranking: 10, empresa: "Gerdau", setor: "Siderurgia", volume_2024: 0.195, volume_2025: 0.25, delta_pct: 28.21, region: 'brazil' },
  { ranking: 11, empresa: "Lojas Renner", setor: "Varejo", volume_2024: 0.18, volume_2025: 0.24, delta_pct: 33.33, region: 'brazil' },
  { ranking: 12, empresa: "GOL", setor: "Aviação", volume_2024: 0.175, volume_2025: 0.23, delta_pct: 31.43, region: 'brazil' },
  { ranking: 13, empresa: "Azul", setor: "Aviação", volume_2024: 0.165, volume_2025: 0.215, delta_pct: 30.3, region: 'brazil' },
  { ranking: 14, empresa: "Ambev", setor: "Bebidas", volume_2024: 0.15, volume_2025: 0.195, delta_pct: 30.0, region: 'brazil' },
  { ranking: 15, empresa: "JBS", setor: "Proteína Animal", volume_2024: 0.14, volume_2025: 0.18, delta_pct: 28.57, region: 'brazil' },
  { ranking: 16, empresa: "Raízen", setor: "Energia", volume_2024: 0.135, volume_2025: 0.17, delta_pct: 25.93, region: 'brazil' },
  { ranking: 17, empresa: "Cosan", setor: "Energia", volume_2024: 0.12, volume_2025: 0.155, delta_pct: 29.17, region: 'brazil' },
  { ranking: 18, empresa: "Cielo", setor: "Serviços Fin.", volume_2024: 0.115, volume_2025: 0.15, delta_pct: 30.43, region: 'brazil' },
  { ranking: 19, empresa: "Marfrig", setor: "Proteína Animal", volume_2024: 0.105, volume_2025: 0.14, delta_pct: 33.33, region: 'brazil' },
  { ranking: 20, empresa: "Localiza", setor: "Logística", volume_2024: 0.095, volume_2025: 0.13, delta_pct: 36.84, region: 'brazil' },
];

// Data for World (from Carbono Mundo page)
const worldData = [
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

async function uploadCarbonStakeholders() {
  const allData = [...brazilData, ...worldData];
  console.log(`Preparing to upload ${allData.length} carbon stakeholders...`);

  const { error } = await supabase
    .from('carbon_stakeholders')
    .upsert(allData, { onConflict: 'ranking,region' });

  if (error) {
    console.error('Upload Error:', error);
    throw error;
  }

  console.log('✅ Upload to carbon_stakeholders completed successfully!');
}

uploadCarbonStakeholders()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
