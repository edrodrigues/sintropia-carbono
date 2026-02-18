# Plano de Redesenho - Perfil do Usuário e Feed de Posts

## Visão Geral

Adaptar as interfaces de perfil e posts para seguir as referências descritas, mantendo o design system existente do Sintropia.Space.

---

## 1. Página de Perfil

**Arquivo:** `src/app/(dashboard)/profile/page.tsx` e `src/app/(public)/u/[username]/page.tsx`

### 1.1 Header Section

| Elemento | Implementação |
|----------|---------------|
| Foto de perfil | Circular, ~120px, alinhada à esquerda, sobreposta ao header com borda |
| Nome do usuário | Texto grande, bold, ao lado da foto |
| Badge de nível/tier | Emoji ou ícone + label (ex: "🌟 Contribuidor") |
| Karma com progress bar | Barra de progresso mostrando % para próximo nível |
| Badges de conquista | Ícones horizontalmente (5-6 badges visíveis) |
| Botão "Editar Perfil" | Top-right, estilo secundário |

### 1.2 Stats Dashboard (4 colunas)

| Stat | Ícone | Descrição |
|------|-------|-----------|
| Total Posts | Document icon | Contagem de posts publicados |
| Total Comments | Chat bubble | Contagem de comentários |
| Positive Votes/Upvotes | Arrow/Thumbs | Total de upvotes recebidos |
| Global Ranking | Trophy | Posição no ranking (ex: "#14") |

### 1.3 Content Tabs

- **My Posts** (padrão)
- **Comments**
- **Activity**

Usar componente de tabs existente.

### 1.4 Posts Grid (na tab My Posts)

- Layout: 3 colunas no desktop
- Cada card:
  - Avatar circular do autor (top-left)
  - Nome do autor
  - Título do post (bold, maior)
  - Excerpt (2-3 linhas, truncado)
  - Data de publicação
  - Métricas: likes, comments, views
  - Link "Ler Mais"

---

## 2. Página de Feed de Posts

**Arquivo:** `src/app/(dashboard)/feed/page.tsx` e componentes relacionados

### 2.1 Feed Header

- Título contextual: "Feed de Hoje" ou similar
- Tabs de ordenação (direita): "Top", "New", "Best"
- Usar estilo de tabs de navegação existente

### 2.2 Post Cards (lista vertical)

| Elemento | Implementação |
|----------|---------------|
| Upvote counter | Lado esquerdo, número grande em caixa colorida (verde para positivo) |
| Título do post | Grande, bold, texto preto/dark |
| Source/Domain tag | Cinza, pequeno, abaixo do título |
| Autor | Avatar circular pequeno, username, badge de tier, timestamp |
| Comentários | Ícone + número |
| Topic tags | Pills/badges à direita (ex: "EU ETS", "Industrial", "VCM") |
| Background | Cores alternadas sutis (tint claro) |

---

## 3. Elementos de Gamificação a Adicionar

- [ ] Sistema de Karma/pontos visível no perfil
- [ ] Badges de conquista com ícones
- [ ] Barras de progresso para leveling up
- [ ] Indicadores de ranking
- [ ] Badges de contributor tier nos posts e perfil

---

## 4. Princípios de Design a Manter

- ✅ Usar paleta de cores existente do Sintropia.Space
- ✅ Manter border radius consistente
- ✅ Preservar hierarquia tipográfica (família, pesos, tamanhos)
- ✅ Manter sistema de espaçamento (padding, margins, gaps)
- ✅ Usar conjunto de ícones existente
- ✅ Manter comportamento responsivo
- ✅ Manter padrões de acessibilidade

---

## 5. Arquivos a Modificar

### Prioridade Alta:
1. `src/app/(public)/u/[username]/page.tsx` - Perfil público
2. `src/app/(dashboard)/profile/page.tsx` - Perfil do usuário logado
3. `src/components/posts/PostCard.tsx` - Card de post
4. `src/app/(dashboard)/feed/page.tsx` - Feed de posts

### Componentes a Criar:
1. `src/components/profile/ProfileHeader.tsx` - Header do perfil
2. `src/components/profile/StatsDashboard.tsx` - Dashboard de 4 colunas
3. `src/components/profile/AchievementBadges.tsx` - Badges de conquista
4. `src/components/profile/ProgressBar.tsx` - Barra de progresso de karma
5. `src/components/posts/PostCardNew.tsx` - Novo card estilo feed
6. `src/components/posts/TopicTags.tsx` - Tags de tópico

---

## 6. Ordem de Implementação Sugerida

1. **Fase 1:** Criar componentes base (ProgressBar, AchievementBadges, TopicTags)
2. **Fase 2:** Implementar ProfileHeader no perfil público
3. **Fase 3:** Implementar StatsDashboard
4. **Fase 4:** Adaptar PostCard para novo estilo
5. **Fase 5:** Atualizar feed com novo layout
6. **Fase 6:** Ajustar responsividade e acessibilidade

---

## 7. Considerações Técnicas

- Manter compatibilidade com Supabase data fetching existente
- Preservar funcionalidades de autenticação e moderação
- Manter suporte a tema claro/escuro
- Usar as mesmas queries existentes para posts, comentários, karma
- Manter links para redes sociais (LinkedIn, Twitter)
