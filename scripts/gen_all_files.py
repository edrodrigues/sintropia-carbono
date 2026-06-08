# Script to generate ALL updated files for the Junho 2026 data update
import csv, json, re, io, sys, os

CSV_DIR = r"C:\Users\lc_admin\Documents\Sintropia\sintropia-carbono\dados\Junho26"
BASE = r"C:\Users\lc_admin\Documents\Sintropia\sintropia-carbono"

def parse_brazil_number(s):
    if not s or s.strip() == '' or s.strip() == 'N/D': return None
    s = s.strip().replace(' ', '')
    if 'Mi' in s:
        val = s.replace('Mi', '').strip().replace(',', '.')
        try: return float(val) * 1000000
        except: return None
    s = s.replace(',', '.')
    try: return float(s)
    except: return None

def parse_delta_tco2_br(s):
    """Parse delta tCO2 for Brazil CSV. Format: 146.000 -> 146000 (thousands separator)"""
    if not s or s.strip() == '' or s.strip() == 'N/D': return None
    s = s.strip().replace('+', '').replace(' ', '')
    if '.' in s:
        parts = s.split('.')
        if all(len(p) == 3 for p in parts[1:]):
            s = s.replace('.', '')
        else:
            try: return float(s)
            except: return None
    try: return float(s)
    except: return None

def parse_delta_tco2_world(s):
    """Parse delta tCO2 for World CSV. -400 -> -400000 (thousands), +290.000 -> 290000"""
    if not s or s.strip() == '' or s.strip() == 'N/D': return None
    s = s.strip().replace('+', '').replace(' ', '')
    has_dots = '.' in s
    if '.' in s:
        parts = s.split('.')
        if all(len(p) == 3 for p in parts[1:]):
            s = s.replace('.', '')
        else:
            try: return float(s)
            except: return None
    try:
        val = float(s)
        # Values without dots are in thousands
        if not has_dots:
            val *= 1000
        return val
    except: return None

def parse_world_number(s):
    if not s or s.strip() == '' or s.strip() == 'N/D': return None
    s = s.strip().replace(' ', '')
    has_dots = '.' in s
    # Brazilian format: 22.480.000 -> 22480000
    if s.count('.') >= 2 or ('.' in s and len(s.split('.')[-1]) == 3 and len(s) > 5 and s.split('.')[-1].isdigit()):
        s = s.replace('.', '')
    s = s.replace(',', '')
    try:
        val = float(s)
        # Values without dots are in thousands
        if not has_dots:
            val *= 1000
        return val
    except: return None

def parse_irec_world_number(s):
    """Parse IREC World CSV numbers. All values in millions of MWh, convert to MWh * 1e6"""
    if not s or s.strip() == '' or s.strip() == 'N/D': return None
    s = s.strip().replace(' ', '').replace(',', '')
    try:
        val = float(s)
        # IREC World is in millions of MWh → convert to MWh (round to avoid float issues)
        val = round(val * 1000000)
        return val
    except: return None

def parse_delta_pct(s):
    if not s or s.strip() == '' or s.strip() == 'N/D': return None
    s = s.strip().replace('%', '').replace('+', '').replace(' ', '').replace(',', '.')
    try: return float(s)
    except: return None

def parse_carbon_brazil():
    results = []
    with open(f"{CSV_DIR}/Carbon - Top 50 Brazil.csv", encoding='utf-8') as f:
        reader = csv.reader(f)
        for i, row in enumerate(reader):
            if i == 0 or len(row) < 8: continue
            rank = row[0].strip()
            if not rank.isdigit(): continue
            # Volume is in thousands of tCO2e -> multiply by 1000 for actual tCO2e
            v2024_k = parse_brazil_number(row[3])
            v2025_k = parse_brazil_number(row[4])
            v2026_k = parse_brazil_number(row[7])
            results.append({
                'rank': int(rank), 'empresa': row[1].strip(), 'setor': row[2].strip(),
                'vol2024': (v2024_k * 1000) if v2024_k else None,
                'vol2025': (v2025_k * 1000) if v2025_k else None,
                'delta_pct': parse_delta_pct(row[5]),
                'delta_tco2': parse_delta_tco2_br(row[6]),
                'vol2026': (v2026_k * 1000) if v2026_k else None
            })
    return results

def parse_carbon_world():
    results = []
    with open(f"{CSV_DIR}/Carbon - Top 50 World.csv", encoding='utf-8') as f:
        reader = csv.reader(f)
        for i, row in enumerate(reader):
            if i == 0 or len(row) < 8: continue
            rank = row[0].strip()
            if not rank.isdigit(): continue
            results.append({
                'rank': int(rank), 'empresa': row[1].strip(), 'setor': row[2].strip(),
                'vol2024': parse_world_number(row[3]),
                'vol2025': parse_world_number(row[4]),
                'delta_pct': parse_delta_pct(row[5]),
                'delta_tco2': parse_delta_tco2_world(row[6]),
                'vol2026': parse_world_number(row[7])
            })
    return results

def parse_irec_brazil():
    results = []
    with open(f"{CSV_DIR}/IRecs - Top 50 Brazil.csv", encoding='utf-8') as f:
        reader = csv.reader(f)
        for i, row in enumerate(reader):
            if i == 0 or len(row) < 8: continue
            rank = row[0].strip()
            if not rank.isdigit(): continue
            v2024 = parse_brazil_number(row[5]) if len(row) > 5 else None
            v2025 = parse_brazil_number(row[6]) if len(row) > 6 else None
            results.append({
                'rank': int(rank), 'empresa': row[1].strip(), 'site': row[2].strip() if len(row) > 2 else '',
                'setor': row[3].strip() if len(row) > 3 else '', 'papel': row[4].strip() if len(row) > 4 else '',
                'vol2024': v2024, 'vol2025': v2025, 'delta_pct': parse_delta_pct(row[7]) if len(row) > 7 else None
            })
    return results

def parse_irec_world():
    results = []
    with open(f"{CSV_DIR}/IRECs - Top 50 World.csv", encoding='utf-8') as f:
        reader = csv.reader(f)
        for i, row in enumerate(reader):
            if i == 0 or len(row) < 8: continue
            rank = row[0].strip()
            if not rank.isdigit(): continue
            results.append({
                'rank': int(rank), 'empresa': row[1].strip(), 'site': row[2].strip() if len(row) > 2 else '',
                'setor': row[3].strip() if len(row) > 3 else '', 'papel': row[4].strip() if len(row) > 4 else '',
                'vol2024': parse_irec_world_number(row[5]) if len(row) > 5 else None,
                'vol2025': parse_irec_world_number(row[6]) if len(row) > 6 else None,
                'delta_pct': parse_delta_pct(row[7]) if len(row) > 7 else None
            })
    return results

bra_carbon = parse_carbon_brazil()
world_carbon = parse_carbon_world()
bra_irec = parse_irec_brazil()
world_irec = parse_irec_world()

print(f"Parsed: carbon_br={len(bra_carbon)}, carbon_world={len(world_carbon)}, irec_br={len(bra_irec)}, irec_world={len(world_irec)}")

# ============================================================
# 1. GENERATE SQL MIGRATION
# ============================================================
def sql_val(v):
    if v is None: return 'NULL'
    if isinstance(v, float) and v == int(v):
        return str(int(v))
    return str(v)

def sql_str(s):
    if s is None: return 'NULL'
    esc = s.replace("'", "''")
    return f"'{esc}'"

sql = """-- Migration: Atualizar dados carbon_stakeholders e irec_stakeholders — Junho 2026
-- Gerado em: 08/06/2026

-- Adicionar coluna delta_num à carbon_stakeholders se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'carbon_stakeholders' AND column_name = 'delta_num'
    ) THEN
        ALTER TABLE public.carbon_stakeholders ADD COLUMN delta_num BIGINT;
    END IF;
END $$;

-- Limpar dados existentes
DELETE FROM public.carbon_stakeholders WHERE region IN ('brazil', 'world');
DELETE FROM public.irec_stakeholders WHERE region IN ('brazil', 'world');

-- ============ CARBON STAKEHOLDERS - BRAZIL ============
INSERT INTO public.carbon_stakeholders (ranking, region, empresa, setor, volume_2024, volume_2025, volume_2026, delta_pct, delta_num) VALUES
"""

vals = []
for d in bra_carbon:
    vals.append(
        f"({d['rank']}, 'brazil', {sql_str(d['empresa'])}, {sql_str(d['setor'])}, "
        f"{sql_val(d['vol2024'])}, {sql_val(d['vol2025'])}, {sql_val(d['vol2026'])}, "
        f"{sql_val(d['delta_pct'])}, {sql_val(d['delta_tco2'])})"
    )
sql += ",\n".join(vals) + ";\n\n"

sql += "-- ============ CARBON STAKEHOLDERS - WORLD ============\n"
sql += "INSERT INTO public.carbon_stakeholders (ranking, region, empresa, setor, volume_2024, volume_2025, volume_2026, delta_pct, delta_num) VALUES\n"
vals = []
for d in world_carbon:
    vals.append(
        f"({d['rank']}, 'world', {sql_str(d['empresa'])}, {sql_str(d['setor'])}, "
        f"{sql_val(d['vol2024'])}, {sql_val(d['vol2025'])}, {sql_val(d['vol2026'])}, "
        f"{sql_val(d['delta_pct'])}, {sql_val(d['delta_tco2'])})"
    )
sql += ",\n".join(vals) + ";\n\n"

sql += "-- ============ IREC STAKEHOLDERS - BRAZIL ============\n"
sql += "INSERT INTO public.irec_stakeholders (ranking, region, empresa, setor, papel_mercado, volume_2024, volume_2025, delta_pct) VALUES\n"
vals = []
for d in bra_irec:
    vals.append(
        f"({d['rank']}, 'brazil', {sql_str(d['empresa'])}, {sql_str(d['setor'])}, {sql_str(d['papel'])}, "
        f"{sql_val(d['vol2024'])}, {sql_val(d['vol2025'])}, {sql_val(d['delta_pct'])})"
    )
sql += ",\n".join(vals) + ";\n\n"

sql += "-- ============ IREC STAKEHOLDERS - WORLD ============\n"
sql += "INSERT INTO public.irec_stakeholders (ranking, region, empresa, setor, papel_mercado, volume_2024, volume_2025, delta_pct) VALUES\n"
vals = []
for d in world_irec:
    vals.append(
        f"({d['rank']}, 'world', {sql_str(d['empresa'])}, {sql_str(d['setor'])}, {sql_str(d['papel'])}, "
        f"{sql_val(d['vol2024'])}, {sql_val(d['vol2025'])}, {sql_val(d['delta_pct'])})"
    )
sql += ",\n".join(vals) + ";\n"

mig_path = os.path.join(BASE, "supabase", "migrations", "20260608000001_update_stakeholders_data.sql")
with open(mig_path, 'w', encoding='utf-8') as f:
    f.write(sql)
print(f"[OK] SQL migration written: {mig_path}")

# ============================================================
# 2. GENERATE CHART COMPONENT DATA
# ============================================================
def gen_chart_brazil_carbon():
    """Top 15 for CarbonoBrasilChart"""
    top = bra_carbon[:15]
    labels = []
    vols2024_m = []
    vols2025_m = []
    # Use short company names for chart
    name_map = {
        'Natura Cosméticos SA': 'Natura', 'Petrobras': 'Petrobras',
        'Localiza Rent a Car': 'Localiza', 'Vale S.A.': 'Vale',
        'Suzano S.A.': 'Suzano', 'Klabin S.A.': 'Klabin',
        'JBS S.A.': 'JBS', 'Raízen S.A.': 'Raízen',
        'Ambev S.A.': 'Ambev', 'Itaú Unibanco': 'Itaú',
        'Banco Bradesco': 'Bradesco', 'Gerdau S.A.': 'Gerdau',
        'Engie Brasil': 'Engie Brasil', 'Marfrig Global Foods': 'Marfrig',
        'Cosan S.A.': 'Cosan', 'Eletrobras': 'Eletrobras',
        'Auren Energia': 'Auren Energia', 'Ambipar Group': 'Ambipar',
        'Telefônica Brasil (Vivo)': 'Vivo', 'Banco do Brasil': 'BB',
    }
    for d in top:
        n = d['empresa']
        labels.append(name_map.get(n, n.split(' S.A.')[0].split(' SA')[0].split(' S/A')[0]))
        # Convert to millions for chart display
        vols2024_m.append(round((d['vol2024'] or 0) / 1000000, 2))
        vols2025_m.append(round((d['vol2025'] or 0) / 1000000, 2))
    # Sector distribution
    sectors = {}
    for d in top:
        s = d['setor']
        if s not in sectors: sectors[s] = {'count': 0, 'total': 0}
        sectors[s]['count'] += 1
        sectors[s]['total'] += (d['vol2025'] or d['vol2024'] or 0)
    sorted_s = sorted(sectors.items(), key=lambda x: x[1]['total'], reverse=True)
    sector_names = [s[0] for s in sorted_s]
    sector_pcts = [max(1, round(s[1]['count'] / len(top) * 100)) for s in sorted_s]
    # Adjust to sum to 100
    total = sum(sector_pcts)
    if total != 100 and sector_pcts:
        sector_pcts[-1] += (100 - total)
    return labels, vols2024_m, vols2025_m, sector_names, sector_pcts

def gen_chart_world_carbon():
    top = world_carbon[:15]
    labels = []
    vols2024_m = []
    vols2025_m = []
    for d in top:
        labels.append(d['empresa'])
        vols2024_m.append(round((d['vol2024'] or 0) / 1000000, 2))
        vols2025_m.append(round((d['vol2025'] or 0) / 1000000, 2))
    sectors = {}
    for d in top:
        s = d['setor']
        if s not in sectors: sectors[s] = {'count': 0, 'total': 0}
        sectors[s]['count'] += 1
        sectors[s]['total'] += (d['vol2025'] or d['vol2024'] or 0)
    sorted_s = sorted(sectors.items(), key=lambda x: x[1]['total'], reverse=True)
    sector_names = [s[0] for s in sorted_s]
    sector_pcts = [max(1, round(s[1]['count'] / len(top) * 100)) for s in sorted_s]
    total = sum(sector_pcts)
    if total != 100 and sector_pcts:
        sector_pcts[-1] += (100 - total)
    return labels, vols2024_m, vols2025_m, sector_names, sector_pcts

def gen_chart_irec_brazil():
    top = bra_irec[:15]
    labels = [d['empresa'] for d in top]
    vols2024 = [round((d['vol2024'] or 0) / 1000000, 2) for d in top]
    vols2025 = [round((d['vol2025'] or 0) / 1000000, 2) for d in top]
    roles = {}
    for d in top:
        r = d['papel']
        if r not in roles: roles[r] = 0
        roles[r] += 1
    sorted_r = sorted(roles.items(), key=lambda x: x[1], reverse=True)
    role_names = [r[0] for r in sorted_r]
    role_pcts = [max(1, round(r[1] / len(top) * 100)) for r in sorted_r]
    total = sum(role_pcts)
    if total != 100 and role_pcts:
        role_pcts[-1] += (100 - total)
    return labels, vols2024, vols2025, role_names, role_pcts

def gen_chart_irec_world():
    top = world_irec[:25]
    labels = [d['empresa'] for d in top]
    # Values in MWh, chart displays in millions
    vols2024 = [round((d['vol2024'] or 0) / 1000000, 2) for d in top]
    vols2025 = [round((d['vol2025'] or 0) / 1000000, 2) for d in top]
    sectors = {}
    for d in top:
        s = d['setor']
        if s not in sectors: sectors[s] = {'count': 0, 'total': 0}
        sectors[s]['count'] += 1
        sectors[s]['total'] += (d['vol2025'] or d['vol2024'] or 0)
    sorted_s = sorted(sectors.items(), key=lambda x: x[1]['total'], reverse=True)
    sector_names = [s[0] for s in sorted_s]
    sector_pcts = [max(1, round(s[1]['count'] / len(top) * 100)) for s in sorted_s]
    total = sum(sector_pcts)
    if total != 100 and sector_pcts:
        sector_pcts[-1] += (100 - total)
    return labels, vols2024, vols2025, sector_names, sector_pcts

# Generate chart data
cbl, cbv24, cbv25, cbs, cbd = gen_chart_brazil_carbon()
cwl, cwv24, cwv25, cws, cwd = gen_chart_world_carbon()
ibl, ibv24, ibv25, ibs, ibd = gen_chart_irec_brazil()
iwl, iwv24, iwv25, iws, iwd = gen_chart_irec_world()

print(f"\nChart data generated:")
print(f"  CarbonoBrasil: {len(cbl)} labels, {len(cbs)} sectors")
print(f"  CarbonoMundo: {len(cwl)} labels, {len(cws)} sectors")
print(f"  IrecBrasil: {len(ibl)} labels, {len(ibs)} roles")
print(f"  IrecMundo: {len(iwl)} labels, {len(iws)} sectors")

# Function to write a chart file
def write_chart_file(filename, title, labels_arr, v24_arr, v25_arr, sectors_arr, dist_arr, sector_colors, unit_title="Milhões tCO2e"):
    labels_str = json.dumps(labels_arr, ensure_ascii=False, indent=2)
    v24_str = json.dumps(v24_arr, indent=2)
    v25_str = json.dumps(v25_arr, indent=2)
    sectors_str = json.dumps(sectors_arr, ensure_ascii=False, indent=2)
    dist_str = json.dumps(dist_arr, indent=2)
    colors_str = json.dumps(sector_colors, indent=2)
    
    content = f'''"use client";

import {{ useState }} from "react";
import {{ Card, Title, BarChart, DonutChart }} from "@/components/ui/tremor";

const fullChartData = {{
  labels: {labels_str},
  volumes2024: {v24_str},
  volumes2025: {v25_str},
  sectors: {sectors_str},
  sectorDistribution: {dist_str},
}};

const sectorColors = {colors_str};

export function {title}() {{
  const [view, setView] = useState<"top10" | "top25">("top25");
  const [type, setType] = useState<"bar" | "pie">("bar");
  const [year, setYear] = useState<"2024" | "2025">("2024");

  const limit = view === "top10" ? 10 : {len(labels_arr)};

  const barData = fullChartData.labels
    .slice(0, limit)
    .map((label, i) => ({{
      name: label,
      value: year === "2024" ? fullChartData.volumes2024[i] : fullChartData.volumes2025[i],
    }}));

  const sectorData = fullChartData.sectors.map((sector, i) => ({{
    name: sector,
    value: fullChartData.sectorDistribution[i],
    color: sectorColors[i],
  }}));

  return (
    <Card>
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 md:mb-0">
          Visualizações de Dados
        </h3>
        <div className="flex flex-col md:flex-row gap-2">
          <div className="flex gap-2 mb-2 md:mb-0">
            <button
              onClick={{() => setView("top10")}}
              className={{`px-4 py-2 rounded-lg font-semibold transition-colors ${{view === "top10"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
              }}`}}
            >
              Top 10
            </button>
            <button
              onClick={{() => setView("top25")}}
              className={{`px-4 py-2 rounded-lg font-semibold transition-colors ${{view === "top25"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
              }}`}}
            >
              Top {len(labels_arr)}
            </button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={{() => setType("bar")}}
              className={{`px-4 py-2 rounded-lg font-semibold transition-colors ${{type === "bar"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
              }}`}}
            >
              📊 Barras
            </button>
            <button
              onClick={{() => setType("pie")}}
              className={{`px-4 py-2 rounded-lg font-semibold transition-colors ${{type === "pie"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
              }}`}}
            >
              🍕 Setores
            </button>
          </div>
        </div>
      </div>

      {{type === "bar" && (
        <div className="flex gap-2 mb-4">
          <button
            onClick={{() => setYear("2024")}}
            className={{`px-4 py-2 rounded-lg font-semibold transition-colors ${{year === "2024"
              ? "bg-slate-600 text-white"
              : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
            }}`}}
          >
            2024
          </button>
          <button
            onClick={{() => setYear("2025")}}
            className={{`px-4 py-2 rounded-lg font-semibold transition-colors ${{year === "2025"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
            }}`}}
          >
            2025
          </button>
        </div>
      )}}

      <div className="relative h-[400px]">
        {{type === "bar"
          ? (
              <>
                <Title className="text-center mb-4">Comparação de Volumes ({unit_title})</Title>
                <BarChart data={{barData}} className="h-[320px]" />
              </>
            )
          : (
              <>
                <Title className="text-center mb-4">Distribuição (%)</Title>
                <DonutChart data={{sectorData}} className="h-[320px]" />
              </>
            )}}
      </div>
    </Card>
  );
}}
'''
    return content

# Write chart files
charts = {
    'CarbonoBrasilChart.tsx': ('CarbonoBrasilChart', cbl, cbv24, cbv25, cbs, cbd,
        ["#1e3a8a","#166534","#92400e","#52525b","#0891b2","#dc2626","#ea580c","#65a30d","#3f3f46","#ec4899","#db2777","#d97706","#06b6d4","#7c3aed"],
        "Milhões tCO2e"),
    'CarbonoMundoChart.tsx': ('CarbonoMundoChart', cwl, cwv24, cwv25, cws, cwd,
        ["#166534","#2563eb","#7c3aed","#1e40af","#6b7280","#0891b2","#dc2626"],
        "Milhões tCO2e"),
    'IrecBrasilChart.tsx': ('IrecBrasilChart', ibl, ibv24, ibv25, ibs, ibd,
        ["#16a34a","#2563eb","#9333ea","#d97706","#dc2626"],
        "Milhões"),
    'IrecMundoChart.tsx': ('IrecMundoChart', iwl, iwv24, iwv25, iws, iwd,
        ["#2563eb","#16a34a","#d97706","#dc2626","#9333ea","#0891b2"],
        "Milhões"),
}

for fname, (comp, labs, v24, v25, sec, dist, colors, unit) in charts.items():
    path = os.path.join(BASE, "src", "components", "charts", fname)
    content = write_chart_file(fname.replace('.tsx',''), comp, labs, v24, v25, sec, dist, colors, unit)
    # Fix template literal syntax for JSX
    content = content.replace('className={{`', 'className={`')
    content = content.replace('}}`}', '}`}')
    content = content.replace('{{type === "bar"', '{type === "bar"')
    content = content.replace('{{view === "top10"', '{view === "top10"')
    content = content.replace('{{year === "2024"', '{year === "2024"')
    content = content.replace('{{year === "2025"', '{year === "2025"')
    content = content.replace('{{type === "pie"', '{type === "pie"')
    content = content.replace('{{view === "top25"', '{view === "top25"')
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"[OK] Chart written: {path}")

# ============================================================
# 3. GENERATE dados.json SECTIONS
# ============================================================
# Read existing dados.json to preserve unchanged sections
with open(os.path.join(BASE, 'dados', 'dados.json'), 'r', encoding='utf-8') as f:
    existing_json = json.load(f)

# Update only the relevant sections
def to_json_val(v):
    if v is None: return None
    if isinstance(v, float) and v == int(v): return int(v)
    return v

existing_json['carbonoBrasil'] = [{
    'rank': d['rank'], 'empresa': d['empresa'], 'setor': d['setor'],
    'vol2024': to_json_val(d['vol2024']), 'vol2025': to_json_val(d['vol2025']),
    'delta': round(d['delta_pct'], 2) if d['delta_pct'] is not None else None
} for d in bra_carbon]

existing_json['carbonoMundo'] = [{
    'rank': d['rank'], 'empresa': d['empresa'], 'setor': d['setor'],
    'vol2024': to_json_val(d['vol2024']), 'vol2025': to_json_val(d['vol2025']),
    'delta': round(d['delta_pct'], 2) if d['delta_pct'] is not None else None
} for d in world_carbon]

existing_json['irecBrasil'] = [{
    'rank': d['rank'], 'empresa': d['empresa'], 'papel': d['papel'],
    'vol2024': to_json_val(d['vol2024']), 'vol2025': to_json_val(d['vol2025']),
    'delta': round(d['delta_pct'], 2) if d['delta_pct'] is not None else None
} for d in bra_irec]

# Save updated dados.json
json_path = os.path.join(BASE, 'dados', 'dados.json')
with open(json_path, 'w', encoding='utf-8') as f:
    json.dump(existing_json, f, indent=2, ensure_ascii=False)
print(f"[OK] dados.json updated: {json_path}")

# Copy to public/
import shutil
public_json = os.path.join(BASE, 'public', 'dados', 'dados.json')
shutil.copy2(json_path, public_json)
print(f"[OK] dados.json copied to public/")

# ============================================================
# 4. GENERATE dados.md SECTIONS
# ============================================================
def fmt_num(n):
    if n is None: return "N/D"
    return f"{n:,.0f}".replace(',', '@').replace('.', ',').replace('@', '.')

def fmt_delta_pct(n):
    if n is None: return "N/D"
    sign = "+" if n >= 0 else ""
    return f"{sign}{n:.2f}%".replace('.', ',')

def fmt_delta_tco2(n):
    if n is None: return "N/D"
    sign = "+" if n >= 0 else ""
    return f"{sign}{n:,.0f}".replace(',', '@').replace('.', ',').replace('@', '.')

# Carbon Brazil table
md_lines = []
md_lines.append("# Dados do Mercado de Créditos de Carbono")
md_lines.append("")
md_lines.append("## Certificadoras e Padrões de Carbono")
md_lines.append("")
md_lines.append('Tabela consolidada das principais certificadoras globais e nacionais, com seus volumes certificados e áreas de foco.')
md_lines.append("")
md_lines.append("| Certificadora | Sede / Região | Foco Principal | Unidade | Volume Total Certificado |")
md_lines.append("|--------------|---------------|----------------|---------|-------------------------|")
md_lines.append("| [Verra (VCS)](https://verra.org) | Global (EUA) | REDD+, Florestas, Indústria | tCO2e | 1.1 Bilhão |")
md_lines.append("| [Gold Standard](https://goldstandard.org) | Global (Suíça) | Energia, Água, ODS | tCO2e | 245 Milhões |")
md_lines.append("| [RenovaBio](https://www.gov.br/anp/pt-br/assuntos/renovaBio) | Brasil | Biocombustíveis | CBIO | 135 Milhões |")
md_lines.append("| [ACR](https://americancarbonregistry.org) | Global (EUA) | Manejo Florestal, Metano | tCO2e | 250 Milhões |")
md_lines.append("| [CAR](https://climateactionreserve.org) | Global (EUA) | Aterros, Agro, IFM | tCO2e | 195 Milhões |")
md_lines.append("| [ART / TREES](https://artredd.org) | Jurisdicional | REDD+ em escala estatal | tCO2e | 45 Milhões |")
md_lines.append("| [GCC](https://globalcarboncouncil.com) | Global (Catar) | Energia Renovável | tCO2e | 20 Milhões |")
md_lines.append("")
md_lines.append("### Legenda")
md_lines.append("")
md_lines.append("- **tCO2e**: Toneladas de CO2 equivalente")
md_lines.append("- **CBIO**: Crédito de Descarbonização (unidade do RenovaBio)")
md_lines.append("- **REDD+**: Redução de Emissões por Desmatamento e Degradação Florestal")
md_lines.append("- **ODS**: Objetivos de Desenvolvimento Sustentável")
md_lines.append("- **IFM**: Manejo Florestal Intensivo")
md_lines.append("")
md_lines.append("### 10 Maiores Padrões de Certificação de Energia Renovável")
md_lines.append("")
md_lines.append("| Nome do Padrão | Site Oficial | País/Região | Metodologia Principal | Volume 2024 | Volume 2025 | Atributos e Diferenciais |")
md_lines.append("|--------------|-------------|-------------|----------------------|-------------|-------------|------------------------|")
md_lines.append("| I-REC (International REC) | [trackingstandard.org](https://trackingstandard.org) | Países Baixos (Global) | Book-and-Claim (I-TRACK Foundation) | 283.000.000 MWh | Parcial (ex.: 54M no Brasil até meados) | Padrão global para mercados voluntários; adotado em mais de 50 países; alta transparência. |")
md_lines.append("| Guarantees of Origin (GO) | [aib-net.org](https://aib-net.org) | União Europeia (AIB) | European Energy Certificate System (EECS) | 1.084.000.000 MWh | Não disponível | Instrumento regulado pela UE; obrigatório para divulgação do mix energético dos fornecedores. |")
md_lines.append("| Green-e Energy | [green-e.org](https://green-e.org) | EUA e Canadá | Certificação de Varejo e Auditoria de Transação | 143.576.000 MWh | Não disponível | Foco em proteção ao consumidor e critérios rigorosos de adicionalidade para novos projetos. |")
md_lines.append("| TIGR (Tradable Instrument for Global Renewables) | [apx.com](https://apx.com) | EUA (Global) | Registro Digital (APX/Xpansiv) | ~9.870.000 MWh (2023) | Não disponível | Plataforma tecnológica integrada; forte em mercados do sudeste asiático e América Central. |")
md_lines.append("| REC Brazil | [irec-brazil.org](https://irec-brazil.org) | Brasil | I-REC + Adicionalidade Social e Ambiental (SDGs) | Parcial (ex.: 1,4M por uma empresa) | Não disponível | Chancela brasileira gerida pelo Instituto Totum; exige alinhamento com 5 dos 17 ODS da ONU. |")
md_lines.append("| LGC (Large-scale Generation Certificates) | [cer.gov.au](https://cer.gov.au) | Austrália | Large-scale Renewable Energy Target (LRET) | 51.500.000 MWh | Projeção: 54-57M MWh | Sistema de conformidade legal com transição para rastreamento horário (REGO) em 2025. |")
md_lines.append("| Non-Fossil Certificates (NFC) | [jepx.org](https://jepx.org) | Japão | Non-Fossil Value Trading Market (JEPX) | Parcial (~15.343 GWh em uma rodada FY2024) | Não disponível | Segmentado entre fontes FIT e não-FIT; inclui nuclear como fonte não-fóssil. |")
md_lines.append("| UK REGO | [ofgem.gov.uk](https://ofgem.gov.uk) | Reino Unido | Fuel Mix Disclosure (Ofgem) | ~40.100.000 MWh (estimativa ROCs) | Não disponível | Específico para o mercado britânico; essencial para conformidade com o reporte de emissões do governo. |")
md_lines.append("| EKOenergy | [ekoenergy.org](https://ekoenergy.org) | Finlândia (Global) | Selo de Qualidade e Critérios de Biodiversidade | Record (volume exato não especificado) | Não disponível | Ecolabel independente; exige sustentabilidade além da fonte (impacto em aves, peixes e ecossistemas). |")
md_lines.append("| Gold Standard Renewable Energy Label | [goldstandard.org](https://goldstandard.org) | Suíça (Global) | GS4GG (Global Goals for Sustainable Development) | Não disponível | Não disponível | Aplicado sobre RECs para garantir integridade ambiental; foco em alta qualidade e benefícios sociais diretos. |")
md_lines.append("")
md_lines.append("")
md_lines.append("### Fonte e Última atualização")
md_lines.append("Fonte: Dados compilados através do Gemini Thinking com Deep Research habilitado em 08/06/2026")
md_lines.append("")
md_lines.append("---")
md_lines.append("")

# Carbon Brazil table
md_lines.append(f"## Mercado Brasileiro Compradores de Carbono por Setor (Top {len(bra_carbon)})")
md_lines.append("")
md_lines.append("Ranking das principais empresas brasileiras por setor de atuação no mercado de créditos de carbono.")
md_lines.append("")
md_lines.append("| Rank | Empresa | Setor | Volume 2024 (tCO2e) | Volume 2025 (tCO2e) | Delta (%) | Delta (tCO2e) |")
md_lines.append("|------|---------|-------|---------------------|---------------------|-----------|---------------|")
for d in bra_carbon:
    md_lines.append(f"| {d['rank']} | {d['empresa']} | {d['setor']} | {fmt_num(d['vol2024'])} | {fmt_num(d['vol2025'])} | {fmt_delta_pct(d['delta_pct'])} | {fmt_delta_tco2(d['delta_tco2'])} |")
md_lines.append("")
md_lines.append("### Setores Representados")
md_lines.append("")
sector_counts = {}
for d in bra_carbon:
    s = d['setor']
    sector_counts[s] = sector_counts.get(s, 0) + 1
for s, c in sorted(sector_counts.items(), key=lambda x: -x[1]):
    md_lines.append(f"- **{s}**: {c} empresas")
md_lines.append("")
md_lines.append(f"**Total de setores**: {len(sector_counts)} setores representados")
md_lines.append("")
md_lines.append("### Fonte e Última atualização")
md_lines.append("Fonte: Dados compilados através do Gemini Thinking com Deep Research habilitado em 08/06/2026")
md_lines.append("")

# IREC Brazil table - only valid (non-null) entries
valid_irec_br = [d for d in bra_irec if d['vol2024'] is not None or d['vol2025'] is not None]
md_lines.append(f"## Mercado Brasileiro de certificados I-REC (Top {len(valid_irec_br)})")
md_lines.append("")
md_lines.append("Ranking das principais empresas do mercado I-REC brasileiro, incluindo geradores, comercializadores e compradores.")
md_lines.append("")
md_lines.append("| Rank | Empresa | Setor | Papel no Mercado | Volume 2024 (MWh) | Volume 2025 (MWh) | Δ% |")
md_lines.append("|------|---------|-------|-----------------|-------------------|-------------------|---|")
for d in valid_irec_br:
    md_lines.append(f"| {d['rank']} | {d['empresa']} | {d['setor']} | {d['papel']} | {fmt_num(d['vol2024'])} | {fmt_num(d['vol2025'])} | {fmt_delta_pct(d['delta_pct'])} |")
md_lines.append("")
md_lines.append("### Fonte e Última atualização")
md_lines.append("Fonte: Dados compilados através do Gemini Thinking com Deep Research habilitado em 08/06/2026")
md_lines.append("")

# Carbon World table
md_lines.append(f"## Compradores de Carbono (Mundo) - Top {len(world_carbon)}")
md_lines.append("")
md_lines.append("| Rank | Empresa | Setor | Volume 2024 (tCO2e) | Volume 2025 (tCO2e) | Delta (%) | Delta (tCO2e) |")
md_lines.append("|------|---------|-------|---------------------|---------------------|-----------|---------------|")
for d in world_carbon:
    md_lines.append(f"| {d['rank']} | {d['empresa']} | {d['setor']} | {fmt_num(d['vol2024'])} | {fmt_num(d['vol2025'])} | {fmt_delta_pct(d['delta_pct'])} | {fmt_delta_tco2(d['delta_tco2'])} |")
md_lines.append("")
md_lines.append("### Fonte e Última atualização")
md_lines.append("Fonte: Dados compilados através do Gemini Thinking com Deep Research habilitado em 08/06/2026")
md_lines.append("")

# IREC World table
md_lines.append(f"## Maiores Players I-REC (Mundo) - Top {len(world_irec)}")
md_lines.append("")
md_lines.append("| Rank | Empresa | Setor | Papel | Volume 2024 | Volume 2025 | Δ% |")
md_lines.append("|------|---------|-------|-------|-------------|-------------|----|")
for d in world_irec:
    md_lines.append(f"| {d['rank']} | {d['empresa']} | {d['setor']} | {d['papel']} | {fmt_num(d['vol2024'])} | {fmt_num(d['vol2025'])} | {fmt_delta_pct(d['delta_pct'])} |")
md_lines.append("")
md_lines.append("### Fonte e Última atualização")
md_lines.append("Fonte: Dados compilados através do Gemini Thinking com Deep Research habilitado em 08/06/2026")

md_path = os.path.join(BASE, 'dados', 'dados.md')
with open(md_path, 'w', encoding='utf-8') as f:
    f.write('\n'.join(md_lines))
print(f"[OK] dados.md updated: {md_path}")

print("\n[DONE] ALL FILES GENERATED SUCCESSFULLY!")
