import 'dotenv/config';
import { resolve } from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: resolve(__dirname, '../.env.local') });

import { Resend } from 'resend';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
if (!RESEND_API_KEY) {
  console.error('RESEND_API_KEY is not set');
  process.exit(1);
}
const resend = new Resend(RESEND_API_KEY);

const APP_URL = 'https://sintropia.space/';

const styles = `
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { 
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    background-color: #0f172a; 
    color: #f8fafc; 
    line-height: 1.6;
  }
  .container { 
    max-width: 600px; 
    margin: 0 auto; 
    padding: 40px 20px; 
  }
  .card { 
    background-color: #1e293b; 
    border-radius: 12px; 
    padding: 32px; 
    border: 1px solid #334155;
  }
  .logo { 
    text-align: center; 
    margin-bottom: 24px; 
  }
  .logo h1 { 
    color: #10b981; 
    font-size: 28px; 
    font-weight: 700;
  }
  .logo span { 
    color: #f8fafc; 
  }
  h1 { 
    color: #10b981; 
    font-size: 24px; 
    font-weight: 600; 
    margin-bottom: 20px;
  }
  h2 { 
    color: #10b981; 
    font-size: 20px; 
    font-weight: 600; 
    margin: 24px 0 12px;
  }
  h3 { 
    color: #f8fafc; 
    font-size: 16px; 
    font-weight: 600; 
    margin: 20px 0 8px;
  }
  p { 
    color: #cbd5e1; 
    margin-bottom: 16px;
  }
  ul { 
    color: #cbd5e1; 
    margin: 12px 0;
    padding-left: 20px;
  }
  li { 
    margin-bottom: 8px;
  }
  .btn { 
    display: inline-block; 
    background-color: #10b981; 
    color: #ffffff; 
    padding: 14px 28px; 
    text-decoration: none; 
    border-radius: 8px; 
    font-weight: 600;
    margin-top: 8px;
  }
  .btn:hover {
    background-color: #059669;
  }
  .footer { 
    text-align: center; 
    margin-top: 32px; 
    padding-top: 24px; 
    border-top: 1px solid #334155;
  }
  .footer p { 
    color: #64748b; 
    font-size: 14px;
    margin-bottom: 8px;
  }
  .footer a {
    color: #10b981;
    text-decoration: none;
  }
  .highlight {
    background-color: #10b981;
    color: #ffffff;
    padding: 2px 8px;
    border-radius: 4px;
    font-weight: 600;
  }
</style>
`;

function buildEmail(title: string, content: string, ctaLink?: string, ctaText?: string) {
  const cta = ctaLink && ctaText ? `<a href="${ctaLink}" class="btn">${ctaText}</a>` : '';
  
  return `
<div class="card">
  <div class="logo">
    <h1>Sintropia<span></span></h1>
  </div>
  <h1>${title}</h1>
  ${content}
  ${cta}
  <div class="footer">
    <p>© 2026 Sintropia. Projeto Open Source e Feito com ❤️  em Recife/Pernambuco.</p>
    <p><a href="${APP_URL}">Acesse a Sintropia</a></p>
  </div>
</div>
  `.trim();
}

function buildWelcomeEmailHtml(name: string) {
  const title = 'Bem-vindo(a) à Sintropia 🌿';
  const content = `
    <p>Olá ${name},</p>
    <p>Obrigado por se juntar à comunidade Sintropia. Estamos muito animados em tê-lo conosco!</p>
    <p>Com sua conta, você pode:</p>
    <ul>
      <li>Acompanhar preços de carbono e créditos IREC em tempo real</li>
      <li>Conectar-se com outros profissionais do mercado</li>
      <li>Compartilhar conteúdo e participar de discussões</li>
      <li>Explorar oportunidades de negócio</li>
    </ul>
  `;
  const html = buildEmail(title, content, APP_URL, 'Começar agora');
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  ${styles}
</head>
<body>
  <div class="container">
    ${html}
  </div>
</body>
</html>
  `.trim();
}

async function sendEmail(to: string, name: string) {
  try {
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    const FROM_ADDRESS = 'Sintropia <noreply@contato.sintropia.space>';
    
    const { data, error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to,
      subject: 'Bem-vindo(a) à Sintropia 🌿',
      html: buildWelcomeEmailHtml(name),
    });

    if (error) {
      console.error(`Failed to send to ${to}:`, error);
      return { success: false, error, email: to };
    }

    console.log(`Sent to ${to}:`, data?.id);
    return { success: true, data, email: to };
  } catch (error) {
    console.error(`Exception sending to ${to}:`, error);
    return { success: false, error, email: to };
  }
}

async function getAudienceContacts(audienceId: string) {
  const contacts: { email: string; first_name?: string }[] = [];
  let cursor: string | undefined;
  let attempts = 0;
  const maxAttempts = 3;

  do {
    try {
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const listOptions: { audienceId: string; limit: number; cursor?: string } = {
        audienceId,
        limit: 100,
      };
      if (cursor) listOptions.cursor = cursor;
      
      const { data, error } = await resend.contacts.list(listOptions);

      if (error) {
        if (error.name === 'rate_limit_exceeded') {
          attempts++;
          if (attempts < maxAttempts) {
            console.log(`Rate limited, retrying in 2 seconds... (attempt ${attempts}/${maxAttempts})`);
            await new Promise(resolve => setTimeout(resolve, 2000));
            continue;
          }
        }
        console.error('Error fetching contacts:', error);
        throw error;
      }

      if (data?.data) {
        contacts.push(...data.data.map(c => ({
          email: c.email,
          first_name: c.first_name ?? undefined,
        })));
      }

      cursor = (data as unknown as { next_cursor?: string })?.next_cursor;
      attempts = 0;
    } catch (err) {
      console.error('Exception:', err);
      throw err;
    }
  } while (cursor);

  return contacts;
}

async function listAudiences() {
  const { data, error } = await resend.audiences.list();

  if (error) {
    console.error('Error listing audiences:', error);
    throw error;
  }

  return data?.data || [];
}

async function main() {
  console.log('Listing audiences...');
  const audiences = await listAudiences();
  
  console.log('Available audiences:');
  audiences.forEach(a => {
    const aud = a as unknown as { subscribers_count?: number };
    console.log(`  - ${a.id}: ${a.name} (${aud.subscribers_count ?? 'unknown'} subscribers)`);
  });

  if (audiences.length === 0) {
    console.log('No audiences found.');
    return;
  }

  let contacts: { email: string; first_name?: string }[] = [];
  
  for (const audience of audiences) {
    console.log(`\nFetching contacts from audience: ${audience.name} (${audience.id})...`);
    const audienceContacts = await getAudienceContacts(audience.id);
    console.log(`Found ${audienceContacts.length} contacts in ${audience.name}`);
    contacts = [...contacts, ...audienceContacts];
  }

  console.log(`\nTotal contacts found: ${contacts.length}`);

  if (contacts.length === 0) {
    console.log('No contacts found in any audience.');
    return;
  }

  const accountEmail = 'ernj@cin.ufpe.br';
  const testContact = contacts.find(c => c.email === accountEmail);
  
  if (testContact) {
    console.log(`\nSending test email to ${testContact.email}...`);
    const result = await sendEmail(testContact.email, testContact.first_name || 'Amigo');
    console.log('Test result:', result.success ? 'SUCCESS' : 'FAILED');
  } else {
    console.log(`\nAccount email ${accountEmail} not found in contacts, skipping test.`);
  }

  console.log(`\nSending welcome drip email to ${contacts.length} contacts...`);
  
  const results = [];
  for (const contact of contacts) {
    const result = await sendEmail(contact.email, contact.first_name || 'Amigo');
    results.push({ status: result.success ? 'fulfilled' : 'rejected', value: result });
  }

  const successful = results.filter(r => r.status === 'fulfilled' && (r as PromiseFulfilledResult<{ success: boolean }>).value.success).length;
  const failed = results.filter(r => !(r as PromiseFulfilledResult<{ success: boolean }>).value.success).length;

  console.log(`\nResults: ${successful} sent, ${failed} failed`);
  
  if (failed > 0) {
    console.log('\nFailed emails:');
    results.forEach((r, i) => {
      if (r.status === 'fulfilled' && !(r as PromiseFulfilledResult<{ success: boolean; email: string; error?: unknown }>).value.success) {
        const val = r as PromiseFulfilledResult<{ success: boolean; email: string; error?: unknown }>;
        console.log(`  - ${val.value.email}: ${val.value.error}`);
      }
    });
  }
}

main().catch(console.error);
