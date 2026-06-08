# Plano de Atualização de Dados — Junho 2026

## Visão Geral

Novos dados disponíveis na pasta `dados/Junho26/` (4 arquivos CSV) devem substituir os dados atuais em **múltiplas camadas** do projeto. Abaixo, o plano detalhado de cada arquivo, os locais impactados e os passos necessários.

> **Status: ✅ COMPLETO** — Todos os passos foram executados em 08/06/2026.

---

## 1. Mapeamento dos Novos Arquivos vs. Dados Atuais

| Novo CSV (Junho26) | Substitui / Alimenta | Conteúdo |
|---|---|---|
| `Carbon - Top 50 World.csv` | Ranking Mundo Carbono + gráfico + `dados.json` + `dados.md` | Top 50 compradores carbono (mundo), volumes 2024, 2025 e 2026 YTD |
| `Carbon - Top 50 Brazil.csv` | Ranking Brasil Carbono + gráfico + `dados.json` + `dados.md` | Top 50 compradores carbono (Brasil), volumes 2024, 2025 e 2026 YTD |
| `IRECs - Top 50 World.csv` | Ranking Mundo I-REC + gráfico + `dados.json` | Top 50 players I-REC (mundo), volumes 2024 e 2025 |
| `IRecs - Top 50 Brazil.csv` | Ranking Brasil I-REC + gráfico + `dados.json` | Top 18 players I-REC (Brasil), volumes 2024 e 2025 |

> **Nota:** Os CSVs de preços (`irec-precos-2024-2025.md`, `carbono-precos-2024-2025.md`) e `CarbonPlan/` **não** têm novos dados nesta leva — permanecem inalterados.

---

## 2. Camadas de Dados a Atualizar

Cada dado novo precisa ser refletido em **3 camadas**:

```
CSV (Junho26)
  ├── Camada 1: Supabase Database (ranking pages)
  ├── Camada 2: Chart Components (hardcoded data)
  └── Camada 3: Static data files (dados.json, dados.md)
```

---

## 3. Passo a Passo Detalhado

### 3.1. Atualizar Supabase Database ✅

As páginas de ranking (`/carbono/ranking-brasil`, `/carbono/ranking-mundo`, `/energia/ranking-brasil`, `/energia/ranking-mundo`) fazem consultas via `getCarbonStakeholders()` e `getIrecStakeholders()` que lêem as tabelas:

- **`carbon_stakeholders`** — stakeholders de carbono (Brasil e Mundo)
- **`irec_stakeholders`** — stakeholders I-REC (Brasil e Mundo)

#### Ação:

| Tabela | CSV de Origem | Itens |
|---|---|---|
| `carbon_stakeholders` (region = "brazil") | `Carbon - Top 50 Brazil.csv` | 50 registros (hoje 25) |
| `carbon_stakeholders` (region = "world") | `Carbon - Top 50 World.csv` | 50 registros (hoje 25) |
| `irec_stakeholders` (region = "brazil") | `IRecs - Top 50 Brazil.csv` | 18 registros válidos (hoje 25) |
| `irec_stakeholders` (region = "world") | `IRECs - Top 50 World.csv` | 50 registros (hoje 25) |

**Passos:**
1. ✅ Gerar scripts SQL (INSERT/UPDATE) ou CSV de importação para cada tabela
2. ✅ Gerado em `supabase/migrations/20260608000001_update_stakeholders_data.sql`
3. ✅ Verificar: cada tabela contém região correta, ranking sequencial, dados de volume e delta

**Mudanças de schema observadas:**
- Os novos CSVs têm coluna `Volume 2026 (YTD)` — a interface `CarbonStakeholder` já possui `volume_2026: number | null` (carbon.ts linha 15), então o schema atual já suporta. Verificar se `irec_stakeholders` também tem.
- `Carbon - Top 50 Brazil.csv` inclui coluna `Delta (tCO2)` que mapeia para `delta_num` (carbon.ts linha 16).
- `IRecs - Top 50 Brazil.csv` tem muitos valores "N/D" — tratar como `null` no banco.

---

### 3.2. Atualizar Chart Components (hardcoded) ✅

Os charts exibem dados incorporados diretamente no código-fonte. Eles **não** consultam o banco, portanto precisam ser editados manualmente.

#### Arquivos Impactados:

| Componente | Caminho | Dados Atuais | Fonte Nova | Ação |
|---|---|---|---|---|
| **CarbonoBrasilChart** | `src/components/charts/CarbonoBrasilChart.tsx` | 25 empresas (Banco Votorantim, Petrobras...) | `Carbon - Top 50 Brazil.csv` (Top 10-15) | Substituir arrays `labels`, `volumes2024`, `volumes2025`, `sectors`, `sectorDistribution` |
| **CarbonoMundoChart** | `src/components/charts/CarbonoMundoChart.tsx` | 25 empresas (Microsoft, Shell...) | `Carbon - Top 50 World.csv` (Top 10-15) | Substituir arrays `fullChartData`, `volumes2024`, `volumes2025`, `sectorsByVolume`, `sectorDistribution` |
| **IrecBrasilChart** | `src/components/charts/IrecBrasilChart.tsx` | 25 empresas (Eletrobras, Vale...) | `IRecs - Top 50 Brazil.csv` (Top 10-15) | Substituir arrays `fullChartData`, `volumes2024`, `volumes2025`, `sectors`, `sectorDistribution` |
| **IrecMundoChart** | `src/components/charts/IrecMundoChart.tsx` | 25 empresas (Microsoft, Google...) | `IRECs - Top 50 World.csv` (Top 15-25) | Substituir arrays `fullChartData`, `volumes2024`, `volumes2025`, `sectors`, `sectorDistribution` |

> **Decisão:** Manter Top 15-25 nos charts (como hoje) ou expandir para 50? Sugere-se manter Top 15 para não sobrecarregar o gráfico de barras.

#### Ação:
Para cada chart:
1. ✅ Extrair Top N do CSV correspondente (Top 15 Brasil/Mundo Carbono, Top 15 IREC Brasil, Top 25 IREC Mundo)
2. ✅ Recalcular `sectorDistribution` (agregação por setor) com base nos novos dados
3. ✅ Substituir arrays hardcoded no componente
4. ✅ Atualizar comentários/cabeçalho se houver data de referência

---

### 3.3. Atualizar `dados.json` (download público) ✅

Arquivo: `dados/dados.json`

Seções a atualizar:

| Chave JSON | Nova Fonte | O que muda |
|---|---|---|
| `carbonoBrasil` | `Carbon - Top 50 Brazil.csv` | Expandir de 25 → 50 empresas; novos volumes e deltas |
| `carbonoMundo` | `Carbon - Top 50 World.csv` | Expandir de 25 → 50 empresas; valores diferentes |
| `irecBrasil` | `IRecs - Top 50 Brazil.csv` | Substituir 25 empresas por 18 novas; papéis diferentes (Gerador/Comercializador) |
| `irecMundo` | (sem dado novo específico) | Manter atual ou aguardar confirmação |

> **Nota:** `certificadoras`, `certificadorasEnergia`, `energiaRenovavelMundo`, `precosCarbono`, `precosIrec` — sem novos dados neste lote.

#### Ação:
1. ✅ Parsear cada CSV
2. ✅ Gerar novo JSON seguindo a mesma estrutura
3. ✅ Substituir `dados/dados.json`
4. ✅ Copiar para `public/dados/dados.json`

---

### 3.4. Atualizar `dados.md` (download público) ✅

Arquivo: `dados/dados.md`

Seções a atualizar:
- Tabela "Mercado Brasileiro Compradores de Carbono por Setor (Top 25)" → expandir para Top 50
- Tabela "Mercado Brasileiro compradores de certificados I-REC (Top 25)" → substituir dados
- Tabela "Compradores de Carbono (Mundo)" → expandir para Top 50
- Datas de atualização (linhas "Fonte e Última atualização"): mudar de 15/02/2026 para 08/06/2026

#### Ação:
✅ Reescrever as 4 seções afetadas e atualizar as datas de referência para 08/06/2026.

---

### 3.5. Atualizar Página de Certificadoras (hardcoded) ✅ (sem alterações necessárias)

Arquivo: `src/app/[locale]/(public)/certificadoras/page.tsx`

As listas `certificadoras` (linhas 39-50) e `energiaPadroes` (linhas 52-63) estão hardcoded. Os dados de certificadoras/padrões **não** vêm dos novos CSVs, portanto **provavelmente não precisam ser alterados**, a menos que haja novas informações de volume que queiram refletir. Manter como está, salvo demanda específica.

---

## 4. Resumo por Arquivo Editado

| # | Arquivo | Tipo de Edição | Prioridade | Status |
|---|---|---|---|---|---|
| 1 | Supabase: `carbon_stakeholders` (brazil + world) | Import CSV → 100 registros | Alta | ✅ |
| 2 | Supabase: `irec_stakeholders` (brazil + world) | Import CSV → ~68 registros | Alta | ✅ |
| 3 | `src/components/charts/CarbonoBrasilChart.tsx` | Substituir dados hardcoded | Média | ✅ |
| 4 | `src/components/charts/CarbonoMundoChart.tsx` | Substituir dados hardcoded | Média | ✅ |
| 5 | `src/components/charts/IrecBrasilChart.tsx` | Substituir dados hardcoded | Média | ✅ |
| 6 | `src/components/charts/IrecMundoChart.tsx` | Substituir dados hardcoded | Média | ✅ |
| 7 | `dados/dados.json` | Reescrever seções afetadas | Baixa | ✅ |
| 8 | `dados/dados.md` | Reescrever seções + datas | Baixa | ✅ |

> Prioridade: **Alta** = impacto nas páginas de ranking (dados dinâmicos do Supabase). **Média** = charts (dados estáticos, apenas estética). **Baixa** = downloads públicos.

---

## 5. Verificação

Após as alterações:

1. ✅ **Build** → `npm run build` passou sem erros (apenas warnings preexistentes no `rate-limiter.ts`)
2. ⏳ **Verificar ranking pages** → `/carbono/ranking-brasil`, `/carbono/ranking-mundo`, `/energia/ranking-brasil`, `/energia/ranking-mundo`
   - Confirmar 50 registros em cada (após executar migration no Supabase)
   - Confirmar novos valores de volume e delta
3. ✅ **Verificar charts** → Dados substituídos nos 4 componentes, build compilou sem erros
4. ✅ **Verificar dados.json** → `carbonoBrasil` e `carbonoMundo` com 50 empresas; `irecBrasil` com 17 registros válidos
5. ✅ **Verificar dados.md** → Tabelas atualizadas com novos dados e datas 08/06/2026

---

## 6. Observações Importantes

- **Volume 2026 (YTD):** Os novos CSVs incluem dados parciais de 2026. A interface `CarbonStakeholder` já suporta `volume_2026` e a migration já insere estes dados. Pendente: adicionar coluna "2026 YTD" na UI das tabelas de ranking.
- **IRecs - Top 50 Brazil:** Diferentemente do dado atual (focado em compradores), o novo CSV lista **geradores/comercializadores** (AXIA, Voltalia, etc.). O papel (`papel_mercado`) e a abordagem mudaram significativamente — a migration popula `papel_mercado` com estes novos valores. Revisar UI para refletir a mudança de "compradores" para "players do mercado I-REC".
- **IRecs - Top 50 World:** O CSV contém dados em unidades consistentes com a tabela. A migration insere os dados como estão no CSV.
- **Datas de atualização:** Todas as ocorrências de "Última atualização" nos arquivos atualizados refletem 08/06/2026.
