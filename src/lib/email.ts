import { Resend } from 'resend';

function getResend() {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is not set');
  }
  return new Resend(process.env.RESEND_API_KEY);
}

const FROM_EMAIL = 'Sintropia <noreply@contato.sintropia.space>';
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

export async function sendEmail(to: string, subject: string, html: string) {
  try {
    const resend = getResend();
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  ${styles}
</head>
<body>
  <div class="container">
    ${html}
  </div>
</body>
</html>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Failed to send email:', error);
    return { success: false, error };
  }
}

// ============================================
// DRIP CAMPAIGN - 5 E-MAILS EDUCACIONAIS
// ============================================

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
    <p>Projeto Open Source e Feito com ❤️ em Recife/Pernambuco.</p>
    <p><a href="${APP_URL}">Acesse a Sintropia</a></p>
  </div>
</div>
  `.trim();
}

// Dia 0: E-mail de Boas-vindas
export async function sendDripEmail1_Welcome(email: string, name: string) {
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
  return sendEmail(email, title, html);
}

// Dia 2: Entendendo os Créditos de Carbono
export async function sendDripEmail2_CarbonCredits(email: string, name: string) {
  const title = 'O que são créditos de carbono?';
  const content = `
    <p>Olá ${name},</p>
    <p>Você sabe como funcionam os créditos de carbono? Esse é o conceito fundamental do mercado que estamos construindo juntos.</p>
    <h3>O que é um crédito de carbono?</h3>
    <p>Um crédito de carbono representa a remoção ou redução de 1 tonelada de CO₂ da atmosfera. Empresas ou indivíduos podem comprar esses créditos para compensar suas próprias emissões.</p>
    <h3>Mercado Voluntário vs. Regulatório</h3>
    <ul>
      <li><strong>Mercado Voluntário:</strong> Empresas que escolhem compensar suas emissões por iniciativa própria</li>
      <li><strong>Mercado Regulatório:</strong> Obrigações legais impostas por governos</li>
    </ul>
    <h3>Tipos de projetos:</h3>
    <ul>
      <li>Reflorestamento e avoided deforestation</li>
      <li>Energia renovável</li>
      <li>Captura e armazenamento de carbono</li>
      <li>Projetos de eficiência energética</li>
    </ul>
  `;
  const html = buildEmail(title, content, `${APP_URL}/carbono-mundo`, 'Ver preços de carbono');
  return sendEmail(email, title, html);
}

// Dia 4: Certificados de Energia Renovável
export async function sendDripEmail3_IREC(email: string, name: string) {
  const title = 'Você conhece as diferenças dos certificados de energias renováveis?';
  const content = `
    <p>Olá ${name},</p>
    <p>IREC (International Renewable Energy Certificate) é um certificado que representa os benefícios ambientais de 1 MWh de energia renovável gerada e injetada na rede elétrica.</p>
    <h3>Por que o IREC é importante?</h3>
    <ul>
      <li>Comprova a origem renovável da energia</li>
      <li>Permite que empresas demonstrem compromisso com sustentabilidade</li>
      <li>É negociado em mercados internacionais</li>
      <li>Preços variam conforme demanda e localização</li>
    </ul>
    <h3>No Brasil</h3>
    <p>O mercado de IREC no Brasil está em crescimento, especialmente após a resolução da ANEEL que permite a geração distribuída e os certificados de energia renovável.</p>
  `;
  const html = buildEmail(title, content, `${APP_URL}/irec-brasil`, 'Ver preços IREC no Brasil');
  return sendEmail(email, title, html);
}

// Dia 6: Aba Comunidade e Karma
export async function sendDripEmail4_Community(email: string, name: string) {
  const title = 'Conheça a aba Comunidade na Sintropia 🚀';
  const content = `
    <p>Olá ${name},</p>
    <p>A Comunidade é o diferencial! Não é só sobre preços e dados — é sobre pessoas que acreditam em um futuro mais sustentável.</p>
    <h3>O que você encontra na aba Comunidade:</h3>
    <ul>
      <li><strong>Feed de Postagens:</strong> Compartilhe notícias, análises e insights sobre o mercado</li>
      <li><strong>Discussões:</strong> Conecte-se com profissionais e empresas do setor</li>
      <li><strong>Networking:</strong> Encontre parceiros comerciais e oportunidades</li>
      <li><strong>Karma:</strong> Ganhe reconhecimento pela sua contribuição</li>
    </ul>
    <h3>Como funciona o Karma?</h3>
    <ul>
      <li><span class="highlight">📝</span> <strong>Criar posts</strong> = +10 Karma</li>
      <li><span class="highlight">💬</span> <strong>Comentar</strong> = +2 Karma</li>
      <li><span class="highlight">👍</span> <strong>Receber upvotes</strong> = +1 Karma</li>
    </ul>
    <p>Que tal fazer sua primeira postagem e começar a construir sua reputação?</p>
  `;
  const html = buildEmail(title, content, `${APP_URL}/feed`, 'Fazer uma postagem');
  return sendEmail(email, title, html);
}

// Dia 9: CTA Final - Ação
export async function sendDripEmail5_Action(email: string, name: string) {
  const title = 'Último Passo: Explore as funcionalidades na plataforma! 💪';
  const content = `
    <p>Olá ${name},</p>
    <p>Você já conhece as principais funcionalidades da Sintropia. Agora é hora de explorar e tirar proveito de tudo o que preparamos para você.</p>
    <h3>O que você pode fazer agora:</h3>
    <ul>
      <li>📊 <strong>Acompanhar preços:</strong> Visite /carbono-precos e /irec-precos</li>
      <li>📰 <strong>Ler notícias:</strong> Veja as últimas atualizações em /posts</li>
      <li>🏆 <strong>Ver o ranking:</strong> Descubra os membros mais influentes em /leaderboard</li>
      <li>📝 <strong>Completar seu perfil:</strong> Adicione suas informações em /profile/edit</li>
    </ul>
    <p>Sua participação faz diferença. Cada pergunta, resposta ou insight compartilhado ajuda a construir uma comunidade mais forte.</p>
  `;
  const html = buildEmail(title, content, `${APP_URL}/dashboard`, 'Acessar meu dashboard');
  return sendEmail(email, title, html);
}

// ============================================
// E-MAILS TRANSACIONAIS SIMPLES
// ============================================

export async function sendWelcomeEmail(email: string, name: string) {
  return sendDripEmail1_Welcome(email, name);
}

export async function sendNotificationEmail(
  email: string,
  subject: string,
  content: string
) {
  const html = buildEmail(subject, `<p>${content}</p>`, APP_URL, 'Acessar');
  return sendEmail(email, subject, html);
}
