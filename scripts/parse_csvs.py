# Script to parse Junho26 CSVs and generate SQL/JSON/data
import csv, json, re, io, sys

CSV_DIR = r"C:\Users\lc_admin\Documents\Sintropia\sintropia-carbono\dados\Junho26"

def parse_brazil_number(s):
    """Parse Brazilian number format: 1.234,56 -> 1234.56 or 611.9 -> 611.9"""
    if not s or s.strip() == '' or s.strip() == 'N/D':
        return None
    s = s.strip().replace(' ', '')
    # Check if it's like "11,9 Mi" -> 11900000
    if 'Mi' in s:
        val = s.replace('Mi', '').strip()
        # Replace comma with dot for decimal
        val = val.replace(',', '.')
        try:
            return float(val) * 1000000
        except:
            return None
    # If has both dots and commas, it's Brazilian with dots as thousands sep
    if '.' in s and ',' in s:
        s = s.replace('.', '').replace(',', '.')
    elif ',' in s and '.' not in s:
        s = s.replace(',', '.')
    try:
        return float(s)
    except:
        return None

def parse_world_number(s):
    """Parse world format numbers. Could be like 22.480.000 (Brazilian) or 5,100,000 (US) or 611.9"""
    if not s or s.strip() == '' or s.strip() == 'N/D':
        return None
    s = s.strip().replace(' ', '')
    # Check if it's Brazilian format (dots as thousands)
    if s.count('.') >= 2 or ('.' in s and ',' not in s and len(s.split('.')[-1]) == 3 and len(s) > 5):
        s = s.replace('.', '')
    s = s.replace(',', '')
    try:
        return float(s)
    except:
        return None

def parse_delta_pct(s):
    """Parse delta percentage. Examples: '-34,53%' -> -34.53, '+64,29%' -> 64.29"""
    if not s or s.strip() == '' or s.strip() == 'N/D':
        return None
    s = s.strip().replace('%', '').replace('+', '').replace(' ', '')
    s = s.replace(',', '.')
    try:
        return float(s)
    except:
        return None

def parse_delta_tco2(s):
    """Parse delta tCO2. Examples: -211.3, +146.000, -400"""
    if not s or s.strip() == '' or s.strip() == 'N/D':
        return None
    s = s.strip().replace('+', '').replace(' ', '')
    # If Brazilian format
    if '.' in s and len(s.split('.')[-1]) == 3:
        s = s.replace('.', '')
    try:
        return float(s)
    except:
        return None

# Parse Carbon - Top 50 Brazil.csv
def parse_carbon_brazil():
    results = []
    with open(f"{CSV_DIR}/Carbon - Top 50 Brazil.csv", encoding='utf-8') as f:
        reader = csv.reader(f)
        for i, row in enumerate(reader):
            if i == 0:
                continue  # header
            if len(row) < 8:
                continue
            rank = row[0].strip()
            if not rank.isdigit():
                continue
            empresa = row[1].strip()
            setor = row[2].strip()
            vol2024 = parse_brazil_number(row[3])
            vol2025 = parse_brazil_number(row[4])
            delta_pct = parse_delta_pct(row[5])
            delta_tco2 = parse_delta_tco2(row[6])
            vol2026 = parse_brazil_number(row[7])
            results.append({
                'rank': int(rank), 'empresa': empresa, 'setor': setor,
                'vol2024': vol2024, 'vol2025': vol2025,
                'delta_pct': delta_pct, 'delta_tco2': delta_tco2,
                'vol2026': vol2026
            })
    return results

# Parse Carbon - Top 50 World.csv
def parse_carbon_world():
    results = []
    with open(f"{CSV_DIR}/Carbon - Top 50 World.csv", encoding='utf-8') as f:
        reader = csv.reader(f)
        for i, row in enumerate(reader):
            if i == 0:
                continue
            if len(row) < 8:
                continue
            rank = row[0].strip()
            if not rank.isdigit():
                continue
            empresa = row[1].strip()
            setor = row[2].strip()
            vol2024 = parse_world_number(row[3])
            vol2025 = parse_world_number(row[4])
            delta_pct = parse_delta_pct(row[5])
            delta_tco2 = parse_delta_tco2(row[6])
            vol2026 = parse_world_number(row[7])
            results.append({
                'rank': int(rank), 'empresa': empresa, 'setor': setor,
                'vol2024': vol2024, 'vol2025': vol2025,
                'delta_pct': delta_pct, 'delta_tco2': delta_tco2,
                'vol2026': vol2026
            })
    return results

# Parse IRecs - Top 50 Brazil.csv
def parse_irec_brazil():
    results = []
    with open(f"{CSV_DIR}/IRecs - Top 50 Brazil.csv", encoding='utf-8') as f:
        reader = csv.reader(f)
        for i, row in enumerate(reader):
            if i == 0:
                continue
            if len(row) < 8:
                continue
            rank = row[0].strip()
            if not rank.isdigit():
                continue
            empresa = row[1].strip()
            site = row[2].strip()
            setor = row[3].strip()
            papel = row[4].strip()
            vol2024 = parse_brazil_number(row[5]) if len(row) > 5 else None
            vol2025 = parse_brazil_number(row[6]) if len(row) > 6 else None
            delta_pct = parse_delta_pct(row[7]) if len(row) > 7 else None
            results.append({
                'rank': int(rank), 'empresa': empresa, 'site': site,
                'setor': setor, 'papel': papel,
                'vol2024': vol2024, 'vol2025': vol2025,
                'delta_pct': delta_pct
            })
    return results

# Parse IRecs - Top 50 World.csv
def parse_irec_world():
    results = []
    with open(f"{CSV_DIR}/IRECs - Top 50 World.csv", encoding='utf-8') as f:
        reader = csv.reader(f)
        for i, row in enumerate(reader):
            if i == 0:
                continue
            if len(row) < 8:
                continue
            rank = row[0].strip()
            if not rank.isdigit():
                continue
            empresa = row[1].strip()
            site = row[2].strip() if len(row) > 2 else ''
            setor = row[3].strip() if len(row) > 3 else ''
            papel = row[4].strip() if len(row) > 4 else ''
            vol2024 = parse_world_number(row[5]) if len(row) > 5 else None
            vol2025 = parse_world_number(row[6]) if len(row) > 6 else None
            delta_pct = parse_delta_pct(row[7]) if len(row) > 7 else None
            results.append({
                'rank': int(rank), 'empresa': empresa, 'site': site,
                'setor': setor, 'papel': papel,
                'vol2024': vol2024, 'vol2025': vol2025,
                'delta_pct': delta_pct
            })
    return results

# Generate SQL
def gen_carbon_sql(data, region, table):
    lines = [f"DELETE FROM public.{table} WHERE region = '{region}';"]
    lines.append(f"INSERT INTO public.{table} (ranking, region, empresa, setor, volume_2024, volume_2025, volume_2026, delta_pct) VALUES")
    vals = []
    for d in data:
        v2024 = d['vol2024'] if d['vol2024'] is not None else 'NULL'
        v2025 = d['vol2025'] if d['vol2025'] is not None else 'NULL'
        v2026 = d['vol2026'] if d['vol2026'] is not None else 'NULL'
        dpct = d['delta_pct'] if d['delta_pct'] is not None else 'NULL'
        vals.append(
            f"({d['rank']}, '{region}', {json.dumps(d['empresa'])}, {json.dumps(d['setor'])}, {v2024}, {v2025}, {v2026}, {dpct})"
        )
    lines.append(",\n".join(vals) + ";")
    return "\n".join(lines)

def gen_irec_sql(data, region):
    lines = [f"DELETE FROM public.irec_stakeholders WHERE region = '{region}';"]
    lines.append("INSERT INTO public.irec_stakeholders (ranking, region, empresa, setor, papel_mercado, volume_2024, volume_2025, delta_pct) VALUES")
    vals = []
    for d in data:
        v2024 = d['vol2024'] if d['vol2024'] is not None else 'NULL'
        v2025 = d['vol2025'] if d['vol2025'] is not None else 'NULL'
        dpct = d['delta_pct'] if d['delta_pct'] is not None else 'NULL'
        vals.append(
            f"({d['rank']}, '{region}', {json.dumps(d['empresa'])}, {json.dumps(d['setor'])}, {json.dumps(d['papel'])}, {v2024}, {v2025}, {dpct})"
        )
    lines.append(",\n".join(vals) + ";")
    return "\n".join(lines)

# Generate dados.json sections
def gen_carbono_json(data, prefix):
    return [{
        'rank': d['rank'],
        'empresa': d['empresa'],
        'setor': d['setor'],
        'vol2024': d['vol2024'],
        'vol2025': d['vol2025'],
        'delta': round(d['delta_pct'], 2) if d['delta_pct'] is not None else None
    } for d in data]

def gen_irec_brasil_json(data):
    return [{
        'rank': d['rank'],
        'empresa': d['empresa'],
        'papel': d['papel'],
        'vol2024': d['vol2024'],
        'vol2025': d['vol2025'],
        'delta': round(d['delta_pct'], 2) if d['delta_pct'] is not None else None
    } for d in data]

# Generate chart data (Top 15 for Brazil Carbon, Top 15 for World Carbon, Top 15 for Irec Brazil, Top 15/25 for Irec World)
def gen_carbon_chart_data(data, n=15):
    top = data[:n]
    labels = [d['empresa'] for d in top]
    vols2024 = [d['vol2024'] if d['vol2024'] is not None else 0 for d in top]
    vols2025 = [d['vol2025'] if d['vol2025'] is not None else 0 for d in top]
    # Sector distribution
    sectors = {}
    for d in top:
        s = d['setor']
        if s not in sectors:
            sectors[s] = {'count': 0, 'total': 0}
        sectors[s]['count'] += 1
        sectors[s]['total'] += (d['vol2025'] or d['vol2024'] or 0)
    # Sort by total volume descending
    sorted_sectors = sorted(sectors.items(), key=lambda x: x[1]['total'], reverse=True)
    sector_names = [s[0] for s in sorted_sectors]
    sector_pcts = [round(s[1]['count'] / len(top) * 100) for s in sorted_sectors]
    return labels, vols2024, vols2025, sector_names, sector_pcts

def gen_irec_brasil_chart_data(data, n=15):
    top = data[:n]
    labels = [d['empresa'] for d in top]
    vols2024 = [d['vol2024'] if d['vol2024'] is not None else 0 for d in top]
    vols2025 = [d['vol2025'] if d['vol2025'] is not None else 0 for d in top]
    # Role distribution
    roles = {}
    for d in top:
        r = d['papel']
        if r not in roles:
            roles[r] = 0
        roles[r] += 1
    sorted_roles = sorted(roles.items(), key=lambda x: x[1], reverse=True)
    role_names = [r[0] for r in sorted_roles]
    role_pcts = [round(r[1] / len(top) * 100) for r in sorted_roles]
    return labels, vols2024, vols2025, role_names, role_pcts

# Main
bra_carbon = parse_carbon_brazil()
world_carbon = parse_carbon_world()
bra_irec = parse_irec_brazil()
world_irec = parse_irec_world()

print("=== CARBON BRAZIL ===")
print(f"Total: {len(bra_carbon)}")
print(json.dumps(bra_carbon[:3], indent=2, ensure_ascii=False))

print("\n=== CARBON WORLD ===")
print(f"Total: {len(world_carbon)}")
print(json.dumps(world_carbon[:3], indent=2, ensure_ascii=False))

print("\n=== IREC BRAZIL ===")
print(f"Total: {len(bra_irec)}")
print(json.dumps(bra_irec[:3], indent=2, ensure_ascii=False))

print("\n=== IREC WORLD ===")
print(f"Total: {len(world_irec)}")
print(json.dumps(world_irec[:3], indent=2, ensure_ascii=False))

# Generate SQL
sql = "-- Migration: Update carbon_stakeholders and irec_stakeholders with Junho 2026 data\n\n"
sql += "-- === CARBON STAKEHOLDERS ===\n\n"
sql += gen_carbon_sql(bra_carbon, 'brazil', 'carbon_stakeholders') + "\n\n"
sql += gen_carbon_sql(world_carbon, 'world', 'carbon_stakeholders') + "\n\n"
sql += "-- === IREC STAKEHOLDERS ===\n\n"
sql += gen_irec_sql(bra_irec, 'brazil') + "\n\n"
sql += gen_irec_sql(world_irec, 'world') + "\n\n"

with open(f"{CSV_DIR}/../generated_migration.sql", 'w', encoding='utf-8') as f:
    f.write(sql)

print("\n\nSQL written to generated_migration.sql")

# Generate dados.json sections
carbono_brasil_json = gen_carbono_json(bra_carbon, 'carbonoBrasil')
carbono_mundo_json = gen_carbono_json(world_carbon, 'carbonoMundo')
irec_brasil_json = gen_irec_brasil_json(bra_irec)

print("\n\n=== JSON SECTIONS ===")
print("carbonoBrasil:", len(carbono_brasil_json))
print(json.dumps(carbono_brasil_json[:2], indent=2, ensure_ascii=False))
print("carbonoMundo:", len(carbono_mundo_json))
print(json.dumps(carbono_mundo_json[:2], indent=2, ensure_ascii=False))
print("irecBrasil:", len(irec_brasil_json))
print(json.dumps(irec_brasil_json[:2], indent=2, ensure_ascii=False))

# Chart data
print("\n\n=== CHART DATA ===")
labels, v24, v25, sectors, dist = gen_carbon_chart_data(bra_carbon, 15)
print("Carbono Brasil Top 15:")
print(f"labels: {labels}")
print(f"vol2024: {[round(v, 2) for v in v24]}")
print(f"vol2025: {[round(v, 2) for v in v25]}")
print(f"sectors: {sectors}")
print(f"distribution: {dist}")

labels, v24, v25, sectors, dist = gen_carbon_chart_data(world_carbon, 15)
print("\nCarbono Mundo Top 15:")
print(f"labels: {labels}")
print(f"vol2024: {[round(v, 2) for v in v24]}")
print(f"vol2025: {[round(v, 2) for v in v25]}")
print(f"sectors: {sectors}")
print(f"distribution: {dist}")

labels, v24, v25, sectors, dist = gen_irec_brasil_chart_data(bra_irec, 15)
print("\nIREC Brasil Top 15:")
print(f"labels: {labels}")
print(f"vol2024: {v24}")
print(f"vol2025: {v25}")
print(f"roles: {sectors}")
print(f"distribution: {dist}")

labels, v24, v25, sectors, dist = gen_irec_brasil_chart_data(world_irec, 25)  # Use 25 for world
print("\nIREC Mundo Top 25:")
print(f"labels: {labels}")
print(f"vol2024: {v24}")
print(f"vol2025: {v25}")
print(f"sectors: {sectors}")
print(f"distribution: {dist}")

# Generate markdown tables
def gen_md_table_carbon(data, title):
    lines = [f"## {title}"]
    lines.append("")
    lines.append("| Rank | Empresa | Setor | Volume 2024 (tCO2e) | Volume 2025 (tCO2e) | Delta (%) | Delta (tCO2e) |")
    lines.append("|------|---------|-------|---------------------|---------------------|-----------|---------------|")
    for d in data:
        v24 = f"{d['vol2024']:,.0f}" if d['vol2024'] else "N/D"
        v25 = f"{d['vol2025']:,.0f}" if d['vol2025'] else "N/D"
        dp = f"{d['delta_pct']:+.2f}%" if d['delta_pct'] else "N/D"
        dt = f"{d['delta_tco2']:+,.0f}" if d.get('delta_tco2') else "N/D"
        lines.append(f"| {d['rank']} | {d['empresa']} | {d['setor']} | {v24} | {v25} | {dp} | {dt} |")
    return "\n".join(lines)

print("\n\n=== MARKDOWN TABLES ===")
print(gen_md_table_carbon(bra_carbon, "Mercado Brasileiro Compradores de Carbono por Setor (Top 50)"))
