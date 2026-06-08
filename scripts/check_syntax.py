import re
base = r'C:\Users\lc_admin\Documents\Sintropia\sintropia-carbono\src\components\charts'
files = ['CarbonoBrasilChart.tsx', 'CarbonoMundoChart.tsx', 'IrecBrasilChart.tsx', 'IrecMundoChart.tsx']
for fname in files:
    path = f'{base}\\{fname}'
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    issues = []
    for i, line in enumerate(content.split('\n'), 1):
        if re.search(r'\{\{(typeof|view|type|year)', line):
            issues.append(f'Line {i}: {line.strip()[:80]}')
    if issues:
        print(f'{fname}: ISSUES FOUND')
        for i in issues:
            print(f'  {i}')
    else:
        print(f'{fname}: OK')
