# Plano de Design: Páginas Energia (I-REC)

## Visão Geral do Projeto

**Tipo de produto**: Data Dashboard - Mercado de Carbono e Energia Renovável  
**Estilo**: Professional SaaS Dashboard com elementos de data visualization  
**Stack**: Next.js 15 + Tailwind CSS v4 + Tremor UI + Recharts  
**Idioma**: Português (PT-BR), Inglês (EN), Espanhol (ES)

---

## 1. Análise dos Dados

### Dados Disponíveis (CSV Mar-2026)

| Dataset | Registos | Campos Principais |
|---------|----------|-------------------|
| IREC Brasil | 50 empresas | empresa, setor, papel_mercado, volume_2024, volume_2025, volume_2026, delta_num, delta_pct |
| IREC Mundo | 50 empresas | empresa, setor, volume_2024, volume_2025, volume_2026, delta |
| Carbono Brasil | 50 empresas | empresa, setor, volume_2024, volume_2025, delta, volume_2026 |
| Carbono Mundo | 50 empresas | empresa, setor, volume_2024, volume_2025, delta, volume_2026 |

### Tabelas Supabase Existentes

- `irec_stakeholders` - 60 registos (Brazil + World)
- `carbon_stakeholders` - 30 registos
- `irec_prices` - 11 registos
- `carbon_projects` - 7,752 registos
- `carbon_credits` - 12,254 registos

---

## 2. Estrutura de Páginas

```
src/app/[locale]/(public)/
├── energia/
│   ├── page.tsx                    # Landing: Overview I-REC Brasil + Mundo
│   ├── ranking-brasil/
│   │   └── page.tsx                # Top 50 IREC Brasil
│   ├── ranking-mundo/
│   │   └── page.tsx                # Top 50 IREC Mundo
│   └── setores/
│       └── page.tsx                 # Análise por setor
└── carbono/
    ├── page.tsx                    # Landing: Overview Carbono
    ├── ranking-brasil/
    │   └── page.tsx                # Top 50 Carbono Brasil
    ├── ranking-mundo/
    │   └── page.tsx                # Top 50 Carbono Mundo
    └── setores/
        └── page.tsx                # Análise por setor
```

---

## 3. Design System

### Cores (Tailwind)

| Uso | Cor | Hex |
|-----|-----|-----|
| Primary | Forest Green | `#059669` |
| Primary Dark | Emerald 900 | `#064e3b` |
| Secondary | Blue 600 | `#1e40af` |
| Accent | Amber 500 | `#f59e0b` |
| Background | Slate 50 | `#f8fafc` |
| Surface | White | `#ffffff` |
| Text Primary | Slate 900 | `#0f172a` |
| Text Secondary | Slate 500 | `#64748b` |

### Tipografia

| Elemento | Fonte | Tamanho | Peso |
|----------|-------|---------|------|
| H1 | Geist Sans | 36px/2.25rem | Bold (700) |
| H2 | Geist Sans | 30px/1.875rem | Bold (700) |
| H3 | Geist Sans | 24px/1.5rem | Semibold (600) |
| Body | Geist Sans | 16px/1rem | Regular (400) |
| Small | Geist Sans | 14px/0.875rem | Regular (400) |
| Caption | Geist Sans | 12px/0.75rem | Medium (500) |

### Componentes UI (Padrões)

| Componente | Biblioteca | Uso |
|------------|------------|-----|
| Card | Tremor | Containers de informação |
| Table | Tremor MobileTableWrapper | Rankings |
| Charts | Recharts | Visualizações |
| Badge | Tremor | Tags de setor |
| Metric | Tremor | KPIs |
| Button | Radix/Tailwind | Ações |

---

## 4. Layouts por Página

### 4.1 Landing Energia (`/energia`)

```
┌─────────────────────────────────────────────────────────────┐
│  Header (existente)                                         │
├─────────────────────────────────────────────────────────────┤
│  Breadcrumb: Home > Energia                                 │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  HERO SECTION                                       │   │
│  │  Título: Mercado de Energia Renovável no Brasil    │   │
│  │  Subtítulo: Compensação de energia com I-REC      │   │
│  │  Last Updated: Mar 2026                           │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │  STATS CARD │  │  STATS CARD │  │  STATS CARD │    │
│  │  Total Vol  │  │  Crescimento │  │  Líderes    │    │
│  │  52.4M     │  │  +28.5%     │  │  50        │    │
│  │  I-RECs     │  │  vs 2024    │  │  Empresas   │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  CHART: Comparison Bar Chart                        │   │
│  │  Brasil vs Mundo - Volume 2024/2025/2026          │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌────────────────────┐  ┌────────────────────────┐      │
│  │  Quick Links      │  │  Setores em Destaque   │      │
│  │  [Brasil] [Mundo]│  │  Energia | Mineração   │      │
│  │  [Ranking][Preços]│  │  Varejo  | Financeiro │      │
│  └────────────────────┘  └────────────────────────┘      │
│                                                             │
│  Footer (existente)                                         │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 Ranking Brasil (`/energia/ranking-brasil`)

```
┌─────────────────────────────────────────────────────────────┐
│  Breadcrumb: Home > Energia > Ranking Brasil                │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  FILTROS                                             │   │
│  │  [Setor: Todos ▼]  [Ano: 2025 ▼]  [Buscar...]     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐     │
│  │ Volume   │ │ Cresc.   │ │ Setores  │ │ Líder    │     │
│  │ 52.4M   │ │ +28.5%   │ │ 12       │ │ Comerc   │     │
│  │ I-RECs   │ │ YoY      │ │           │ │ Energia  │     │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘     │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  RANKING TABLE (MobileTableWrapper)                │   │
│  │  ┌────┬──────────────┬────────────┬────────┬────┐ │   │
│  │  │ #  │ Empresa      │ Setor      │ Vol   │ Δ% │ │   │
│  │  ├────┼──────────────┼────────────┼────────┼────┤ │   │
│  │  │ 1  │ Comerc       │ Energia    │ 8.0M  │+30%│ │   │
│  │  │ 2  │ Raízen Power │ Energia    │ 5.6M  │+15%│ │   │
│  │  │ 3  │ Engie        │ Energia    │ 5.5M  │+30%│ │   │
│  │  │... │ ...          │ ...        │ ...   │... │ │   │
│  │  └────┴──────────────┴────────────┴────────┴────┘ │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  SETOR BADGES                                       │   │
│  │  [Energia] [Mineração] [Varejo] [Financeiro] ...  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  DataSources + LastUpdated                                  │
└─────────────────────────────────────────────────────────────┘
```

### 4.3 Ranking Mundo (`/energia/ranking-mundo`)

```
┌─────────────────────────────────────────────────────────────┐
│  Similar ao Brasil, com:                                    │
│  - Dados de IREC Mundo (TWh)                               │
│  - Comparativo: Brasil Position                           │
│  - Gráfico: Top 10 Global                                 │
└─────────────────────────────────────────────────────────────┘
```

### 4.4 Setores (`/energia/setores`)

```
┌─────────────────────────────────────────────────────────────┐
│  FILTRO: [Selecionar Setor ▼]                             │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  PIE CHART: Distribuição por Setor                  │   │
│  │  (Energia 45%, Financeiro 20%, etc.)              │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  BAR CHART: Volume por Setor (2024/2025/2026)     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  TABLE: Empresas por Setor                          │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. Componentes a Criar

### 5.1 Componentes de UI

| Componente | Descrição | Arquivo |
|------------|-----------|---------|
| `StatsCard` | Card de estatística com ícone, valor, label | `src/components/ui/StatsCard.tsx` |
| `RankingTable` | Tabela filtrável com sorting | `src/components/ui/RankingTable.tsx` |
| `SectorFilter` | Dropdown de filtros por setor | `src/components/ui/SectorFilter.tsx` |
| `YearToggle` | Selector 2024/2025/2026 | `src/components/ui/YearToggle.tsx` |
| `ComparisonChart` | Gráfico comparativo | `src/components/charts/ComparisonChart.tsx` |
| `SectorPieChart` | Gráfico de pizza por setor | `src/components/charts/SectorPieChart.tsx` |
| `VolumeBarChart` | Gráfico de barras volume | `src/components/charts/VolumeBarChart.tsx` |
| `SearchInput` | Input de busca | `src/components/ui/SearchInput.tsx` |
| `Pagination` | Paginação | `src/components/ui/Pagination.tsx` |

### 5.2 Componentes de Página

| Componente | Descrição | Arquivo |
|------------|-----------|---------|
| `EnergiaHero` | Seção hero da landing | `src/components/energia/EnergiaHero.tsx` |
| `EnergiaStats` | Cards de estatísticas | `src/components/energia/EnergiaStats.tsx` |
| `EnergiaChart` | Gráfico principal | `src/components/energia/EnergiaChart.tsx` |
| `EnergiaRankingTable` | Tabela de ranking | `src/components/energia/EnergiaRankingTable.tsx` |

---

## 6. Queries Supabase

### 6.1 Atualizar `src/lib/queries/irec.ts`

```typescript
// Novas funções necessárias:
- getIrecStakeholdersByRegion(region: 'brazil' | 'world')
- getIrecStakeholdersBySector(setor: string, region: 'brazil' | 'world')
- getIrecStatsByRegion(region: 'brazil' | 'world')
- getIrecByYear(year: 2024 | 2025 | 2026)
- searchIrecStakeholders(query: string, region: 'brazil' | 'world')
- getIrecSectorDistribution(region: 'brazil' | 'world')
```

### 6.2 Tipos TypeScript

```typescript
interface IrecStakeholder {
  id: string;
  ranking: number;
  region: 'brazil' | 'world';
  empresa: string;
  setor: string | null;
  papel_mercado: string | null;
  volume_2024: number | null;
  volume_2025: number | null;
  volume_2026: number | null;
  delta_num: number | null;
  delta_pct: number | null;
}

interface IrecStats {
  totalVolume: number;
  crescimento: number;
  totalStakeholders: number;
  leader: IrecStakeholder;
  sectorDistribution: SectorCount[];
}
```

---

## 7. Internacionalização (i18n)

### 7.1 Arquivos de Tradução

**messages/pt.json** - Adicionar chaves:

```json
{
  "Energia": {
    "pageTitle": "Mercado de Energia Renovável",
    "pageSubtitle": "Compensação de energia com certificados I-REC",
    "stats": {
      "totalVolume": "Volume Total",
      "growth": "Crescimento",
      "sectors": "Setores",
      "leaders": "Líderes",
      "vsLastYear": "vs ano anterior"
    },
    "table": {
      "rank": "#",
      "company": "Empresa",
      "sector": "Setor",
      "role": "Papel",
      "vol2024": "2024",
      "vol2025": "2025",
      "vol2026": "2026",
      "delta": "Δ%"
    },
    "filters": {
      "allSectors": "Todos os setores",
      "search": "Buscar empresa...",
      "year": "Ano"
    }
  }
}
```

---

## 8. SEO & Metadata

### 8.1 Dynamic Metadata por Página

| Página | Title (PT) | Description (PT) |
|--------|------------|------------------|
| /energia | Mercado I-REC Brasil 2026 | Tudo sobre certificados I-REC no Brasil |
| /energia/ranking-brasil | Top 50 I-REC Brasil | Ranking das maiores empresas |
| /energia/ranking-mundo | Top 50 I-REC Mundo | Maiores traders globais |
| /energia/setores | Setores I-REC | Análise por setor econômico |

---

## 9. Responsive Breakpoints

| Breakpoint | Largura | Comportamento |
|------------|---------|---------------|
| Mobile | < 640px | Stack vertical, table colapsada |
| Tablet | 640px - 1024px | 2 colunas, table scrollável |
| Desktop | > 1024px | Layout completo |

---

## 10. Checklist de Implementação

### Fase 1: Infraestrutura
- [ ] Atualizar queries Supabase
- [ ] Adicionar tipos TypeScript
- [ ] Adicionar traduções i18n

### Fase 2: Componentes UI
- [ ] Criar StatsCard
- [ ] Criar RankingTable
- [ ] Criar SectorFilter
- [ ] Criar YearToggle
- [ ] Criar SearchInput

### Fase 3: Componentes Charts
- [ ] Criar ComparisonChart
- [ ] Criar SectorPieChart
- [ ] Criar VolumeBarChart

### Fase 4: Páginas
- [ ] Criar /energia (landing)
- [ ] Criar /energia/ranking-brasil
- [ ] Criar /energia/ranking-mundo
- [ ] Criar /energia/setores

### Fase 5: Integração
- [ ] Conectar com Supabase
- [ ] Adicionar filtros
- [ ] Adicionar busca
- [ ] Adicionar paginação

### Fase 6: SEO
- [ ] Metadata dinâmica
- [ ] Sitemap
- [ ] OpenGraph

### Fase 7: Verificação
- [ ] Mobile responsive
- [ ] Dark mode
- [ ] Acessibilidade
- [ ] Performance
- [ ] Testes Playwright

---

## 11. Dependências Existentes

```json
{
  "dependencies": {
    "next": "^15.5.12",
    "react": "18.3.1",
    "tailwindcss": "^4",
    "@tremor/react": "existing",
    "recharts": "^3.7.0",
    "@radix-ui/react-select": "^2.2.6",
    "@remixicon/react": "^4.9.0"
  }
}
```

---

## 12. Fontes de Dados

| Dado | Fonte | URL |
|------|-------|-----|
| IREC Brazil | CSV Mar-2026 | dados/3. Mar-2026/ |
| IREC World | CSV Mar-2026 | dados/3. Mar-2026/ |
| Metadata | I-REC Foundation | irec.org |

---

## 13. Próximos Passos

1. **Executar upload dos dados** para Supabase
2. **Atualizar queries** para suportar novos dados
3. **Criar componentes base** (StatsCard, RankingTable)
4. **Implementar landing** /energia
5. **Implementar rankings** com filtros
6. **Implementar análise** por setores
7. **Testar e verificar** responsividade

---

*Plano gerado com UI-UX-Pro-Max - Design Intelligence*  
*Data: Mar 2026*
