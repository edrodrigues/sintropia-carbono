import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = 'Mercado Carbono <noreply@seudominio.com>';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://sintropia-carbono.vercel.app';

export async function sendWelcomeEmail(email: string, name: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Bem-vindo ao Mercado Carbono!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #10b981;">Bem-vindo ao Mercado Carbono!</h1>
          <p>Olá ${name},</p>
          <p>Obrigado por se juntar à comunidade Mercado Carbono. Estamos animados em tê-lo conosco!</p>
          <p>Com sua conta, você pode:</p>
          <ul>
            <li>Acompanhar preços de carbono e créditos IREC</li>
            <li>Conectar-se com outros profissionais do mercado</li>
            <li>Compartilhar conteúdo e participar de discussões</li>
            <li>Explorar oportunidades de negócio</li>
          </ul>
          <p>
            <a href="${APP_URL}" style="display: inline-block; background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 16px;">
              Começar agora
            </a>
          </p>
          <p style="margin-top: 32px; color: #6b7280; font-size: 14px;">
            Se você tiver alguma dúvida, basta responder este e-mail.
          </p>
          <p style="color: #6b7280; font-size: 14px;">
            Atenciosamente,<br>
            Equipe Mercado Carbono
          </p>
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
    console.error('Failed to send welcome email:', error);
    return { success: false, error };
  }
}

export async function sendNotificationEmail(
  email: string,
  subject: string,
  content: string
) {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #10b981;">${subject}</h2>
          <div style="line-height: 1.6;">${content}</div>
          <p style="margin-top: 32px; color: #6b7280; font-size: 14px;">
            <a href="${APP_URL}">Acesse o Mercado Carbono</a>
          </p>
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
    console.error('Failed to send notification email:', error);
    return { success: false, error };
  }
}
