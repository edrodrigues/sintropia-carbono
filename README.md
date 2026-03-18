# Sintropia

Dashboard colaborativo sobre mercado de carbono, energia renovavel e comunidade profissional.

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

## Variaveis de ambiente

Crie um arquivo `.env.local` com:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
DATABASE_URL=
```

## Comandos

```bash
npm install
npm run dev
npm run lint
npm run build
npm test
```

## Estrutura principal

- `src/app`: rotas App Router e APIs
- `src/components`: UI e componentes de dominio
- `src/lib`: integracoes, auth, queries e utilitarios
- `messages`: traducoes `pt`, `en` e `es`
- `e2e`: testes Playwright
- `scripts`: automacoes administrativas

## Seguranca e operacao

- Rotas administrativas exigem sessao autenticada e perfil `admin`
- Endpoints de debug ficam restritos a ambiente de desenvolvimento
- Nao existe mais endpoint publico para disparar email real de teste

## Observacoes

- O projeto usa internacionalizacao baseada em locale
- Build, lint e testes devem passar antes de deploy
- Scripts administrativos devem ser executados apenas pela interface protegida
