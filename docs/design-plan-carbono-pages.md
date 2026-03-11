# Plano de Design: Páginas Carbono

## Visão Geral do Projeto

**Tipo de produto**: Data Dashboard - Mercado de Carbono e Energia Renovável  
**Estilo**: Professional SaaS Dashboard com elementos de data visualization  
**Stack**: Next.js 15 + Tailwind CSS v4 + Tremor UI + Recharts  
**Idioma**: Português (PT-BR), Inglês (EN), Espanhol (ES)

---

## 1. Análise dos Dados

### Fonte de Dados: Supabase
- **Origem primária**: Supabase (dados já uploaded)
- **CSV**: Gerado dinamicamente a partir dos dados Supabase para download

### Dados Disponíveis (CSV Mar-2026 - origem para upload)

| Dataset | Registos | Campos Principais |
|---------|----------|-------------------|
| Carbono Brasil | 50 empresas | empresa, setor, volume_2024, volume_2025, delta_pct, volume_2026 |
| Carbono Mundo | 50 empresas | empresa, setor, volume_2024, volume_2025, delta, volume_2026 |
| IREC Brasil | 50 empresas | empresa, setor, papel_mercado, volume_2024-2026 |
| IREC Mundo | 50 empresas | empresa, setor, volume_2024-2026 |

### Tabelas Supabase Existentes

- `carbon_stakeholders` - 30 registos (precisa upload)
- `irec_stakeholders` - 60 registos (Brazil + World)
- `carbon_projects` - 7,752 registos
- `carbon_credits` - 12,254 registos

---

## 2. Estrutura de Páginas

```
src/app/[locale]/(public)/
├── carbono/
│   ├── page.tsx                    # Landing: Overview Carbono Brasil + Mundo
│   ├── ranking-brasil/
│   │   └── page.tsx                # Top 50 Carbono Brasil
│   ├── ranking-mundo/
│   │   └── page.tsx                # Top 50 Carbono Mundo
│   └── setores/
│       └── page.tsx                # Análise por setor
```

---

## 2.1 Requisito: Exibir TOP 50 Completo

**IMPORTANTE**: Todas as páginas de ranking devem exibir **TODOS os 50 registros** do TOP 50:
- `/carbono/ranking-brasil` → 50 empresas brasileiras
- `/carbono/ranking-mundo` → 50 empresas mundiais

**Funcionalidades obrigatórias**:
- [ ] Exibir todos os 50 registros na tabela (sem truncamento)
- [ ] Implementar **paginação** (ex: 10 por página) para performance
- [ ] **Ordenação** por coluna (ranking, empresa, volume, delta)
- [ ] **Busca** por nome de empresa
- [ ] **Filtro** por setor econômico

---

## 3. Design System

### Cores (Tailwind) - Mesmo padrão Energia

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

### Tipografia - Mesmo padrão Energia

| Elemento | Fonte | Tamanho | Peso |
|----------|-------|---------|------|
| H1 | Geist Sans | 36px/2.25rem | Bold (700) |
| H2 | Geist Sans | 30px/1.875rem | Bold (700) |
| H3 | Geist Sans | 24px/1.5rem | Semibold (600) |
| Body | Geist Sans | 16px/1rem | Regular (400) |
| Small | Geist Sans | 14px/0.875rem | Regular (400) |
| Caption | Geist Sans | 12px/0.75rem | Medium (500) |

### Componentes UI - Reutilizar de Energia

| Componente | Biblioteca | Status |
|------------|------------|--------|
| Card | Tremor | Reutilizar |
| Table | Tremor MobileTableWrapper | Reutilizar |
| Charts | Recharts | Reutilizar |
| Badge | Tremor | Reutilizar |
| Metric | Tremor | Reutilizar |
| LastUpdated | Componente existente | Reutilizar |
| DataSources | Componente existente | Reutilizar |
| DataExportButton | Novo (criar) | Criar |

---

## 4. Layouts por Página

### 4.1 Landing Carbono (`/carbono`)

```
┌─────────────────────────────────────────────────────────────┐
│  Header (existente)                                         │
├─────────────────────────────────────────────────────────────┤
│  Breadcrumb: Home > Carbono                                  │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  HERO SECTION                                       │   │
│  │  Título: Mercado de Créditos de Carbono no Brasil   │   │
│  │  Subtição: Compensação de carbono com certificados │   │
│  │  Last Updated: Mar 2026                            │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │  STATS CARD │  │  STATS CARD │  │  STATS CARD │    │
│  │  Total Vol  │  │  Crescimento │  │  Líderes    │    │
│  │  52.4M     │  │  +28.5%     │  │  50        │    │
│  │  tCO2e      │  │  vs 2024    │  │  Empresas   │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  CHART: Comparison Bar Chart                        │   │
│  │  Brasil vs Mundo - Volume 2024/2025/2026          │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌────────────────────┐  ┌────────────────────────┐      │
│  │  Quick Links      │  │  Setores em Destaque   │      │
│  │  [Brasil] [Mundo]│  │  Energia | Tecnologia   │      │
│  │  [Ranking][Projetos]│  │  Financeiro | Varejo  │      │
│  └────────────────────┘  └────────────────────────┘      │
│                                                             │
│  LAST UPDATED + DATA SOURCES + CSV DOWNLOAD                │
│                                                             │
│  Footer (existente)                                         │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 Ranking Brasil (`/carbono/ranking-brasil`)

```
┌─────────────────────────────────────────────────────────────┐
│  Breadcrumb: Home > Carbono > Ranking Brasil                │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  FILTROS                                             │   │
│  │  [Setor: Todos ▼]  [Ano: 2025 ▼]  [Buscar...]     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐     │
│  │ Volume   │ │ Cresc.   │ │ Setores  │ │ Líder    │     │
│  │ 52.4M   │ │ +28.5%   │ │ 12       │ │ Shell   │     │
│  │ tCO2e   │ │ YoY      │ │           │ │         │     │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘     │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  RANKING TABLE (MobileTableWrapper)                │   │
│  │  ┌────┬──────────────┬────────────┬────────┬────┐ │   │
│  │  │ #  │ Empresa      │ Setor      │ Vol   │ Δ% │ │   │
│  │  ├────┼──────────────┼────────────┼────────┼────┤ │   │
│  │  │ 1  │ Shell PLC   │ Energia    │ 14.0M │-30%│ │   │
│  │  │ 2  │ Eni SpA    │ Energia    │ 10.0M │+5% │ │   │
│  │  │ 3  │ Suzano     │ Papel/Cel  │ 2.3M  │+123│ │   │
│  │  │... │ ...          │ ...        │ ...   │... │ │   │
│  │  │ 48 │ TR3 Tentos  │ Agro      │ 3K    │+67%│ │   │
│  │  │ 49 │ Localiza   │ Serviços  │ 200K  │+30%│ │   │
│  │  │ 50 │ Statkraft  │ Energia   │ 64K   │+1766│ │   │
│  │  └────┴──────────────┴────────────┴────────┴────┘ │   │
│  │                                                     │   │
│  │  [← Anterior] Página 1 de 5 [Próxima →]         │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  SETOR BADGES                                       │   │
│  │  [Energia] [Tecnologia] [Financeiro] [Papel] ... │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  LAST UPDATED + DATA SOURCES + CSV DOWNLOAD                │
└─────────────────────────────────────────────────────────────┘
```

### 4.3 Ranking Mundo (`/carbono/ranking-mundo`)

```
┌─────────────────────────────────────────────────────────────┐
│  Breadcrumb: Home > Carbono > Ranking Mundo                 │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  FILTROS                                             │   │
│  │  [Setor: Todos ▼]  [Ano: 2025 ▼]  [Buscar...]     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐     │
│  │ Volume   │ │ Cresc.   │ │ Países   │ │ Líder    │     │
│  │ 200M+   │ │ +15%     │ │ 30+     │ │ Microsoft│     │
│  │ tCO2e   │ │ YoY      │ │           │ │ 45M     │     │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘     │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  RANKING TABLE (TOP 50)                              │   │
│  │  ┌────┬──────────────┬────────────┬────────┬────┐ │   │
│  │  │ #  │ Empresa      │ País       │ Vol   │ Δ% │ │   │
│  │  ├────┼──────────────┼────────────┼────────┼────┤ │   │
│  │  │ 1  │ Microsoft   │ EUA       │ 45.0M │+100│ │   │
│  │  │ 2  │ Shell      │ UK/NL    │ 20.0M │+11%│ │   │
│  │  │ 3  │ Volkswagen │ Alemanha │ 13.5M │+13%│ │   │
│  │  │... │ ...          │ ...        │ ...   │... │ │   │
│  │  │ 48 │ L'Oréal    │ França   │ 1.4M  │+17%│ │   │
│  │  │ 49 │ PwC        │ UK       │ 1.3M  │+18%│ │   │
│  │  │ 50 │ Danone     │ França   │ 1.35M │+8% │ │   │
│  │  └────┴──────────────┴────────────┴────────┴────┘ │   │
│  │                                                     │   │
│  │  [← Anterior] Página 1 de 5 [Próxima →]         │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  INSIGHTS CARDS                                      │   │
│  │  [Big Tech Leadership] [Energy Sector] [Growth]   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  LAST UPDATED + DATA SOURCES + CSV DOWNLOAD                │
└─────────────────────────────────────────────────────────────┘
```

### 4.4 Setores (`/carbono/setores`)

```
┌─────────────────────────────────────────────────────────────┐
│  Breadcrumb: Home > Carbono > Setores                      │
│                                                             │
│  FILTRO: [Selecionar Setor ▼]                            │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  PIE CHART: Distribuição por Setor                  │   │
│  │  (Energia 35%, Tecnologia 25%, Financeiro 15%...) │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  BAR CHART: Volume por Setor (2024/2025/2026)     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  TABLE: Empresas por Setor                          │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  LAST UPDATED + DATA SOURCES + CSV DOWNLOAD                │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. Componentes a Criar/Reutilizar

### 5.1 Componentes Reutilizáveis (do plano Energia)

| Componente | Status | Origem |
|------------|--------|--------|
| `StatsCard` | Reutilizar | Plano Energia |
| `RankingTable` | Reutilizar | Plano Energia |
| `SectorFilter` | Reutilizar | Plano Energia |
| `YearToggle` | Reutilizar | Plano Energia |
| `ComparisonChart` | Reutilizar | Plano Energia |
| `SectorPieChart` | Reutilizar | Plano Energia |
| `VolumeBarChart` | Reutilizar | Plano Energia |
| `SearchInput` | Reutilizar | Plano Energia |
| `Pagination` | Reutilizar | Plano Energia |
| `DataExportButton` | Reutilizar | Plano Energia |

### 5.2 Componentes Específicos Carbono

| Componente | Descrição | Arquivo |
|------------|-----------|---------|
| `CarbonoHero` | Seção hero da landing | `src/components/carbono/CarbonoHero.tsx` |
| `CarbonoStats` | Cards de estatísticas | `src/components/carbono/CarbonoStats.tsx` |
| `CarbonoChart` | Gráfico principal | `src/components/carbono/CarbonoChart.tsx` |
| `CarbonoRankingTable` | Tabela de ranking | `src/components/carbono/CarbonoRankingTable.tsx` |

---

## 6. Queries Supabase

### 6.1 Funções existentes (atualizar)

```typescript
// src/lib/queries/carbon.ts

// Atualizar para suportar:
- getCarbonStakeholders(region: 'brazil' | 'world')
- getCarbonStats(region: 'brazil' | 'world')
- getCarbonStakeholdersBySector(setor: string, region: 'brazil' | 'world')
- getCarbonSectorDistribution(region: 'brazil' | 'world')
- searchCarbonStakeholders(query: string, region: 'brazil' | 'world')
```

### 6.2 Tipos TypeScript

```typescript
interface CarbonStakeholder {
  id: string;
  ranking: number;
  region: 'brazil' | 'world';
  empresa: string;
  setor: string | null;
  volume_2024: number | null;
  volume_2025: number | null;
  volume_2026: number | null;
  delta_pct: number | null;
  created_at: string;
  updated_at: string;
}

interface CarbonStats {
  totalVolume: number;
  crescimento: number;
  totalStakeholders: number;
  leader: CarbonStakeholder;
  sectorDistribution: SectorCount[];
}
```

---

## 7. Internacionalização (i18n)

### 7.1 Arquivos de Tradução

**messages/pt.json** - Adicionar chaves:

```json
{
  "Carbono": {
    "pageTitle": "Mercado de Carbono",
    "pageSubtitle": "Créditos de carbono e compensação ambiental",
    "stats": {
      "totalVolume": "Volume Total",
      "growth": "Crescimento",
      "sectors": "Setores",
      "leaders": "Líderes",
      "vsLastYear": "vs ano anterior",
      "volumeUnit": "tCO2e"
    },
    "table": {
      "rank": "#",
      "company": "Empresa",
      "sector": "Setor",
      "country": "País",
      "vol2024": "2024",
      "vol2025": "2025",
      "vol2026": "2026",
      "delta": "Δ%"
    },
    "filters": {
      "allSectors": "Todos os setores",
      "search": "Buscar empresa...",
      "year": "Ano"
    },
    "insights": {
      "leaderTitle": "Líder Global",
      "growthTitle": "Crescimento",
      "sectorTitle": "Setor Principal"
    }
  }
}
```

---

## 8. SEO & Metadata

### 8.1 Dynamic Metadata por Página

| Página | Title (PT) | Description (PT) |
|--------|------------|------------------|
| /carbono | Mercado Carbono Brasil 2026 | Tudo sobre créditos de carbono no Brasil |
| /carbono/ranking-brasil | Top 50 Carbono Brasil | Ranking das maiores empresas |
| /carbono/ranking-mundo | Top 50 Carbono Mundo | Maiores traders globais |
| /carbono/setores | Setores Carbono | Análise por setor econômico |

---

## 9. Responsive Breakpoints

| Breakpoint | Largura | Comportamento |
|------------|---------|---------------|
| Mobile | < 640px | Stack vertical, table colapsada |
| Tablet | 640px - 1024px | 2 colunas, table scrollável |
| Desktop | > 1024px | Layout completo |

---

## 10. Componentes de Rodapé (Footer) - Obrigatório

Todas as páginas devem incluir no final:

### 10.1 LastUpdated
- **Componente**: `src/components/ui/LastUpdated.tsx` (existente)
- **Uso**: Exibe data da última atualização

### 10.2 DataSources
- **Fonte primária**: Supabase (dados carregados do banco)
- **Componente**: `src/components/ui/DataSources.tsx` (existente)
- **Fontes de referência** (para contexto):
  - Verra Registry (verra.org)
  - Gold Standard (goldstandard.org)
  - ACR (americancarbonregistry.org)
  - CAR (climateactionreserve.org)

### 10.3 CSV Download Button
- **Componente**: `DataExportButton` (criar - ver plano Energia)
- **Funcionalidade**: Gera CSV dinamicamente a partir dos dados Supabase
- **Nome do arquivo**: `{pagina}_{ano-mes}.csv`
  - Ex: `carbono-ranking-brasil_2026-03.csv`
  - Ex: `carbono-ranking-mundo_2026-03.csv`
- **Implementação**: Busca dados do Supabase → Converte para CSV → Download no browser

---

## 11. Checklist de Implementação

### Fase 1: Infraestrutura
- [ ] Executar upload dos dados Carbono para Supabase
- [ ] Atualizar queries Carbono (suportar region='world')
- [ ] Adicionar tipos TypeScript
- [ ] Adicionar traduções i18n

### Fase 2: Componentes UI (reutilizar do Energia)
- [ ] StatsCard - Reutilizar
- [ ] RankingTable - Reutilizar
- [ ] SectorFilter - Reutilizar
- [ ] YearToggle - Reutilizar
- [ ] DataExportButton - Reutilizar

### Fase 3: Páginas Carbono
- [ ] Criar /carbono (landing)
- [ ] Criar /carbono/ranking-brasil (TOP 50 completo)
- [ ] Criar /carbono/ranking-mundo (TOP 50 completo)
- [ ] Criar /carbono/setores
- [ ] Implementar paginação (10 por página = 5 páginas)
- [ ] Implementar ordenação por coluna
- [ ] Implementar busca por empresa

### Fase 4: Footer (Todas as Páginas)
- [ ] Adicionar LastUpdated em todas as páginas
- [ ] Adicionar DataSources em todas as páginas
- [ ] Adicionar DataExportButton (CSV) em todas as páginas

### Fase 5: SEO
- [ ] Metadata dinâmica
- [ ] Sitemap
- [ ] OpenGraph

### Fase 6: Verificação
- [ ] Mobile responsive
- [ ] Dark mode
- [ ] Acessibilidade
- [ ] Performance
- [ ] Testes Playwright

---

## 12. Dependências

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

## 13. Fontes de Dados

### Fonte Primária: Supabase
- Os dados são armazenados e carregados do Supabase
- Upload inicial feito via CSV Mar-2026

### Download CSV
- O CSV é gerado dinamicamente a partir dos dados Supabase
- Botão "Baixar dados" disponível em todas as páginas

### Fontes de Referência (para contexto)
| Dado | Fonte | URL |
|------|-------|-----|
| Verra | Registry | vera.org |
| Gold Standard | Registry | goldstandard.org |
| ACR | Registry | americarbonregistry.org |
| CAR | Registry | climateactionreserve.org |

---

## 14. Dados do CSV (Mar-2026)

### Carbono Brasil (50 empresas)
- Top: Shell PLC (14M tCO2e), Eni SpA (10M), Suzano (2.3M)
- Setores: Energia, Papel e Celulose, Mineração, Financeiro, Tecnologia, Alimentos

### Carbono Mundo (50 empresas)
- Top: Microsoft (45M tCO2e), Shell (20M), Volkswagen (13.5M), Amazon (12M), BP (11M)
- Setores: Tecnologia, Energia,Automotivo, Aviação, Mineração, Alimentos

---

## 15. Próximos Passos

1. **Executar upload** dos dados Carbono para Supabase
2. **Reutilizar componentes** do plano Energia
3. **Criar landing** /carbono
4. **Criar rankings** com filtros
5. **Criar análise** por setores
6. **Testar e verificar** responsividade

---

*Plano gerado com UI-UX-Pro-Max - Design Intelligence*  
*Data: Mar 2026*
