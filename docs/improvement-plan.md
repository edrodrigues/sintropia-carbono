# Plano de Melhorias — Sintropia Carbono

> Data: 2026-06-08
> Baseado na revisão completa do código-fonte (src/, scripts/, prisma/, supabase/, e2e/)

---

## Priorização

| Prioridade | Categoria | Esforço | Impacto |
|:----------:|----------|:-------:|:-------:|
| 🔴 Crítica | Segurança | Alto | Crítico |
| 🟡 Alta | Arquitetura | Médio | Alto |
| 🟢 Média | Qualidade | Baixo | Médio |
| 🔵 Baixa | Manutenção | Baixo | Baixo |

---

## 🔴 1. Segurança — Correções Críticas

### 1.1 Sanitizar argumentos no admin script runner ✅

**Arquivo:** `src/app/api/admin/scripts/run/route.ts`
**Problema:** O array `args` vindo do corpo da requisição é passado diretamente para `spawn("npx", ["tsx", scriptPath, ...args])` sem qualquer validação ou sanitização, permitindo injeção de argumentos arbitrários.
**Solução:** Validar cada argumento contra uma regex de segurança (apenas alfanuméricos, hífens, underlines, pontos e barras). Rejeitar requisições com argumentos inválidos.
**Status:** ✅ Implementado — função `sanitizeArgs()` com regex `SAFE_ARG_REGEX` filtra args inválidos.

**Prioridade:** 🔴 Crítica | **Esforço:** 30 min

---

### 1.2 Remover casts `as any` dos queries

**Arquivos:**
- `src/lib/queries/carbon.ts` — ~15 ocorrências
- `src/lib/queries/irec.ts` — ~15 ocorrências
- `src/lib/queries/carbon-prices.ts`
- `src/lib/queries/notifications.ts`
- `src/lib/streaks.ts`

**Problema:** O uso generalizado de `as any` e `as unknown as` suprime erros de tipo do TypeScript, ocultando potenciais bugs em runtime.
**Solução:** Adicionar as 5 tabelas faltantes (`irec_stakeholders`, `carbon_stakeholders`, `irec_prices`, `carbon_prices`, `data_sources`) ao esquema do Prisma ou ao tipo `Database` do Supabase. Alternativamente, criar interfaces locais tipadas e usar ` satisfies ` ou funções de validação em runtime (Zod).

**Prioridade:** 🔴 Crítica | **Esforço:** 4-6h

---

### 1.3 Restringir rota de debug em produção ✅

**Arquivo:** `src/app/api/debug/route.ts`
**Problema:** A rota expõe email do usuário, headers da requisição e timings de autenticação. Embora use `{ developmentOnly: true }`, os headers podem conter tokens de sessão.
**Solução:** Remover `headers` e `auth.user.email` da resposta. Manter apenas dados não sensíveis (timestamps, ambiente, role).
**Status:** ✅ Implementado — resposta agora inclui apenas `role` e `userId`, sem headers ou email.

**Prioridade:** 🔴 Crítica | **Esforço:** 15 min

---

### 1.4 Adicionar rate limiting nas rotas de auth ✅

**Arquivos:**
- `src/app/[locale]/(auth)/login/actions.ts` — integrar `checkRateLimit()`
- `src/lib/rate-limiter.ts` — novo utilitário

**Problema:** Não havia proteção contra brute force nos endpoints de login, registro e reset de senha.
**Solução:** Implementado `checkRateLimit()` em memória (Map com TTL de 1 minuto). Aplicado em `login`, `signup`, `resetPassword` e `updatePassword`. Limite de 5 tentativas/minuto/IP por endpoint.
**Status:** ✅ Implementado em 4/4 server actions. Note: `RegisterForm.tsx` client-side não é coberto — idealmente migrar para server action no futuro.

**Prioridade:** 🔴 Crítica | **Esforço:** 2-3h

---

### 1.5 Revisar sanitizer XSS ✅

**Arquivo:** `src/lib/utils/sanitize.ts`
**Problema:** O sanitizador usa regex que pode ser contornado (ex.: `javascrip\nt:` não é capturado). A função `decodeHtml` usa `document.createElement('textarea')` (client-side apenas).
**Solução:** Substituir por `isomorphic-dompurify`, uma biblioteca madura e testada, com whitelist de tags e atributos seguros.
**Status:** ✅ Implementado — `sanitizeInput()` agora usa DOMPurify com configuração restritiva.

**Prioridade:** 🔴 Crítica | **Esforço:** 1-2h

---

## 🟡 2. Arquitetura — Melhorias Estruturais

### 2.1 Consolidar rotas legadas ✅

**Arquivos:**
- `src/app/[locale]/(public)/carbono-brasil/page.tsx`
- `src/app/[locale]/(public)/carbono-mundo/page.tsx`
- `src/app/[locale]/(public)/carbono-precos/page.tsx`
- `src/app/[locale]/(public)/carbono-projetos/page.tsx`
- `src/app/[locale]/(public)/irec-brasil/page.tsx`
- `src/app/[locale]/(public)/irec-mundo/page.tsx`
- `src/app/[locale]/(public)/irec-precos/page.tsx`

**Problema:** Rotas planas legadas coexistem com as novas rotas aninhadas (`/carbono/ranking-brasil`, etc.), duplicando conteúdo e confundindo SEO.
**Solução:** Todas as 7 rotas já redirecionavam para as novas. Padronizadas para usar o mesmo padrão limpo (redirect puro sem fallback JSX morto).
**Status:** ✅ Implementado — rotas carbono-* simplificadas para redirect puro; rotas irec-* já estavam no padrão.

**Prioridade:** 🟡 Alta | **Esforço:** 2-3h

---

### 2.2 Unificar acesso a dados (Prisma vs Supabase) ✅

**Arquivos:** Múltiplos
**Problema:** O projeto usa Prisma para schema/types mas faz as queries reais via Supabase JS client. Cinco tabelas importantes (`irec_stakeholders`, `carbon_stakeholders`, `irec_prices`, `carbon_prices`, `data_sources`, `notifications`) existiam apenas no Supabase, forçando casts `as any`.
**Solução (Opção B):** Adicionadas todas as tabelas e views faltantes ao tipo `Database` em `src/types/supabase.ts`. Adicionadas também as RPCs (`update_user_streak`, `check_and_award_achievements`, etc.) à seção `Functions`. Removidos todos os casts `as any` dos arquivos de query (`carbon.ts`, `irec.ts`, `carbon-prices.ts`, `notifications.ts`, `streaks.ts`).
**Status:** ✅ Implementado — 0 casts `as any` restantes nos arquivos de query. TypeScript compila sem erros.

**Prioridade:** 🟡 Alta | **Esforço:** 4-8h

---

### 2.3 Mover tracking do drip campaign para o banco ✅

**Arquivo:** `scripts/send-drip-emails.ts` (usa `data/drip-tracking.json`)
**Problema:** O estado da campanha de email é armazenado em um arquivo JSON local, que não persiste entre instâncias do servidor (especialmente na Vercel com serverless).
**Solução:** Criada tabela `drip_tracking` no Supabase (`supabase/migrations/20260608000000_drip_tracking.sql`) com colunas: `user_id`, `email_type`, `email_sent_at`, `status`. Adicionada ao tipo `Database`. Scripts `send-drip-emails.ts`, `verify-drip-status.ts` e `summary-drip.ts` migrados para usar o banco.
**Status:** ✅ Implementado — tracking agora no banco de dados. Arquivo JSON não é mais necessário.

**Prioridade:** 🟡 Alta | **Esforço:** 3-4h

---

### 2.4 Extrair dados hardcoded dos scripts de upload ✅

**Arquivos:**
- `scripts/upload-carbon-stakeholders.ts`
- `scripts/upload-irec-stakeholders.ts`

**Problema:** Dados estáticos de stakeholders (20+ entries) estavam hardcoded nos scripts, dificultando manutenção e atualização.
**Solução:** Extraídos para 3 CSVs em `dados/`: `carbon-stakeholders-brazil.csv`, `carbon-stakeholders-world.csv`, `irec-stakeholders-world.csv`. Scripts agora leem dos CSVs.
**Status:** ✅ Implementado — 0 dados hardcoded restantes.

**Prioridade:** 🟡 Alta | **Esforço:** 1-2h

---

## 🟢 3. Qualidade de Código

### 3.1 Padronizar indentação ✅

**Problema:** Arquivos alternam entre 2 e 4 espaços de indentação.
- 2 espaços: `src/lib/supabase/*.ts`, `src/lib/queries/*.ts`, `src/app/sitemap.ts`
- 4 espaços: `src/middleware.ts`, `src/app/api/debug/route.ts`, `src/lib/email.ts`
**Solução:** Configurar o ESLint com regra `indent` para 2 espaços e rodar `--fix` em todo o projeto.
**Status:** ✅ Implementado — regra `indent: warn, 2` adicionada ao ESLint e `--fix` aplicado.

**Prioridade:** 🟢 Média | **Esforço:** 30 min

---

### 3.2 Expandir cobertura de testes

**Arquivo:** `e2e/` (apenas 4 testes)
**Problema:** Apenas 2 spec files testam a landing page e segurança básica. Não há testes para:
- Fluxo de autenticação (login, registro, reset de senha)
- CRUD de posts e comentários
- Renderização de dados de mercado (carbono, energia)
- Gamificação (streaks, achievements)
- API routes (upload, admin scripts)
- Internacionalização
**Solução:** Adicionar testes Playwright para os fluxos críticos, começando pelos de maior risco:
1. Auth flow (login com credenciais válidas/inválidas, Google OAuth)
2. Dashboard (renderização com usuário autenticado)
3. Páginas de dados (carbono, energia)
4. Moderação (banir, promover, deletar post)

**Prioridade:** 🟢 Média | **Esforço:** 8-12h

---

### 3.3 Remover variáveis não utilizadas e dependências ✅

**Arquivo:** `package.json`
**Problema:** Dependências órfãs acumuladas ao longo do tempo.
**Solução:** Rodado `depcheck`. Removidos 27 pacotes: `@internationalized/date`, `@orth/cli`, `@prisma/client`, `@radix-ui/*` (16 pacotes), `@vercel/analytics`, `date-fns`, `tailwind-variants`, `react-day-picker`, `@react-aria/datepicker`, `@react-stately/datepicker`, `@eslint/eslintrc`, `prisma`. Diretório `prisma/` removido. `next.config.ts` limpo de referências radix. Falsos positivos mantidos (`@tailwindcss/forms`, `@tailwindcss/postcss`, `lint-staged`).
**Status:** ✅ Implementado — 27 dependências removidas.

**Prioridade:** 🟢 Média | **Esforço:** 30 min

---

### 3.4 Adicionar validação Zod nos server actions ✅

**Arquivos:**
- `src/lib/mod-actions.ts`
- `src/app/[locale]/(auth)/login/actions.ts`
- `src/app/[locale]/(dashboard)/profile/actions.ts`
- `src/lib/validation.ts` (novo)

**Problema:** As server actions fazem cast direto de `formData.get()` sem validação de tipo ou tamanho.
**Solução:** Criado `src/lib/validation.ts` com schemas Zod. Validados 9 endpoints: login, signup, resetPassword, updatePassword, updateProfile, banUser, promoteToModerator, warnUser, deletePost.
**Status:** ✅ Implementado — Zod validation em todos os server actions.

**Prioridade:** 🟢 Média | **Esforço:** 2-3h

---

## 🔵 4. Manutenção e Pequenas Correções

### 4.1 Corrigir caminho no script batch ✅

**Arquivo:** `scripts/run-drip-campaign.bat`
**Problema:** Referencia caminho antigo (`C:\Users\...`).
**Solução:** Atualizar para usar caminho relativo ao diretório do projeto.
**Status:** ✅ Implementado — usa `%~dp0..` para referenciar a raiz do projeto.

**Prioridade:** 🔵 Baixa | **Esforço:** 5 min

---

### 4.2 Atualizar sitemap ✅

**Arquivo:** `src/app/sitemap.ts`
**Problema:** O sitemap inclui todas as 7 rotas legadas com prioridade baixa, mas não inclui algumas rotas novas.
**Solução:** Revisar e atualizar a lista de URLs para refletir o estado atual das rotas.
**Status:** ✅ Implementado — adicionadas URLs `/es/` faltantes para categorias, contribuir, privacidade e termos.

**Prioridade:** 🔵 Baixa | **Esforço:** 30 min

---

### 4.3 Adicionar logs estruturados ✅

**Problema:** 43 chamadas `console.*` espalhadas por 16 arquivos sem formato consistente.
**Solução:** Criado `src/lib/utils/logger.ts` com logger estruturado (info/warn/error, timestamp, contexto). `monitoring.ts` refatorado para usar o logger. Todos os 43 `console.*` substituídos por `logger.*` em 16 arquivos. Apenas o `logger.ts` implementa os `console.*` nativos.
**Status:** ✅ Implementado — logging centralizado e estruturado em toda a codebase.

**Prioridade:** 🔵 Baixa | **Esforço:** 1-2h

---

### 4.4 Documentar scripts e variáveis de ambiente ✅

**Problema:** Documentação dos scripts e variáveis de ambiente estava incompleta.
**Solução:** README atualizado com: tabela completa de variáveis de ambiente (com obrigatoriedade e uso), documentação de todos os 23 scripts agrupados por categoria, comandos de execução, seção de migrações e observações de segurança.
**Status:** ✅ Implementado — README completo e atualizado.

**Prioridade:** 🔵 Baixa | **Esforço:** 1h

---

## Resumo do Esforço Total

| Prioridade | Itens | Esforço Total Estimado |
|:----------:|:-----:|:----------------------:|
| 🔴 Crítica | 5 | ~8-12h | ✅ 4/5 |
| 🟡 Alta | 4 | ~10-17h | ✅ 4/4 |
| 🟢 Média | 4 | ~9-14h | 🔄 2/3 (3.2 pendente) |
| 🔵 Baixa | 4 | ~2-4h | ✅ 4/4 |
| **Total** | **17** | **~29-47h** | 🟢 **16/17 concluídos** |

---

## Ordem Recomendada de Execução

| Fase | Itens | Duração |
|:----:|-------|:-------:|
| **Fase 1** — Segurança imediata | 1.1, 1.3, 1.5 | ~2h | ✅ Completa |
| **Fase 2** — Qualidade rápida | 3.1, 4.1, 4.2 | ~1h | ✅ Completa |
| **Fase 3** — Arquitetura | 2.1, 2.2 | ~8-12h | ✅ Completa |
| **Fase 4** — Dados e tracking | 2.3, 2.4 | ~4-6h | ✅ Completa |
| **Fase 5** — Segurança adicional | 1.4 | ~2-3h | ✅ Completa |
| **Fase 6** — Testes e validação | 3.2, 3.3, 3.4 | ~8-14h | 🔄 2/3 completa (3.3, 3.4 ✅; 3.2 ⏳) |
| **Fase 7** — Manutenção | 4.3, 4.4 | ~2-3h | ✅ Completa |
