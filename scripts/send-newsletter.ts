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

interface Post {
  title: string;
  content: string;
  url: string;
  username: string;
  created_at: string;
}

interface User {
  email: string;
}

async function getPosts(): Promise<Post[]> {
  const { data, error } = await supabase
    .from('posts')
    .select('title, content, url, created_at, author_id')
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) throw error;

  const postsWithAuthors = await Promise.all(
    (data || []).map(async (post) => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', post.author_id)
        .single();
      
      return {
        title: post.title,
        content: post.content,
        url: post.url,
        username: profile?.username || 'Anónimo',
        created_at: post.created_at,
      };
    })
  );

  return postsWithAuthors;
}

async function getUsers(): Promise<User[]> {
  const { data: authData, error: authError } = await supabase
    .auth.admin.listUsers();
  
  if (authError) throw authError;
  
  return (authData.users || [])
    .map(u => ({ email: u.email }))
    .filter((u): u is { email: string } => Boolean(u.email));
}

function truncate(text: string | null, length: number): string {
  if (!text) return '';
  return text.length > length ? text.substring(0, length) + '...' : text;
}

function createEmailHtml(posts: Post[]): string {
  const postsHtml = posts.map((post, index) => `
    <tr>
      <td style="padding: 20px; border-bottom: 1px solid #e2e8f0;">
        <p style="margin: 0 0 8px 0; font-size: 14px; color: #64748b; font-weight: 600;">
          ${String(index + 1).padStart(2, '0')} • ${new Date(post.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
        </p>
        <h3 style="margin: 0 0 8px 0; font-size: 18px; font-weight: 700; color: #064e3b;">
          ${post.title}
        </h3>
        <p style="margin: 0 0 12px 0; font-size: 14px; color: #475569; line-height: 1.5;">
          ${truncate(post.content, 150)}
        </p>
        <p style="margin: 0 0 12px 0; font-size: 12px; color: #10b981; font-weight: 600;">
          Por @${post.username}
        </p>
        <a href="${post.url}" style="display: inline-block; padding: 10px 20px; background-color: #10b981; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600; border-radius: 8px;">
          Ler mais →
        </a>
      </td>
    </tr>
  `).join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);">
          <!-- Header -->
          <tr>
            <td style="padding: 32px; text-align: center; background: linear-gradient(135deg, #064e3b 0%, #10b981 100%); border-radius: 16px 16px 0 0;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #ffffff;">
                🌱 Sintropia
              </h1>
              <p style="margin: 8px 0 0 0; font-size: 14px; color: #d1fae5;">
                Mercado de Carbono
              </p>
            </td>
          </tr>
          
          <!-- Title -->
          <tr>
            <td style="padding: 32px 32px 16px 32px;">
              <h2 style="margin: 0; font-size: 24px; font-weight: 700; color: #0f172a;">
                Links e Notícias Mais Interessantes de Fevereiro de 2026
              </h2>
              <p style="margin: 12px 0 0 0; font-size: 14px; color: #64748b;">
                Aqui está o resumo dos 10 posts mais relevantes compartilhados na comunidade este mês.
              </p>
            </td>
          </tr>
          
          <!-- Posts -->
          ${postsHtml}
          
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; text-align: center; background-color: #f1f5f9; border-radius: 0 0 16px 16px;">
              <p style="margin: 0 0 8px 0; font-size: 12px; color: #64748b;">
                Você está a receber este email porque é membro da comunidade Sintropia.
              </p>
              <p style="margin: 0; font-size: 12px; color: #94a3b8;">
                <a href="https://sintropia.space" style="color: #10b981; text-decoration: none;">sintropia.space</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

async function sendNewsletter() {
  console.log('Fetching posts...');
  const posts = await getPosts();
  console.log(`Found ${posts.length} posts`);

  console.log('Fetching users...');
  const users = await getUsers();
  console.log(`Found ${users.length} users`);

  const emails = users.map(u => u.email).filter(Boolean);
  console.log(`Sending to ${emails.length} recipients:`, emails);

  const html = createEmailHtml(posts);

  const { data, error } = await resend.batch.send(
    emails.map(email => ({
      from: 'Sintropia <contato@sintropia.space>',
      to: [email],
      subject: 'Links e Notícias Mais Interessantes de Fevereiro de 2026',
      html,
    })),
    { idempotencyKey: `newsletter-feb-2026-${Date.now()}` }
  );

  if (error) {
    console.error('Error sending email:', error);
    throw error;
  }

  console.log('Email sent successfully!');
  console.log('Response:', data);
}

sendNewsletter().catch(console.error);
