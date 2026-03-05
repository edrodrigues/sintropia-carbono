# 🚀 Sintropia: Roadmap de Melhorias Técnicas e Funcionais

Este documento descreve um plano passo a passo para implementar as melhorias sugeridas para o projeto **Sintropia**, focando em escalabilidade, segurança de tipos, automação e experiência do usuário.

---

## 🛠️ Fase 1: Fundação e Segurança de Tipos (Arquitetura)
*Objetivo: Unificar o acesso a dados e eliminar erros de TypeScript.*

1.  **Sincronização de Tipos do Supabase:**
    *   Gerar tipos TypeScript automaticamente a partir do banco de dados: `npx supabase gen types typescript --project-id <id> > src/types/supabase.ts`.
    *   Substituir tipos manuais e o uso de `any` em componentes e hooks pelos tipos gerados.
2.  **Unificação Prisma + Supabase:**
    *   Configurar o Prisma para usar os mesmos tipos gerados ou estender as interfaces.
    *   Mover consultas complexas para o Prisma no lado do servidor (Server Actions/API Routes) para melhor DX.
3.  **Validação de Esquema com Zod:**
    *   Implementar `zod` para validar inputs de formulários e payloads de API.
    *   Compartilhar os esquemas de validação entre o frontend (formulários) e o backend (API/Database).

---

## 🤖 Fase 2: Automação e Pipeline de Dados
*Objetivo: Transformar scripts manuais em processos automatizados e robustos.*

1.  **Migração de Dados Estáticos (CSV para DB):**
    *   Criar uma migração para mover os dados de `dados/*.csv` para tabelas no Supabase.
    *   Atualizar os gráficos para consumirem APIs dinâmicas em vez de lerem arquivos locais.
2.  **Painel Administrativo para Scripts:**
    *   Criar uma rota protegida (role: 'admin') para disparar manualmente os scripts de `/scripts` (ex: `send-newsletter.ts`) via UI.
3.  **Automação via Edge Functions/Cron:**
    *   Configurar **Supabase Edge Functions** para rodar os scripts de limpeza e sincronização de contatos automaticamente.
    *   Utilizar `pg_cron` no Supabase para tarefas agendadas (ex: reset de missões semanais).

---

## 🧪 Fase 3: Controle de Qualidade e CI/CD
*Objetivo: Garantir que o projeto permaneça estável e acessível com o tempo.*

1.  **Integração de Testes Unitários:**
    *   Instalar e configurar **Vitest**.
    *   Criar testes para a lógica de negócio crítica: cálculo de Karma (`lib/achievements.ts`) e lógica de Streaks (`lib/streaks.ts`).
2.  **Automação de Auditorias (GitHub Actions):**
    *   Configurar um workflow para rodar `playwright test` em cada Pull Request.
    *   Integrar o script `wcag_audit.py` e o Lighthouse CI no pipeline para monitorar acessibilidade e performance.
3.  **Resolução de Erros de Linting:**
    *   Limpar o arquivo `ts_errors.txt` e configurar o ESLint para bloquear commits com erros graves.

---

## 🎮 Fase 4: Experiência do Usuário e Gamificação Avançada
*Objetivo: Tornar a plataforma mais dinâmica e engajadora.*

1.  **Lógica de Gamificação no Banco de Dados:**
    *   Mover a lógica de atualização de Streaks e Karma para **PostgreSQL Triggers** ou **Stored Procedures**.
    *   Isso garante que o usuário receba seus pontos instantaneamente e com integridade total de dados.
2.  **Funcionalidades Real-time:**
    *   Habilitar **Supabase Realtime** no Feed da Comunidade.
    *   Implementar notificações "toast" instantâneas quando o usuário ganhar um Badge ou Karma.
3.  **Busca Avançada (Full-Text Search):**
    *   Configurar índices `tsvector` nas tabelas de posts e comentários.
    *   Implementar uma busca global que filtre por tópicos, autores e conteúdo simultaneamente.

---

## 📈 Critérios de Sucesso
- [ ] 0 erros de TypeScript no build final.
- [ ] 100% dos dados de mercado consumidos via API (não via arquivos CSV).
- [ ] Pipeline de CI/CD rodando testes e auditorias automaticamente.
- [ ] Interface respondendo em tempo real a novas interações na comunidade.

---

*Nota: Este plano deve ser executado de forma iterativa, começando pela Fase 1 para garantir a estabilidade do código antes de adicionar novas funcionalidades.*
