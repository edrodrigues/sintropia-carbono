# Sistema de Conquistas - Plano de Implementação

## Visão Geral

Sistema de gamificação com conquistas automáticas que incentivam participação na comunidade do mercado de carbono.

---

## Conquistas Definidas

### 1. Por Atividade na Comunidade

| ID | Conquista | Ícone | Requisito | Categoria |
|----|-----------|-------|-----------|-----------|
| first_post | Primeiro Post | 📝 | 1 post | atividade |
| veteran | Veterano | 📚 | 10 posts | atividade |
| influencer_post | Influenciador | 🗣️ | 50 posts | atividade |
| first_comment | Primeiro Comentário | 💬 | 1 comentário | atividade |
| chatterbox | Commentator | 🔥 | 20 comentários | atividade |
| first_upvote |Upvoted | ⭐ | 10 upvotes recebidos | popularidade |
| star_author | Autor Estrelado | 🌟 | 100 upvotes recebidos | popularidade |
| viral | Viral | 🚀 | 500 upvotes recebidos | popularidade |

### 2. Por Especialização (Mercado de Carbono)

| ID | Conquista | Ícone | Requisito | Categoria |
|----|-----------|-------|-----------|-----------|
| irec_specialist | Analista I-REC | ⚡ | 5 posts com tag I-REC | especializacao |
| cbio_specialist | Especialista CBIO | 🌿 | 5 posts com tag CBIO | especializacao |
| carbon_expert | Expert Carbono | 🌍 | 5 posts com tag carbono | especializacao |
| brasil_carbon | Brasil Carbono | 🇧🇷 | 5 posts sobre Brasil | especializacao |
| industrial_expert | Setor Industrial | 🏭 | 5 posts sobre indústria | especializacao |

### 3. Sociais

| ID | Conquista | Ícone | Requisito | Categoria |
|----|-----------|-------|-----------|-----------|
| mentor | Mentor | 🎓 | 10 respostas aceitas | social |
| connected | Conectado | 🤝 | Perfil com LinkedIn | social |
| follower | Seguidor | 👥 | 10 seguidores | social |

### 4. Por Tempo

| ID | Conquista | Ícone | Requisito | Categoria |
|----|-----------|-------|-----------|-----------|
| early_adopter | Early Adopter | 🥚 | Usuário desde o início | tempo |
| one_year | Um Ano | 📅 | Conta com mais de 1 ano | tempo |

---

## Passo a Passo de Implementação

### Passo 1: Atualizar Interface de Conquistas

**Arquivo:** `src/components/profile/AchievementBadges.tsx`

Modificações necessárias:
- Aceitar array de conquistas com status `earned` e `progress`
- Mostrar no máximo 6 conquistas
- Exibir conquistas conquistadas (cheias)
- Exibir próxima conquista mais próxima (apagada/sombreada com progresso)
-ordernar: conquistas conquistadas primeiro, depois a mais próxima

```typescript
interface Achievement {
  id: string;
  icon: string;
  label: string;
  description: string;
  earned: boolean;
  progress?: {
    current: number;
    target: number;
  };
}
```

### Passo 2: Atualizar ProfileHeader

**Arquivo:** `src/components/profile/ProfileHeader.tsx`

Modificações necessárias:
- Passarkarma do usuário para o componente de conquistas
- Calcular progresso de cada conquista baseado nos dados do usuário
- Passar dados corretos para AchievementBadges

### Passo 3: Criar Função de Cálculo de Progresso

**Arquivo:** `src/lib/achievements.ts` (novo)

Criar função que:
1. Busca dados do usuário (posts, comentários, upvotes, etc.)
2. Calcula progresso de cada conquista
3. Retorna array ordenado com conquistas conquistadas e próxima mais próxima

```typescript
export function calculateAchievements(profile: Profile, userStats: UserStats): Achievement[] {
  const achievements: Achievement[] = [
    {
      id: 'first_post',
      icon: '📝',
      label: 'Primeiro Post',
      description: 'Publique seu primeiro post',
      earned: userStats.postCount >= 1,
      progress: { current: userStats.postCount, target: 1 }
    },
    // ... outras conquistas
  ];

  // Ordenar: conquistadas primeiro, depois por progresso
  return achievements
    .filter(a => a.earned)
    .concat(achievements.filter(a => !a.earned).sort((a, b) => 
      (b.progress?.current || 0) - (a.progress?.current || 0)
    ))
    .slice(0, 6);
}
```

### Passo 4: Buscar Dados do Usuário

**Arquivo:** `src/app/(public)/u/[username]/page.tsx`

Modificações necessárias:
- Buscar contagem de posts
- Buscar contagem de comentários
- Buscar contagem de upvotes recebidos
- Buscar tags dos posts para conquistas especiais
- Passar dados para ProfileHeader

### Passo 5: Estilização

**Conquistas conquistadas:**
- Fundo gradientelight (ex: amber-50 to yellow-50)
- Borda colorida
- Opacidade 100%

**Próxima conquista (em progresso):**
- Fundo cinza claro
- Opacidade 50%
- Mostrar progresso (ex: "3/10")

---

## Ordem de Implementação Sugerida

1. ✅ **Concluído:** Criar AchievementBadges básico
2. 🔄 **Em andamento:** Atualizar AchievementBadges para suporte a progresso
3. 📋 Atualizar ProfileHeader para passar dados
4. 📋 Criar lib/achievements.ts com lógica de cálculo
5. 📋 Atualizar página de perfil para buscar dados
6. 📋 Testar e ajustar estilos

---

## Considerações Técnicas

- Consultas ao banco devem ser otimizadas (usar contagens com `head: true`)
- Cache de conquistas pode ser implementado paraperformance
- Conquistas por especialização requerem análise de tags/categorias dos posts
- Sistema de tempo (early adopter) requer campo `created_at` do perfil
