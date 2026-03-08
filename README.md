# 🌱 Sintropia

Dashboard de inteligência colaborativa sobre o mercado de créditos de carbono e certificados de energia renovável no Brasil e no mundo.

[![Deploy on Vercel](https://vercel.com/button)](https://vercel.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub Stars](https://img.shields.io/github/stars/edrodrigues/sintropia-carbono)](https://github.com/edrodrigues/sintropia-carbono/stargazers)

## ✨ Funcionalidades

### 📊 Dados e Inteligência
- **Certificadoras** - 17 padrões de carbono e energia renovável globais e nacionais
- **Mercado de Carbono** - Rankings, volumes e tendências Brasil e Mundo
- **Energia Renovável** - I-RECs Brasil e Mundo com preços atualizados
- **Preços** - Dados de mercados de carbono (EU ETS, VCM) e energia

### 💬 Comunidade
- **Feed** - Compartilhe notícias, tire dúvidas, peça ajuda e discuta sobre o mercado
- **Post de Ajuda** - Novo tipo de postagem com destaque visual para pedidos de socorro
- **Perfis** - Explore membros e suas contribuições
- **Ranking (Leaderboard)** - Veja os membros mais ativos por Karma
- **Dashboard Pessoal** - Acompanhe sua atividade e reputação
- **Denúncias e Moderação** - Sistema de reports para manter comunidade segura

### 🏆 Sistema de Karma e Gamificação
- **Pontos de Karma** - Ganhe pontos ao contribuir com a comunidade
- **Badges**: Novato, Iniciante, Contribuidor, Especialista, Master
- **Achievements**: Buscador de Ajuda, Mentor, Early Adopter, e outros
- **Sistema de Streaks** - Mantenha sua sequência diária de atividades
- **Missões Semanais** - Complete objetivos para ganhar recompensas de karma
- **Sistema de Likes** - Likes e dislikes em posts e comentários

## 🚀 Tecnologias

- **Frontend:** Next.js 15, React 19, TypeScript
- **Styling:** Tailwind CSS 4
- **Database:** Supabase (PostgreSQL)
- **Charts & Tables:** Tremor (Recharts-based)
- **Email:** Resend
- **Testing:** Playwright
- **Deploy:** Vercel

## 📈 Desenvolvimento Recente

### Migração para Tremor
O projeto passou por uma migração completa para a biblioteca Tremor:
- **Gráficos**: 9 componentes de gráficos migrados de Chart.js para Tremor (BarChart, DonutChart, LineChart)
- **Tabelas**: 11 tabelas migradas de HTML nativo para Tremor Table
- **Componentes customizados**: Biblioteca Tremor estendida com LineChart

### Performance
- Lazy loading implementado na página carbono-projetos
- Code splitting automático com Next.js dynamic imports
- Skeleton loading para melhor experiência de usuário

### Comunidade e Interação
- **Posts de Ajuda**: Implementação de novo tipo de postagem para solicitação de suporte.
- **Destaque Visual**: Sistema de cores (âmbar/amarelo) para fácil identificação de pedidos de ajuda.
- **Gamificação Estendida**: Novo achievement "Buscador de Ajuda" para incentivar a interação.
- **Utilitários de Post**: Centralização de estilos e labels de categorias para consistência visual.

## 🛠️ Como Executar

```bash
# Clone o repositório
git clone https://github.com/edrodrigues/sintropia-carbono.git
cd sintropia-carbono

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas credenciais do Supabase

# Execute o servidor de desenvolvimento
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no seu navegador.

## 🔧 Variáveis de Ambiente

Crie um arquivo `.env.local` com as following variáveis:

```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role
RESEND_API_KEY=sua_chave_resend
```

## 🧪 Testes

```bash
# Execute os testes E2E
npm test

# Execute os testes com UI
npm run test:ui
```

## 🔐 Segurança

- **Headers de Segurança**: X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy
- **Sanitização de Input**: Proteção contra XSS em entradas de usuário
- **Verificação de Funções**: Ações de moderação verificam permissões no servidor
- **RLS (Row Level Security)**: Políticas de acesso a dados no Supabase

## 🌐 SEO Otimizado

- URL canônica: https://sintropia.space
- Meta tags otimizadas para busca
- Structured Data (JSON-LD) para Organization e WebSite
- Sitemap XML automático
- Robots.txt configurado

## 📱 Design

- Totalmente responsivo (mobile, tablet, desktop)
- Suporte a Dark Mode
- Acessibilidade em conformidade com WCAG

## 🤝 Como Contribuir

Contribuições são bem-vindas! Veja como você pode ajudar:

1. **🐛 Reportar bugs** - Abra uma issue descrevendo o problema
2. **💡 Sugerir funcionalidades** - Compartilhe suas ideias
3. **📊 Atualizar dados** - Mantenha as informações do mercado atualizadas
4. **🎨 Melhorar o design** - Contribua com a interface visual
5. **📝 Documentar** - Melhore a documentação do projeto
6. 🚀 **Divulgar** - Compartilhe com sua rede

### 📋 Pré-requisitos para Contribuir

- Node.js 18+
- NPM ou Yarn
- Conta no Supabase (para desenvolvimento local)

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🙏 Agradecimentos

- [Supabase](https://supabase.com) - Backend como serviço
- [Vercel](https://vercel.com) - Hospedagem
- [Next.js](https://nextjs.org) - Framework React
- [Resend](https://resend.com) - Email transacional
- Todos os contribuidores da comunidade!

---

<p align="center">
  Feito com 💚 pela comunidade
</p>
