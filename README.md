# Sintropia Carbono

Plataforma em Next.js para comunidade, conteúdo e inteligência de mercado em carbono e energia renovável.

O projeto combina navegação multilíngue, autenticação com Supabase, painéis de comunidade, páginas públicas de mercado e automações administrativas para dados, e-mail e operações.

## Visão geral

- App Router com rotas localizadas em `src/app/[locale]`
- Conteúdo público sobre carbono, energia e I-REC
- Área autenticada com feed, perfil, desafios, conquistas e ranking
- Integração com Supabase para auth, banco e storage de dados operacionais
- Scripts em TypeScript para carga, sync e envio de campanhas

## Stack

- Next.js 15.5.x
- React 18
- TypeScript
- Tailwind CSS 4
- Supabase (`@supabase/ssr` + `@supabase/supabase-js`)
- next-intl para i18n (`pt`, `en`, `es`)
- Recharts para gráficos
- Resend para e-mail
- Playwright para testes e2e
- Zod, DOMPurify, clsx e tailwind-merge para validação e utilitários

## Requisitos

- Node.js 20+
- npm 10+
- Projeto Supabase configurado
- Variáveis de ambiente definidas em `.env.local`

## Configuração local

1. Instale as dependências.
2. Configure `.env.local` com as chaves do Supabase e do Resend.
3. Execute `npm run dev`.

### Variáveis de ambiente

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
RESEND_API_KEY=re_...
PLAYWRIGHT_BASE_URL=http://localhost:3000
```

| Variável | Obrigatória | Uso |
|----------|:-----------:|-----|
| `NEXT_PUBLIC_SUPABASE_URL` | Sim | URL do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Sim | Chave pública do Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Sim | Scripts, rotas administrativas e operações internas |
| `RESEND_API_KEY` | Sim | E-mails transacionais e campanhas |
| `PLAYWRIGHT_BASE_URL` | Não | Base dos testes Playwright |

## Comandos

```bash
npm install
npm run dev
npm run build
npm run start
npm run lint
npm test
npm run test:ui
```

## Rotas principais

### Públicas

- Home e shell localizado em `src/app/[locale]/page.tsx`
- Carbono: ranking, preços, projetos, Brasil e mundo
- Energia: ranking, preços, Brasil e mundo
- I-REC: preços, Brasil e mundo
- Categorias, certificadoras, contribuir, termos e privacidade
- Perfil público por usuário em `/u/[username]`

### Autenticação

- Login, cadastro, recuperação de senha e onboarding
- Callback e confirmação OAuth em `src/app/auth`

### Área autenticada

- Dashboard
- Feed
- Perfis e edição de perfil
- Posts
- Desafios
- Conquistas
- Ranking
- Área de moderação e scripts administrativos

### Operação e API

- API de projetos de carbono
- Upload de dados CarbonPlan
- Execução de scripts administrativos
- Endpoints de debug e testes Supabase

## Estrutura do projeto

- `src/app` - rotas, layouts, APIs e páginas localizadas
- `src/components` - UI, gráficos, feed, perfil, moderação e shell
- `src/lib` - Supabase, utilitários, validação, auth e regras de negócio
- `src/data` - dados base usados pelo app
- `messages` - traduções `pt`, `en` e `es`
- `dados` - CSVs, JSON e documentação auxiliar de dados
- `public/dados` - cópias públicas dos conjuntos de dados
- `scripts` - automações de importação, sync, e-mail e SQL
- `supabase/migrations` - migrações do banco
- `e2e` - testes Playwright

## Dados e integrações

O projeto usa Supabase como fonte principal para autenticação e persistência. As migrações vivem em `supabase/migrations` e incluem schema, políticas e rotinas de ingestão.

Os dados locais e públicos ficam em `dados/` e `public/dados/`. Os scripts em `scripts/` fazem upload, sincronização, geração de SQL e envio de campanhas.

## Scripts administrativos

### E-mail e campanhas

- `send-drip-emails.ts`
- `verify-drip-status.ts`
- `summary-drip.ts`
- `send-newsletter.ts`
- `send-help-announcement.ts`
- `send-batch-profile-emails.ts`
- `test-profile-email.ts`
- `debug-resend.ts`
- `check-domains.ts`

### Carga e sincronização de dados

- `upload-carbon-stakeholders.ts`
- `upload-irec-stakeholders.ts`
- `upload-carbon-prices.ts`
- `upload-irec-prices.ts`
- `sync-carbon-stakeholders.ts`
- `sync-irec-stakeholders.ts`
- `sync-carbon-brazil-top50.ts`
- `sync-carbonmark-prices.ts`
- `sync-toucan-klima.ts`
- `sync-contacts-to-resend.ts`
- `fix-and-sync-irec-data.ts`

### SQL e utilitários

- `generate-sql.ts`
- `insert-projects.ts`
- `insert-credits.ts`
- `check-new-users.ts`
- `gen-carbonmark-sql.js`

## Testes

- Os testes end-to-end usam Playwright.
- No ambiente atual do Windows, a configuração de testes usa o Chrome do sistema via `channel: 'chrome'`.
- O navegador base é controlado por `PLAYWRIGHT_BASE_URL`, quando definido.

## Deploy

- Build com `npm run build`
- Deploy em Vercel com configuração em `vercel.json`
- Lint configurado em `eslint.config.mjs`

## Segurança e operação

- Rotas administrativas exigem sessão autenticada e, quando aplicável, perfil com permissão adequada
- Chaves de serviço ficam restritas ao servidor e aos scripts internos
- Validações server-side usam Zod
- Sanitização de HTML usa DOMPurify
- A aplicação possui internacionalização com `pt`, `en` e `es`

## Observações

- O README reflete a aplicação atual do repositório, com foco em comunidade, conteúdo e mercado de carbono/energia.
- Se você for alterar fluxos de dados, confira também as migrações em `supabase/migrations` e os scripts em `scripts/`.