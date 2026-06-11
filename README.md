# Sintropia

The professional network for environmental markets and sustainability.

Connecting professionals in carbon markets, renewable energy, ESG, and sustainability with market data, expert insights, and career opportunities.

## Stack

- Next.js 15
- React 18
- TypeScript
- Tailwind CSS 4
- Supabase
- Resend
- Playwright

## Requisitos

- Node.js 20+
- npm 10+
- Projeto Supabase configurado

## Variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```bash
# Supabase (obrigatório)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...  # Service role (admin) — usar apenas em scripts e admin

# Resend (obrigatório para envio de e-mails)
RESEND_API_KEY=re_...

# Playwright (opcional, para testes)
PLAYWRIGHT_BASE_URL=http://localhost:3000
```

| Variável | Obrigatória | Uso |
|----------|:-----------:|-----|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | URL do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Chave anônima do Supabase (pública) |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Chave de serviço (scripts/upload, admin API) |
| `RESEND_API_KEY` | ✅ | API key do Resend (e-mails transacionais) |
| `PLAYWRIGHT_BASE_URL` | ❌ | URL base para testes (default: `http://localhost:3000`) |

## Comandos

```bash
npm install       # Instalar dependências
npm run dev       # Servidor de desenvolvimento
npm run build     # Compilar para produção
npm run lint      # Executar ESLint
npm test          # Testes Playwright (headless)
npm run test:ui   # Testes Playwright (UI)
npm run start     # Servidor de produção
```

## Estrutura principal

- `src/app` — rotas App Router e APIs
- `src/components` — UI e componentes de domínio
- `src/lib` — integrações, auth, queries e utilitários
- `messages` — traduções `pt`, `en` e `es`
- `e2e` — testes Playwright (4 testes)
- `scripts` — automações administrativas (23 scripts)
- `dados` — arquivos CSV de dados (stakeholders, preços)
- `supabase/migrations` — migrações SQL do Supabase

## Scripts administrativos

### Drip campaign (e-mails automáticos)
| Script | Descrição |
|--------|-----------|
| `send-drip-emails.ts` | Dispara e-mails da campanha drip (welcome, carbon_credits, irec, community, action) |
| `verify-drip-status.ts` | Verifica status de entrega dos e-mails |
| `summary-drip.ts` | Gera sumário/estatísticas da campanha |
| `run-drip-campaign.bat` | Atalho Windows para executar `send-drip-emails.ts` |

### Upload de dados para Supabase
| Script | Descrição |
|--------|-----------|
| `upload-irec-stakeholders.ts` | Upload stakeholders I-REC (lê CSV de `dados/`) |
| `upload-carbon-stakeholders.ts` | Upload stakeholders carbono (lê CSV de `dados/`) |
| `upload-irec-prices.ts` | Upload preços I-REC (lê CSV) |
| `upload-carbon-prices.ts` | Upload preços carbono (lê CSV) |
| `insert-projects.ts` | Insere projetos a partir de CSV |
| `insert-credits.ts` | Insere créditos a partir de CSV |

### Sincronização
| Script | Descrição |
|--------|-----------|
| `sync-irec-stakeholders.ts` | Sincroniza stakeholders I-REC de CSV |
| `sync-carbon-stakeholders.ts` | Sincroniza stakeholders carbono de CSV |
| `sync-carbon-brazil-top50.ts` | Sincroniza top 50 stakeholders Brasil |
| `sync-contacts-to-resend.ts` | Sincroniza contatos para audiência no Resend |
| `fix-and-sync-irec-data.ts` | Corrige e sincroniza dados I-REC |

### E-mail
| Script | Descrição |
|--------|-----------|
| `send-newsletter.ts` | Envia newsletter via Resend |
| `send-help-announcement.ts` | Envia anúncio de ajuda |
| `send-batch-profile-emails.ts` | Envia e-mails de conclusão de perfil em lote |
| `test-profile-email.ts` | Envia e-mail de teste de perfil |
| `debug-resend.ts` | Debug: lista audiências e contatos do Resend |
| `check-domains.ts` | Lista domínios configurados no Resend |

### Outros
| Script | Descrição |
|--------|-----------|
| `check-new-users.ts` | Consulta novos usuários no Supabase |
| `generate-sql.ts` | Gera SQL a partir de CSVs |

### Execução
```bash
npx tsx scripts/<nome-do-script>.ts
```
Requer variáveis `NEXT_PUBLIC_SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` configuradas (scripts que enviam e-mail também requerem `RESEND_API_KEY`).

## Migrações

As migrações SQL ficam em `supabase/migrations/` e devem ser aplicadas manualmente no SQL Editor do Supabase (ou via `supabase db push` com CLI).

## Segurança e operação

- Rotas administrativas exigem sessão autenticada e perfil `admin`
- Endpoints de debug restritos a ambiente de desenvolvimento
- Script runner valida argumentos com regex de segurança
- Rate limiting de 5 tentativas/minuto nas rotas de auth
- Zod validation em todas as server actions
- XSS sanitizer com DOMPurify (whitelist de tags/atributos)
- Logs estruturados via `src/lib/utils/logger.ts`

## Observações

- O projeto usa internacionalização baseada em locale (`pt`, `en`, `es`)
- Build, lint e testes devem passar antes de deploy
- Scripts administrativos devem ser executados apenas pela interface protegida
- Prisma foi removido; toda comunicação com banco é via Supabase client
