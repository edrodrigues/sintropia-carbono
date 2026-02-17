# Plano de Implementação: Sintropia Carbono v2

## Visão Geral do Projeto

Transformar o Sintropia Carbono de um dashboard estático (HTML/CSS/JS) para uma plataforma comunitaria em tempo real com Next.js e Supabase.

### Stack Tecnológica

| Camada | Tecnologia |
|--------|------------|
| Frontend | Next.js 14 (App Router) |
| Backend | Supabase (Auth, Database, Realtime, Storage) |
| ORM | Prisma |  
| Styling | Tailwind CSS |
| Hosting | Vercel |
| Auth | Supabase Auth |

---

## Fase 1: Configuração do Projeto (Concluído ✅)

### 1.1 Inicialização do Next.js

```bash
# Criar novo projeto Next.js
npx create-next-app@latest sintropia-carbono --typescript --tailwind --eslint

# Entrar no diretório
cd sintropia-carbono

# Instalar dependências
npm install @supabase/supabase-js @supabase/ssr @prisma/client
npm install -D prisma
```

### 1.2 Configuração do Supabase

1. Criar projeto em [supabase.com](https://supabase.com)
2. Configurar variáveis de ambiente:

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 1.3 Configurar Supabase MCP (Opcional mas Recomendado)

O Supabase MCP permite que ferramentas de AI interajam diretamente com seu banco de dados.

#### Configuração no Cursor

1. Adicionar ao `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "supabase": {
      "url": "https://mcp.supabase.com/mcp"
    }
  }
}
```

#### Configuração para Desenvolvimento Local

Durante desenvolvimento local, use:

```
http://localhost:54321/mcp
```

#### Ferramentas Disponíveis com MCP

| Ferramenta | Descrição | Uso no Projeto |
|------------|-----------|----------------|
| `sql_execute` | Executar queries SQL | Criar tabelas, testar queries |
| `list_tables` | Listar tabelas do banco | Verificar schema |
| `get_table_schema` | Ver estrutura de tabela | Debug de schemas |
| `list_projects` | Listar projetos | Gerenciar projetos |
| `call_edge_function` | Chamar edge functions | Testar APIs |

#### Boas Práticas com MCP

- **Scoped to project**: Use `?project_ref=seu_projeto` para limitar acesso
- **Read-only mode**: Use `?read_only=true` para operações seguras
- **Não conectar em produção**: Use MCP apenas em ambiente de desenvolvimento

#### Exemplos de Uso

```sql
-- Com MCP, você pode executar queries diretamente:
-- "Lista todas as tabelas do banco"
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- "Criar a tabela de profiles"
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  karma INTEGER DEFAULT 0
);
```

### 1.3 Estrutura de Diretórios

```
sintropia-carbono/
├── app/                    # Next.js App Router
│   ├── (auth)/            # rotas de autenticação
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/      # área logada
│   │   ├── posts/
│   │   ├── profile/
│   │   └── leaderboard/
│   ├── (public)/         # páginas públicas (migradas)
│   │   ├── certificadoras/
│   │   ├── irec-brasil/
│   │   ├── carbono-brasil/
│   │   └── ...
│   ├── api/              # API routes
│   ├── layout.tsx
│   └── page.tsx
├── components/           # Componentes React
│   ├── ui/
│   ├── posts/
│   ├── comments/
│   └── layout/
├── lib/                  # Utilitários
│   ├── supabase/
│   └── utils/
├── hooks/               # Custom hooks
├── types/               # TypeScript types
└── public/              # Arquivos estáticos
```

---

## Fase 2: Supabase - Configuração de Backend (Concluído ✅)

### 2.1 Schema do Banco de Dados

Executar no Supabase SQL Editor:

```sql
-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enum para roles
CREATE TYPE user_role AS ENUM ('user', 'moderator', 'admin');

-- Tabela de usuários (extende auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  role user_role DEFAULT 'user',
  karma INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de posts
CREATE TABLE public.posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  author_id UUID REFERENCES public.profiles(id) NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  url TEXT,
  category TEXT NOT NULL, -- 'discussion', 'news', 'question', 'link'
  karma INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  is_locked BOOLEAN DEFAULT FALSE,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de comentários
CREATE TABLE public.comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES public.profiles(id) NOT NULL,
  content TEXT NOT NULL,
  karma INTEGER DEFAULT 0,
  parent_id UUID REFERENCES public.comments(id), -- para respostas
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de transações de karma (histórico)
CREATE TABLE public.karma_transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  amount INTEGER NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de votos
CREATE TABLE public.votes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  target_id UUID NOT NULL, -- post_id ou comment_id
  target_type TEXT NOT NULL, -- 'post' ou 'comment'
  vote_type INTEGER NOT NULL, -- 1 = upvote, -1 = downvote
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, target_id, target_type)
);

-- Tabela de moderation (banimentos)
CREATE TABLE public.bans (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  moderator_id UUID REFERENCES public.profiles(id) NOT NULL,
  reason TEXT,
  expires_at TIMESTAMPTZ, -- NULL = permanente
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de reports
CREATE TABLE public.reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  reporter_id UUID REFERENCES public.profiles(id) NOT NULL,
  target_id UUID NOT NULL,
  target_type TEXT NOT NULL,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, reviewed, resolved
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_posts_author ON posts(author_id);
CREATE INDEX idx_posts_category ON posts(category);
CREATE INDEX idx_posts_created ON posts(created_at DESC);
CREATE INDEX idx_comments_post ON comments(post_id);
CREATE INDEX idx_karma_user ON karma_transactions(user_id);
CREATE INDEX idx_votes_target ON votes(target_id, target_type);

-- Trigger para criar profile automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'username', NEW.raw_user_meta_data->>'name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar profile automaticamente
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Nota: Adicionada coluna user_type e suporte a metadados no trigger.
```

### 2.2 Row Level Security (RLS)

```sql
-- Habilitar RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE karma_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE bans ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- Políticas para posts
CREATE POLICY "Public posts are viewable by everyone"
  ON posts FOR SELECT USING (is_deleted = false);

CREATE POLICY "Authenticated users can create posts"
  ON posts FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update own posts"
  ON posts FOR UPDATE USING (auth.uid() = author_id);

-- Políticas para comments
CREATE POLICY "Public comments are viewable by everyone"
  ON comments FOR SELECT USING (is_deleted = false);

CREATE POLICY "Authenticated users can create comments"
  ON comments FOR INSERT WITH CHECK (auth.uid() = author_id);

-- Políticas para votes
CREATE POLICY "Authenticated users can vote"
  ON votes FOR ALL USING (auth.uid() = user_id);

-- Políticas para bans (apenas moderators)
CREATE POLICY "Moderators can view bans"
  ON bans FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('moderator', 'admin'))
  );

CREATE POLICY "Admins can manage bans"
  ON bans FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
```

### 2.3 Configuração de Auth

No Supabase Dashboard > Authentication > Providers:
- Habilitar Email/Password
- Habilitar Google (opcional)
- Configurar redirect URLs

### 2.4 Storage

Criar bucket `avatars` para upload de fotos de perfil.

---

## Fase 3: Migração de Páginas Estáticas (Concluído ✅)

### 3.1 Estratégia de Migração

| Página Original | Nova Página Next.js | Complexidade | Status |
|-----------------|---------------------|--------------|--------|
| index.html | app/page.tsx | Baixa | ✅ Concluído |
| certificadoras.html | app/(public)/certificadoras/page.tsx | Baixa | ✅ Concluído |
| irec-brasil.html | app/(public)/irec-brasil/page.tsx | Baixa | ✅ Concluído |
| irec-mundo.html | app/(public)/irec-mundo/page.tsx | Baixa | ✅ Concluído |
| carbono-brasil.html | app/(public)/carbono-brasil/page.tsx | Baixa | ✅ Concluído |
| carbono-mundo.html | app/(public)/carbono-mundo/page.tsx | Baixa | ✅ Concluído |
| carbono-precos.html | app/(public)/carbono-precos/page.tsx | Baixa | ✅ Concluído |
| irec-precos.html | app/(public)/irec-precos/page.tsx | Baixa | ✅ Concluído |
| Outras | - | Pendente | - |

### 3.2 Processo de Migração

1. **Copiar dados** para arquivos JSON ou integrar com Supabase
2. **Criar componentes** reutilizáveis para charts (Chart.js)
3. **Converter HTML → JSX** mantendo styling Tailwind
4. **Adicionar SSR/ISR** para SEO

### 3.3 Exemplo de Página Migrada

```tsx
// app/(public)/certificadoras/page.tsx
import { createClient } from '@/lib/supabase/server';

export const revalidate = 3600; // ISR - atualizar a cada hora

export default async function CertificadorasPage() {
  const supabase = createClient();
  
  // Dados podem vir do banco ou arquivo estático
  const { data: certificadoras } = await supabase
    .from('market_data')
    .select('*')
    .eq('type', 'certificadoras');

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Certificadoras</h1>
      <div className="grid gap-4">
        {certificadoras?.map((cert) => (
          <CertificadoraCard key={cert.id} data={cert} />
        ))}
      </div>
    </div>
  );
}
```

---

## Fase 4: Sistema de Autenticação (Concluído ✅)

### 4.1 Páginas de Auth

```
app/(auth)/
├── login/
│   └── page.tsx
├── register/
│   └── page.tsx
├── forgot-password/
│   └── page.tsx
├── reset-password/
│   └── page.tsx
└── layout.tsx
```

### 4.2 Componentes de Auth

```tsx
// components/auth/login-form.tsx
'use client';

import { createClient } from '@/lib/supabase/client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      router.push('/');
      router.refresh();
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      {/* ... form fields */}
    </form>
  );
}
```

### 4.3 Middleware de Proteção

```ts
// middleware.ts
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (key) => request.cookies.get(key)?.value,
        set: (key, value, options) => {
          request.cookies.set({ key, value, ...options });
          const response = NextResponse.next({ request });
          response.cookies.set({ key, value, ...options });
          return response;
        },
        remove: (key, options) => {
          request.cookies.set({ key, value: '', ...options });
          const response = NextResponse.next({ request });
          response.cookies.set({ key, value: '', ...options });
          return response;
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // Rotas que requerem auth
  if (request.nextUrl.pathname.startsWith('/posts/new') && !user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}
```

---

## Fase 5: Posts e Comentários (Concluído ✅)

### 5.1 Página de Feed

```tsx
// app/(dashboard)/feed/page.tsx
import { createClient } from '@/lib/supabase/server';
import { PostCard } from '@/components/posts/post-card';
import { CreatePostButton } from '@/components/posts/create-post-button';

export default async function FeedPage() {
  const supabase = createClient();
  
  const { data: posts } = await supabase
    .from('posts')
    .select(`
      *,
      author:profiles(username, avatar_url, karma),
      votes(*)
    `)
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })
    .limit(20);

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <CreatePostButton />
      <div className="space-y-4 mt-4">
        {posts?.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}
```

### 5.2 Componente de Post

```tsx
// components/posts/post-card.tsx
'use client';

import { useState } from 'react';
import { VoteButtons } from '@/components/posts/vote-buttons';
import { CommentSection } from '@/components/comments/comment-section';

export function PostCard({ post }: { post: PostWithRelations }) {
  const [showComments, setShowComments] = useState(false);

  return (
    <div className="border rounded-lg p-4 bg-white dark:bg-gray-800">
      <div className="flex gap-3">
        <VoteButtons 
          targetId={post.id} 
          targetType="post" 
          initialKarma={post.karma} 
        />
        <div className="flex-1">
          <h3 className="text-lg font-semibold">{post.title}</h3>
          {post.content && <p className="mt-2">{post.content}</p>}
          {post.url && (
            <a href={post.url} className="text-blue-500 hover:underline">
              {post.url}
            </a>
          )}
          <div className="flex items-center gap-2 mt-3 text-sm text-gray-500">
            <span>por {post.author?.username}</span>
            <span>•</span>
            <span>{post.karma} karma</span>
            <span>•</span>
            <button 
              onClick={() => setShowComments(!showComments)}
              className="hover:text-blue-500"
            >
              {post.comment_count} comentários
            </button>
          </div>
          {showComments && (
            <CommentSection postId={post.id} />
          )}
        </div>
      </div>
    </div>
  );
}
```

### 5.3 Sistema de Comentários em Tempo Real

```tsx
// components/comments/comment-section.tsx
'use client';

import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';

export function CommentSection({ postId }: { postId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const supabase = createClient();

  useEffect(() => {
    // Carregar comentários iniciais
    const fetchComments = async () => {
      const { data } = await supabase
        .from('comments')
        .select('*, author:profiles(username, avatar_url)')
        .eq('post_id', postId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: true });
      
      if (data) setComments(data);
    };

    fetchComments();

    // Inscrever para realtime updates
    const channel = supabase
      .channel(`comments:${postId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'comments',
          filter: `post_id=eq.${postId}`,
        },
        (payload) => {
          // Buscar author info e adicionar
          setComments((prev) => [...prev, payload.new]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [postId]);

  return (
    <div className="mt-4 border-t pt-4">
      {/* Lista de comentários */}
      <div className="space-y-3">
        {comments.map((comment) => (
          <Comment key={comment.id} comment={comment} />
        ))}
      </div>
      
      {/* Formulário de novo comentário */}
      <CommentForm postId={postId} />
    </div>
  );
}
```

---

## Fase 6: Sistema de Karma (Concluído ✅)

### 6.1 Funções de Karma

Criar trigger no Supabase:

```sql
-- Função para calcular e registrar karma
CREATE OR REPLACE FUNCTION public.calculate_karma()
RETURNS TRIGGER AS $$
BEGIN
  -- Recalcular karma do usuário baseado em posts e comentários
  UPDATE profiles
  SET karma = (
    COALESCE(
      (SELECT SUM(karma) FROM posts WHERE author_id = NEW.author_id),
      0
    ) +
    COALESCE(
      (SELECT SUM(karma) FROM comments WHERE author_id = NEW.author_id),
      0
    )
  )
  WHERE id = NEW.author_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER on_post_karma_change
  AFTER INSERT OR UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION public.calculate_karma();

CREATE TRIGGER on_comment_karma_change
  AFTER INSERT OR UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION public.calculate_karma();
```

### 6.2 Ações que Geram Karma

| Ação | Karma |
|------|-------|
| Criar post | +5 |
| Criar comentário | +2 |
| Receber upvote (post) | +10 |
| Receber upvote (comment) | +5 |
| Dar upvote | +1 |
| Post marcado como "helpful" | +15 |
| Login diário (1x/dia) | +1 |

### 6.3 Página de Leaderboard

```tsx
// app/(dashboard)/leaderboard/page.tsx
import { createClient } from '@/lib/supabase/server';

export default async function LeaderboardPage() {
  const supabase = createClient();
  
  const { data: users } = await supabase
    .from('profiles')
    .select('username, karma, created_at')
    .order('karma', { ascending: false })
    .limit(100);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Leaderboard</h1>
      <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100 dark:bg-gray-700">
            <tr>
              <th className="p-3 text-left">#</th>
              <th className="p-3 text-left">Usuário</th>
              <th className="p-3 text-right">Karma</th>
            </tr>
          </thead>
          <tbody>
            {users?.map((user, index) => (
              <tr key={user.username} className="border-t">
                <td className="p-3">{index + 1}</td>
                <td className="p-3">{user.username}</td>
                <td className="p-3 text-right font-bold">{user.karma}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

---

## Fase 7: Perfis de Usuário (Concluído ✅)

### 7.1 Página de Perfil

```tsx
// app/(dashboard)/profile/[username]/page.tsx
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';

export default async function ProfilePage({ 
  params 
}: { 
  params: { username: string } 
}) {
  const supabase = createClient();
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', params.username)
    .single();

  if (!profile) notFound();

  const { data: posts } = await supabase
    .from('posts')
    .select('*')
    .eq('author_id', profile.id)
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })
    .limit(10);

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-20 h-20 rounded-full bg-gray-300">
          {profile.avatar_url && (
            <img 
              src={profile.avatar_url} 
              alt={profile.username}
              className="w-full h-full rounded-full object-cover"
            />
          )}
        </div>
        <div>
          <h1 className="text-2xl font-bold">{profile.display_name || profile.username}</h1>
          <p className="text-gray-500">@{profile.username}</p>
          <p className="text-yellow-500 font-bold">{profile.karma} karma</p>
        </div>
      </div>
      
      {profile.bio && <p className="mb-6">{profile.bio}</p>}
      
      <h2 className="text-xl font-semibold mb-4">Posts Recentes</h2>
      {/* Lista de posts */}
    </div>
  );
}
```

### 7.2 Edição de Perfil

```tsx
// app/(dashboard)/settings/profile/page.tsx
'use client';

import { createClient } from '@/lib/supabase/client';
import { useState, useEffect } from 'react';

export default function EditProfilePage() {
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const [formData, setFormData] = useState({
    display_name: '',
    bio: '',
    username: '',
  });

  useEffect(() => {
    const getProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (data) {
          setFormData({
            display_name: data.display_name || '',
            bio: data.bio || '',
            username: data.username || '',
          });
        }
      }
    };
    getProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    
    await supabase
      .from('profiles')
      .update(formData)
      .eq('id', user?.id);
    
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        placeholder="Nome de exibição"
        value={formData.display_name}
        onChange={(e) => setFormData({...formData, display_name: e.target.value})}
        className="w-full p-2 border rounded"
      />
      <textarea
        placeholder="Bio"
        value={formData.bio}
        onChange={(e) => setFormData({...formData, bio: e.target.value})}
        className="w-full p-2 border rounded"
      />
      <button 
        type="submit" 
        disabled={loading}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        {loading ? 'Salvando...' : 'Salvar'}
      </button>
    </form>
  );
}
```

---

## Fase 8: Sistema de Moderação

### 8.1 Rotas Protegidas para Moderadores

```tsx
// app/(dashboard)/mod/reports/page.tsx
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function ModDashboard() {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user?.id)
    .single();

  if (!profile || !['moderator', 'admin'].includes(profile.role)) {
    redirect('/');
  }

  const { data: reports } = await supabase
    .from('reports')
    .select('*, reporter:profiles(username)')
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Dashboard de Moderação</h1>
      {/* Lista de reports */}
    </div>
  );
}
```

### 8.2 Ações de Moderação

```tsx
// components/mod/ban-user-button.tsx
'use client';

import { createClient } from '@/lib/supabase/client';

export function BanUserButton({ userId, username }: { userId: string; username: string }) {
  const supabase = createClient();

  const handleBan = async (permanent: boolean, reason: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    await supabase.from('bans').insert({
      user_id: userId,
      moderator_id: user?.id,
      reason,
      expires_at: permanent ? null : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias
    });

    await supabase
      .from('profiles')
      .update({ role: 'banned' })
      .eq('id', userId);
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={() => handleBan(false, 'Spam')}
        className="px-3 py-1 bg-yellow-500 text-white rounded text-sm"
      >
        Ban 7 dias
      </button>
      <button
        onClick={() => handleBan(true, 'Violação grave')}
        className="px-3 py-1 bg-red-500 text-white rounded text-sm"
      >
        Ban permanente
      </button>
    </div>
  );
}
```

---

## Fase 9: Deploy (Concluído ✅)

### 9.1 Configuração Vercel

1. **Conectar repositório ao Vercel:**
   - Acesse [vercel.com](https://vercel.com)
   - Clique em "Add New..." > "Project"
   - Importe o repositório do GitHub
   - Selecione o diretório `sintropia-carbono` como root

2. **Configurar variáveis de ambiente:**
   No Vercel Dashboard > Settings > Environment Variables:

   | Nome | Valor |
   |------|-------|
   | `NEXT_PUBLIC_SUPABASE_URL` | Sua URL do Supabase |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Sua chave anônima do Supabase |

3. **Configurações do Build:**
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`

### 9.2 GitHub Actions CI/CD

O workflow `.github/workflows/deploy.yml` está configurado para:

| Evento | Ação |
|--------|------|
| Push para `main` | Deploy automático para produção |
| Pull Request | Deploy para ambiente de preview |
| Pull Request | Executa lint e build |

**Secrets necessários no GitHub** (Settings > Secrets and variables > Actions):

- `VERCEL_TOKEN`: Token de API do Vercel
- `NEXT_PUBLIC_SUPABASE_URL`: URL do projeto Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Chave anônima do Supabase

### 9.3 Builds Estáticos para Páginas Públicas

Para páginas que não requerem auth, usar generateStaticParams:

```tsx
// app/(public)/certificadoras/page.tsx
export async function generateStaticParams() {
  return [{ slug: 'certificadoras' }];
}
```

---

## Fase 10: Configuração de Provedores OAuth (Pendente ⏳)

> **Próximo passo manual — requer acesso ao Supabase Dashboard.**

### 10.1 Google OAuth
1. Acesse o [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Crie um **OAuth 2.0 Client ID** (tipo: Web Application)
3. Adicione o Redirect URI: `https://tashftatbucseafjlfdw.supabase.co/auth/v1/callback`
4. No **Supabase Dashboard** → Authentication → Providers → **Google**
5. Ative o provedor e cole o **Client ID** e **Client Secret**

### 10.2 LinkedIn OAuth (OIDC)
1. Acesse o [LinkedIn Developer Portal](https://www.linkedin.com/developers/apps)
2. Crie um app e solicite o produto **"Sign In with LinkedIn using OpenID Connect"**
3. Adicione o Redirect URI: `https://tashftatbucseafjlfdw.supabase.co/auth/v1/callback`
4. No **Supabase Dashboard** → Authentication → Providers → **LinkedIn (OIDC)**
5. Ative o provedor e cole o **Client ID** e **Client Secret**

### 10.3 Redirect URI (ambos provedores)

```
https://tashftatbucseafjlfdw.supabase.co/auth/v1/callback
```

> Os botões de Google e LinkedIn já estão implementados nas páginas de login e registro. Basta configurar as credenciais acima no dashboard para ativá-los.

---

## Checklist de Implementação

### Fase 1: Setup
- [x] Criar projeto Next.js
- [x] Configurar Tailwind CSS
- [x] Instalar dependências Supabase
- [x] Configurar variáveis de ambiente
- [x] Configurar Supabase MCP no Cursor/ferramenta de AI

### Fase 2: Backend
- [x] Criar projeto Supabase
- [x] Executar schema SQL
- [x] Configurar RLS policies
- [x] Configurar Auth providers
- [x] Criar bucket de avatars

### Fase 3: Migração
- [x] Migrar index.html
- [x] Migrar certificadoras.html
- [x] Migrar irec-brasil.html
- [x] Migrar irec-mundo.html
- [x] Migrar carbono-brasil.html
- [x] Migrar carbono-mundo.html
- [x] Migrar carbono-precos.html
- [x] Migrar irec-precos.html

### Fase 4: Auth
- [x] Criar página de login
- [x] Criar página de registro
- [x] Configurar middleware de proteção
- [x] Implementar logout

### Fase 5: Posts & Comments (Concluído ✅)
- [x] Criar feed de posts
- [x] Implementar criação de posts
- [x] Implementar sistema de comentários
- [x] Adicionar realtime updates
- [x] Implementar sistema de votos

### Fase 6: Karma (Concluído ✅)
- [x] Configurar triggers de karma
- [x] Implementar lógica de pontuação
- [x] Criar página de leaderboard

### Fase 7: Perfis
- [x] Criar página de perfil
- [x] Implementar edição de perfil
- [x] Adicionar upload de avatar

### Fase 8: Moderação (Concluído ✅)
- [x] Criar dashboard de moderação
- [x] Implementar sistema de reports
- [x] Implementar banimentos

### Fase 9: Deploy (Concluído ✅)
- [x] Configurar Vercel
- [x] Testar produção
- [x] Configurar CI/CD

---

## Cronograma Sugerido

| Semana | Foco | Status |
|--------|------|--------|
| 1 | Setup + Backend (Schema + Auth) | ✅ Concluído |
| 2-3 | Migração de páginas estáticas | ✅ Concluído |
| 4 | Sistema de Posts e Comentários | ✅ Concluído |
| 5 | Karma + Leaderboard | ✅ Concluído |
| 6 | Perfis + Moderação | ✅ Concluído |
| 7 | Polish + Testing | ✅ Concluído |
| 8 | Deploy + Launch | ✅ Concluído |

---

## Recursos Adicionais

- [Documentação Supabase MCP](https://supabase.com/mcp)
- [Documentação Supabase](https://supabase.com/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Auth Helpers](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Prisma with Supabase](https://www.prisma.io/docs/orm/overview/databases/postgresql/supabase)
