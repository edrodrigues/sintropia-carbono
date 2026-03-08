import 'dotenv/config';
import { resolve } from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

const RESEND_API_KEY = process.env.RESEND_API_KEY!;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const resend = new Resend(RESEND_API_KEY);

const FROM_EMAIL = 'Sintropia <contato@contato.sintropia.space>';
const APP_URL = 'https://sintropia.space';

async function getUsers() {
  console.log('Fetching users and profiles...');
  
  // 1. Get all profiles (to get display_name and check if banned)
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, username, display_name, role')
    .neq('role', 'banned');

  if (profilesError) throw profilesError;
  
  // 2. Get auth users (to get emails)
  const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
  
  if (authError) throw authError;

  // Merge data
  const recipients = profiles.map(profile => {
    const authUser = authData.users.find(u => u.id === profile.id);
    if (!authUser || !authUser.email) return null;
    
    return {
      email: authUser.email,
      name: profile.display_name || `@${profile.username}`,
    };
  }).filter((r): r is { email: string; name: string } => r !== null);

  return recipients;
}

function createEmailHtml(name: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #064e3b 0%, #10b981 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
    .content { background: #fff; padding: 30px; border: 1px solid #eee; border-radius: 0 0 10px 10px; }
    .feature-box { background: #fffbeb; border: 1px solid #fde68a; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .btn { display: inline-block; background: #10b981; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 20px; }
    .footer { text-align: center; font-size: 12px; color: #999; margin-top: 20px; }
    h1 { margin: 0; }
    h2 { color: #064e3b; }
    .highlight { color: #d97706; font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🌱 Sintropia</h1>
    </div>
    <div class="content">
      <p>Olá, <strong>${name}</strong>!</p>
      
      <p>No mercado de carbono e energia, as dúvidas surgem a cada nova regulamentação ou tendência. Sabemos que o conhecimento coletivo é o que faz a nossa comunidade crescer, e por isso acabamos de lançar uma funcionalidade exclusiva: <span class="highlight">o post de "Pedir Ajuda"</span>.</p>

      <div class="feature-box">
        <h2>O que mudou?</h2>
        <p>Agora, ao criar uma publicação, você encontrará a categoria <strong>"Pedir Ajuda"</strong>. Ela foi desenhada para se destacar no feed com uma identidade visual própria (em tons de âmbar), garantindo que sua dúvida não passe despercebida pelos nossos especialistas.</p>
      </div>

      <h2>Por que usar?</h2>
      <ul>
        <li><strong>Visibilidade Prioritária:</strong> Posts de ajuda ganham destaque visual para atrair respostas mais rápidas.</li>
        <li><strong>Comunidade Ativa:</strong> Seus colegas de mercado estão prontos para compartilhar experiências e soluções.</li>
        <li><strong>Gamificação:</strong> Ganhe pontos de <strong>Karma</strong>, desbloqueie o badge de <strong>Mentor</strong> ou conquiste o novo achievement <strong>"Buscador de Ajuda"</strong>!</li>
      </ul>

      <p>É simples: acesse o feed, clique em criar post e selecione a categoria "Pedir Ajuda".</p>

      <div style="text-align: center;">
        <a href="${APP_URL}/feed" class="btn">Explorar o Feed</a>
      </div>

      <p style="margin-top: 30px;">Estamos ansiosos para ver a nossa rede se apoiando cada vez mais. Se tiver qualquer dúvida sobre como usar, você já sabe: <strong>é só pedir ajuda!</strong></p>
      
      <p>Nos vemos no feed,<br><strong>Equipe Sintropia</strong></p>
    </div>
    <div class="footer">
      <p>Projeto Open Source para um Futuro Sustentável</p>
      <p><a href="${APP_URL}" style="color: #10b981;">sintropia.space</a></p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

async function run() {
  try {
    const recipients = await getUsers();
    console.log(`Found ${recipients.length} non-banned recipients.`);

    if (recipients.length === 0) {
      console.log('No recipients to send to.');
      return;
    }

    // Split into batches of 100 (Resend limit per batch is 100 usually, but we'll use batch api)
    // Actually resend.batch.send takes an array. 
    // For many users, we should chunk it to be safe.
    const CHUNK_SIZE = 100;
    for (let i = 0; i < recipients.length; i += CHUNK_SIZE) {
      const chunk = recipients.slice(i, i + CHUNK_SIZE);
      console.log(`Sending batch ${Math.floor(i/CHUNK_SIZE) + 1} (${chunk.length} emails)...`);
      
      const { data, error } = await resend.batch.send(
        chunk.map(r => ({
          from: FROM_EMAIL,
          to: [r.email],
          subject: '🆘 Precisa de uma mãozinha? Conheça o novo "Pedir Ajuda" no Sintropia!',
          html: createEmailHtml(r.name),
        }))
      );

      if (error) {
        console.error('Error in batch:', error);
      } else {
        console.log(`Batch sent successfully. ID:`, data);
      }
    }

    console.log('All batches processed.');
  } catch (error) {
    console.error('Fatal error:', error);
  }
}

run();
