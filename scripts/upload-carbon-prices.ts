// scripts/upload-carbon-prices.ts
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

const complianceData = [
    { market_type: "compliance", market_name: "European Union ETS (EU ETS)", region: "Europe", price_range: "€60 - €80", currency: "EUR", observation: "Maior mercado do mundo. Média 2024: €65", update_date: "Mar 2026" },
    { market_type: "compliance", market_name: "United Kingdom ETS (UK ETS)", region: "Reino Unido", price_range: "£35 - £45", currency: "GBP", observation: "Geralmente negociado com desconto vs EU ETS", update_date: "Mar 2026" },
    { market_type: "compliance", market_name: "California Cap and Trade", region: "EUA (Califórnia)", price_range: "$28 - $32", currency: "USD", observation: "Preço mínimo 2024: $20.82", update_date: "Mar 2026" },
    { market_type: "compliance", market_name: "RGGI", region: "EUA (Nordeste)", price_range: "$13 - $16", currency: "USD", observation: "Teto reduzindo 30% até 2030", update_date: "Mar 2026" },
    { market_type: "compliance", market_name: "China National ETS", region: "China", price_range: "$11 - $14", currency: "USD", observation: "Maior do mundo por cobertura (4.5B tCO2e)", update_date: "Mar 2026" },
];

const voluntaryData = [
    { market_type: "voluntary", market_name: "Alta Integridade", region: "Global", price_range: "$14.80", currency: "USD", observation: "Conforme Princípios Básicos de Carbono", update_date: "Mar 2026" },
    { market_type: "voluntary", market_name: "Médio (Padrão)", region: "Global", price_range: "$7 - $10", currency: "USD", observation: "VCS/Gold Standard padrão", update_date: "Mar 2026" },
    { market_type: "voluntary", market_name: "Baixa Qualidade", region: "Global", price_range: "$3.50", currency: "USD", observation: "Créditos legados, safras antigas", update_date: "Mar 2026" },
    { market_type: "voluntary", market_name: "REDD+ (Nature-based)", region: "Brasil/Global", price_range: "$12 - $18", currency: "USD", observation: "Alta qualidade", update_date: "Mar 2026" },
    { market_type: "voluntary", market_name: "ARR (Remoções)", region: "Brasil/Global", price_range: "$15 - $25", currency: "USD", observation: "Florestamento e Reflorestamento", update_date: "Mar 2026" },
    { market_type: "voluntary", market_name: "Biochar", region: "Global", price_range: "$100 - $200", currency: "USD", observation: "Tecnologia em escala", update_date: "Mar 2026" },
    { market_type: "voluntary", market_name: "DAC (Captura Direta)", region: "Global", price_range: "$300 - $600", currency: "USD", observation: "Tecnologia de ponta (CDR)", update_date: "Mar 2026" },
];

async function uploadCarbonPrices() {
  const allData = [...complianceData, ...voluntaryData];
  console.log(`Preparing to upload ${allData.length} Carbon prices...`);

  // First, clear existing to avoid duplicates
  await supabase.from('carbon_prices').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  const { error } = await supabase
    .from('carbon_prices')
    .insert(allData);

  if (error) {
    console.error('Upload Error:', error);
    throw error;
  }

  console.log('✅ Upload to carbon_prices completed successfully!');
}

uploadCarbonPrices()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
