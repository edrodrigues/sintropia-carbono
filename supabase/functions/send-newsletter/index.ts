// Follow this setup guide to integrate the Deno runtime into your application:
// https://supabase.com/docs/guides/functions/connect-to-postgres

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

serve(async (req) => {
  try {
    const supabase = createClient(
      SUPABASE_URL!,
      SUPABASE_SERVICE_ROLE_KEY!
    )

    // 1. Get last 10 posts
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('title, content, url, author_id, created_at')
      .order('created_at', { ascending: false })
      .limit(10)

    if (postsError) throw postsError

    // 2. Get users for sending
    const { data: usersData, error: usersError } = await supabase
      .rpc('get_users_for_drip') // Reusing the same function as sync

    if (usersError) throw usersError

    // 3. Simple email HTML logic (abbreviated for the function)
    const emailHtml = `
      <h1>Últimas do Mercado de Carbono 🌱</h1>
      <ul>
        ${posts.map(p => `<li><strong>${p.title}</strong>: ${p.content.substring(0, 100)}... <a href="${p.url}">Ler mais</a></li>`).join('')}
      </ul>
    `

    // 4. Send with Resend
    const resendResponse = await fetch('https://api.resend.com/emails/batch', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(
        usersData.map(u => ({
          from: 'Sintropia <contato@contato.sintropia.space>',
          to: [u.email],
          subject: 'Resumo da Semana: Sintropia',
          html: emailHtml,
        }))
      ),
    })

    const data = await resendResponse.json()

    return new Response(
      JSON.stringify({ message: 'Newsletter sent', data }),
      { headers: { "Content-Type": "application/json" } },
    )
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
})
