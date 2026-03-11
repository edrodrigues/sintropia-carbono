// scripts/upload-irec-prices.ts
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

const brasilData = [
    { category: "brazil", technology: "Hidro", price_range: "$0.16 - $0.18", vintage: "2023-2024", update_date: "Fev 2025" },
    { category: "brazil", technology: "Eólica", price_range: "$0.19 - $0.24", vintage: "2024-2025", update_date: "Fev 2025" },
    { category: "brazil", technology: "Solar", price_range: "$0.19 - $0.236", vintage: "2024-2025", update_date: "Fev 2025" },
];

const amLatinaData = [
    { category: "latam", country: "Brasil", technology: "Hidro", price_range: "$0.16 - $0.18", trend: "↔️ Estável" },
    { category: "latam", country: "México", technology: "Eólica", price_range: "$4.30 - $5.05", trend: "⬆️ +187%" },
    { category: "latam", country: "Chile", technology: "Eólica/Solar", price_range: "$2.40 - $3.00", trend: "↗️ Crescendo" },
    { category: "latam", country: "Colômbia", technology: "Hidro", price_range: "$1.05 - $1.15", trend: "↗️ Crescendo" },
];

const globalData = [
    { category: "asia_pacific", country: "China", technology: "Eólica", price_range: "$0.70 - $0.95", observation: "⚠️ Saiu do I-REC (31/03/25)" },
    { category: "asia_pacific", country: "Índia", technology: "Solar", price_range: "$0.79 - $0.86", observation: "⬆️ Demanda crescendo" },
    { category: "asia_pacific", country: "Malásia", technology: "Solar", price_range: "$5.55", observation: "↗️ Em desenvolvimento" },
    { category: "asia_pacific", country: "Singapura", technology: "Solar", price_range: "$75.00", observation: "⬆️ Premium por escassez" },
];

async function uploadIrecPrices() {
  const allData = [...brasilData, ...amLatinaData, ...globalData];
  console.log(`Preparing to upload ${allData.length} I-REC prices...`);

  // Simple insert because we don't have a unique constraint on multiple columns yet, 
  // but for script purpose, we can just clear and insert or use a smart upsert if we had keys.
  // For now, let's just insert.
  
  // First, clear existing to avoid duplicates if re-run
  await supabase.from('irec_prices').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  const { error } = await supabase
    .from('irec_prices')
    .insert(allData);

  if (error) {
    console.error('Upload Error:', error);
    throw error;
  }

  console.log('✅ Upload to irec_prices completed successfully!');
}

uploadIrecPrices()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
