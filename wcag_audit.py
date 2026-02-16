#!/usr/bin/env python3
"""
WCAG AA Contrast Compliance Audit for Sintropia Carbono HTML files
Checks all color combinations used across 6 HTML pages in both light and dark modes
"""

def hex_to_rgb(hex_color):
    """Convert hex color to RGB tuple"""
    hex_color = hex_color.lstrip('#')
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))

def relative_luminance(rgb):
    """Calculate relative luminance of an RGB color"""
    def normalize(c):
        c = c / 255.0
        if c <= 0.03928:
            return c / 12.92
        else:
            return pow((c + 0.055) / 1.055, 2.4)
    
    r, g, b = rgb
    return 0.2126 * normalize(r) + 0.7152 * normalize(g) + 0.0722 * normalize(b)

def contrast_ratio(color1, color2):
    """Calculate contrast ratio between two colors"""
    l1 = relative_luminance(hex_to_rgb(color1))
    l2 = relative_luminance(hex_to_rgb(color2))
    
    lighter = max(l1, l2)
    darker = min(l1, l2)
    
    return (lighter + 0.05) / (darker + 0.05)

def check_wcag_aa(ratio, is_large_text=False):
    """Check if contrast ratio meets WCAG AA standards"""
    if is_large_text:
        return ratio >= 3.0
    else:
        return ratio >= 4.5

def format_result(ratio, passes):
    """Format the result with color coding"""
    status = "[PASS]" if passes else "[FAIL]"
    return f"{ratio:.2f}:1 - {status}"

# Define all colors used across the 6 HTML files

# Light Mode Colors (from Tailwind defaults and custom styles)
LIGHT_COLORS = {
    # Page backgrounds
    "white": "#ffffff",
    "gray-50": "#f9fafb",
    "gray-100": "#f3f4f6",
    "blue-50": "#eff6ff",
    "green-50": "#f0fdf4",
    "purple-50": "#faf5ff",
    "orange-50": "#fff7ed",
    "yellow-50": "#fefce8",
    "red-50": "#fef2f2",
    "teal-50": "#f0fdfa",
    "lime-200": "#d9f99d",
    "lime-300": "#bef264",
    
    # Card/section backgrounds
    "gradient-blue-green": "#eff6ff",  # Approximation
    "gradient-lime": "#d9f99d",  # Approximation
    
    # Table backgrounds
    "table-header": "#f3f4f6",
    "table-row-even": "#f9fafb",
    "table-row-hover": "#f3f4f6",
    "top-1-bg": "#fef3c7",  # amber-100
    "top-2-bg": "#dbeafe",  # blue-100
    "top-3-bg": "#f3e8ff",  # purple-100
    
    # Badge backgrounds
    "badge-blue-100": "#dbeafe",
    "badge-green-100": "#dcfce7",
    "badge-purple-100": "#f3e8ff",
    "badge-orange-100": "#ffedd5",
    "badge-yellow-100": "#fef9c3",
    "badge-teal-100": "#ccfbf1",
    "badge-gray-100": "#f3f4f6",
    
    # Sector badge backgrounds (from CSS variables)
    "sector-tech": "#2563eb",
    "sector-energy": "#166534",
    "sector-cdr": "#7c3aed",
    "sector-finance": "#1e40af",
    "sector-consult": "#6b7280",
    "sector-avia": "#dc2626",
    "sector-media": "#0891b2",
    
    # Brazil sector badges
    "br-fin": "#1e3a8a",
    "br-energia": "#166534",
    "br-celulose": "#92400e",
    "br-mineracao": "#52525b",
    "br-varejo": "#0891b2",
    "br-aviacao": "#dc2626",
    "br-bebidas": "#ea580c",
    "br-agro": "#7c3aed",
    "br-saude": "#db2777",
    "br-telecom": "#d97706",
    "br-siderurgia": "#3f3f46",
    "br-cosmeticos": "#ec4899",
    "br-serv-fin": "#3b82f6",
    "br-logistica": "#06b6d4",
    "br-proteina": "#65a30d",
    
    # I-REC badges
    "irec-vendedor": "#16a34a",
    "irec-comprador": "#2563eb",
    "irec-ambos": "#9333ea",
    
    # iREC Mundo badges
    "irec-mundo-tech": "#2563eb",
    "irec-mundo-varejo": "#0891b2",
    "irec-mundo-manufatura": "#7c3aed",
    "irec-mundo-telecom": "#d97706",
    "irec-mundo-semi": "#dc2626",
    "irec-mundo-mineracao": "#52525b",
    "irec-mundo-alimentos": "#ea580c",
    "irec-mundo-automotivo": "#1e40af",
    "irec-mundo-quimica": "#9333ea",
    "irec-mundo-financeiro": "#1e3a8a",
    "irec-mundo-saude": "#db2777",
}

# Dark Mode Colors (from CSS overrides)
DARK_COLORS = {
    # Page backgrounds
    "body-bg": "#0f172a",  # slate-900
    "card-bg": "#1e293b",  # slate-800
    "border-color": "#334155",  # slate-700
    
    # Text colors
    "text-primary": "#f1f5f9",  # slate-100
    "text-secondary": "#e2e8f0",  # slate-200
    "text-muted": "#cbd5e1",  # slate-300
    "text-subtle": "#94a3b8",  # slate-400
    
    # Table backgrounds
    "table-header-dark": "#1e293b",
    "table-row-even-dark": "#1e293b",
    "table-row-hover-dark": "#334155",
    "top-1-dark": "#713f12",  # dark amber
    "top-2-dark": "#1e3a8a",  # dark blue
    "top-3-dark": "#581c87",  # dark purple
    
    # Badge backgrounds (dark mode overrides)
    "badge-blue-dark": "#1e3a8a",
    "badge-green-dark": "#14532d",
    "badge-purple-dark": "#581c87",
    
    # Info box backgrounds
    "info-blue-dark": "#1e3a8a",
    "info-green-dark": "#14532d",
    "info-purple-dark": "#581c87",
    "info-yellow-dark": "#713f12",
    "info-red-dark": "#7f1d1d",
    "info-teal-dark": "#0f766e",
    
    # Banner (dark mode)
    "banner-bg-dark": "#365314",  # dark lime
    "banner-text-dark": "#ecfccb",
    "banner-link-dark": "#bef264",
}

# Text colors used
TEXT_COLORS = {
    # Light mode text
    "primary-blue": "#1e40af",  # Main brand color
    "gray-900": "#111827",
    "gray-800": "#1f2937",
    "gray-700": "#374151",
    "gray-600": "#4b5563",
    "gray-500": "#6b7280",
    "blue-600": "#2563eb",
    "blue-800": "#1e40af",
    "green-600": "#16a34a",
    "green-800": "#166534",
    "purple-600": "#9333ea",
    "purple-800": "#6b21a8",
    "orange-600": "#ea580c",
    "orange-800": "#9a3412",
    "red-600": "#dc2626",
    "yellow-800": "#854d0e",
    "lime-800": "#3f6212",
    "teal-800": "#115e59",
    "white": "#ffffff",
    
    # Dark mode text
    "dark-text-primary": "#f1f5f9",
    "dark-text-secondary": "#e2e8f0",
    "dark-text-muted": "#cbd5e1",
    "dark-text-subtle": "#94a3b8",
    "dark-blue": "#60a5fa",
    "dark-green": "#4ade80",
    "dark-purple": "#c084fc",
    "dark-orange": "#fb923c",
}

# Growth indicator colors
GROWTH_COLORS = {
    "growth-25plus": "#166534",
    "growth-20-24": "#16a34a",
    "growth-15-19": "#d97706",
    "growth-10-14": "#6b7280",
    "growth-under10": "#9ca3af",
    "growth-high": "#166534",
    "growth-medium": "#16a34a",
    "growth-low": "#d97706",
    "growth-neg": "#dc2626",
    
    # Dark mode growth
    "dark-growth-25plus": "#4ade80",
    "dark-growth-20-24": "#22c55e",
    "dark-growth-15-19": "#fbbf24",
    "dark-growth-10-14": "#9ca3af",
    "dark-growth-under10": "#6b7280",
    "dark-growth-high": "#4ade80",
    "dark-growth-medium": "#22c55e",
    "dark-growth-low": "#fbbf24",
    "dark-growth-neg": "#f87171",
}

def analyze_color_combinations():
    """Analyze all color combinations for WCAG AA compliance"""
    
    print("=" * 80)
    print("WCAG AA CONTRAST COMPLIANCE AUDIT")
    print("Sintropia Carbono - All 6 HTML Pages")
    print("=" * 80)
    print()
    
    all_issues = []
    
    # LIGHT MODE ANALYSIS
    print("=" * 80)
    print("LIGHT MODE ANALYSIS")
    print("=" * 80)
    print()
    
    # Common text on background combinations
    print("## Text on Card/Page Backgrounds (Light Mode)")
    print("-" * 80)
    
    text_bg_combos = [
        ("gray-900", "white", "Main headings on white cards"),
        ("gray-800", "white", "Subheadings on white cards"),
        ("gray-700", "white", "Body text on white cards"),
        ("gray-600", "white", "Secondary text on white cards"),
        ("gray-500", "white", "Muted text on white cards"),
        ("primary-blue", "white", "Brand text on white cards"),
        ("blue-600", "white", "Links on white cards"),
        ("green-600", "white", "Success text on white cards"),
        ("purple-600", "white", "Accent text on white cards"),
        ("orange-600", "white", "Warning text on white cards"),
        
        # On gray-50 backgrounds
        ("gray-900", "gray-50", "Headings on gray-50"),
        ("gray-700", "gray-50", "Body text on gray-50"),
        ("gray-600", "gray-50", "Secondary text on gray-50"),
        
        # On blue-50 backgrounds
        ("blue-800", "blue-50", "Text on blue-50 info boxes"),
        ("blue-600", "blue-50", "Links on blue-50 info boxes"),
        
        # On green-50 backgrounds
        ("green-800", "green-50", "Text on green-50 info boxes"),
        ("green-600", "green-50", "Links on green-50 info boxes"),
        
        # On purple-50 backgrounds
        ("purple-800", "purple-50", "Text on purple-50 info boxes"),
        ("purple-600", "purple-50", "Links on purple-50 info boxes"),
        
        # On yellow-50 backgrounds
        ("yellow-800", "yellow-50", "Text on yellow-50 info boxes"),
        
        # On red-50 backgrounds
        ("red-600", "red-50", "Text on red-50 info boxes"),
        
        # On teal-50 backgrounds
        ("teal-800", "teal-50", "Text on teal-50 info boxes"),
        
        # Table header
        ("gray-700", "table-header", "Table header text"),
        
        # Top 3 highlights
        ("gray-900", "top-1-bg", "Text on gold highlight"),
        ("gray-900", "top-2-bg", "Text on silver highlight"),
        ("gray-900", "top-3-bg", "Text on bronze highlight"),
        
        # Banner
        ("gray-800", "gradient-lime", "Banner text"),
        ("lime-800", "gradient-lime", "Banner links"),
    ]
    
    for text, bg, description in text_bg_combos:
        if text in TEXT_COLORS and bg in LIGHT_COLORS:
            ratio = contrast_ratio(TEXT_COLORS[text], LIGHT_COLORS[bg])
            passes = check_wcag_aa(ratio)
            status = "[PASS]" if passes else "[FAIL]"
            print(f"{status} {description}: {TEXT_COLORS[text]} on {LIGHT_COLORS[bg]} = {ratio:.2f}:1")
            if not passes:
                all_issues.append(f"LIGHT: {description} - {ratio:.2f}:1 (needs 4.5:1)")
    
    print()
    print("## Badge Text (Light Mode)")
    print("-" * 80)
    
    badge_combos = [
        ("white", "sector-tech", "Tech sector badge"),
        ("white", "sector-energy", "Energy sector badge"),
        ("white", "sector-cdr", "CDR sector badge"),
        ("white", "sector-finance", "Finance sector badge"),
        ("white", "sector-consult", "Consulting sector badge"),
        ("white", "sector-avia", "Aviation sector badge"),
        ("white", "sector-media", "Media sector badge"),
        
        # Brazil sectors
        ("white", "br-fin", "Brazil Finance badge"),
        ("white", "br-energia", "Brazil Energy badge"),
        ("white", "br-celulose", "Brazil Celulose badge"),
        ("white", "br-mineracao", "Brazil Mining badge"),
        ("white", "br-varejo", "Brazil Retail badge"),
        ("white", "br-aviacao", "Brazil Aviation badge"),
        ("white", "br-bebidas", "Brazil Beverages badge"),
        ("white", "br-agro", "Brazil Agro badge"),
        ("white", "br-saude", "Brazil Health badge"),
        ("white", "br-telecom", "Brazil Telecom badge"),
        ("white", "br-siderurgia", "Brazil Steel badge"),
        ("white", "br-cosmeticos", "Brazil Cosmetics badge"),
        ("white", "br-serv-fin", "Brazil Fin Services badge"),
        ("white", "br-logistica", "Brazil Logistics badge"),
        ("white", "br-proteina", "Brazil Protein badge"),
        
        # I-REC badges
        ("white", "irec-vendedor", "I-REC Vendedor badge"),
        ("white", "irec-comprador", "I-REC Comprador badge"),
        ("white", "irec-ambos", "I-REC Ambos badge"),
        
        # iREC Mundo badges
        ("white", "irec-mundo-tech", "iREC Mundo Tech"),
        ("white", "irec-mundo-varejo", "iREC Mundo Varejo"),
        ("white", "irec-mundo-manufatura", "iREC Mundo Manufatura"),
        ("white", "irec-mundo-telecom", "iREC Mundo Telecom"),
        ("white", "irec-mundo-semi", "iREC Mundo Semi"),
        ("white", "irec-mundo-mineracao", "iREC Mundo Mineracao"),
        ("white", "irec-mundo-alimentos", "iREC Mundo Alimentos"),
        ("white", "irec-mundo-automotivo", "iREC Mundo Automotivo"),
        ("white", "irec-mundo-quimica", "iREC Mundo Quimica"),
        ("white", "irec-mundo-financeiro", "iREC Mundo Financeiro"),
        ("white", "irec-mundo-saude", "iREC Mundo Saude"),
    ]
    
    for text, bg, description in badge_combos:
        if text in TEXT_COLORS and bg in LIGHT_COLORS:
            ratio = contrast_ratio(TEXT_COLORS[text], LIGHT_COLORS[bg])
            passes = check_wcag_aa(ratio)
            status = "[PASS]" if passes else "[FAIL]"
            print(f"{status} {description}: White on {LIGHT_COLORS[bg]} = {ratio:.2f}:1")
            if not passes:
                all_issues.append(f"LIGHT BADGE: {description} - {ratio:.2f}:1 (needs 4.5:1)")
    
    print()
    print("## Growth Indicators (Light Mode)")
    print("-" * 80)
    
    growth_combos = [
        ("growth-25plus", "white", "25%+ growth on white"),
        ("growth-20-24", "white", "20-24% growth on white"),
        ("growth-15-19", "white", "15-19% growth on white"),
        ("growth-10-14", "white", "10-14% growth on white"),
        ("growth-under10", "white", "<10% growth on white"),
        ("growth-high", "white", "High growth on white"),
        ("growth-medium", "white", "Medium growth on white"),
        ("growth-low", "white", "Low growth on white"),
        ("growth-neg", "white", "Negative growth on white"),
    ]
    
    for text, bg, description in growth_combos:
        if text in GROWTH_COLORS and bg in LIGHT_COLORS:
            ratio = contrast_ratio(GROWTH_COLORS[text], LIGHT_COLORS[bg])
            passes = check_wcag_aa(ratio)
            status = "[PASS]" if passes else "[FAIL]"
            print(f"{status} {description}: {GROWTH_COLORS[text]} on white = {ratio:.2f}:1")
            if not passes:
                all_issues.append(f"LIGHT GROWTH: {description} - {ratio:.2f}:1 (needs 4.5:1)")
    
    print()
    print("## Navigation & Buttons (Light Mode)")
    print("-" * 80)
    
    nav_combos = [
        ("gray-500", "white", "Inactive nav item"),
        ("primary-blue", "blue-50", "Active nav item"),
        ("white", "blue-600", "Blue button text"),
        ("gray-700", "gray-200", "Gray button"),
    ]
    
    for text, bg, description in nav_combos:
        color_map = {**TEXT_COLORS, **LIGHT_COLORS}
        if text in color_map and bg in color_map:
            ratio = contrast_ratio(color_map[text], color_map[bg])
            passes = check_wcag_aa(ratio)
            status = "[PASS]" if passes else "[FAIL]"
            print(f"{status} {description}: {color_map[text]} on {color_map[bg]} = {ratio:.2f}:1")
            if not passes:
                all_issues.append(f"LIGHT NAV: {description} - {ratio:.2f}:1 (needs 4.5:1)")
    
    # DARK MODE ANALYSIS
    print()
    print("=" * 80)
    print("DARK MODE ANALYSIS")
    print("=" * 80)
    print()
    
    print("## Text on Card/Page Backgrounds (Dark Mode)")
    print("-" * 80)
    
    dark_text_bg_combos = [
        ("dark-text-primary", "body-bg", "Primary text on page background"),
        ("dark-text-secondary", "body-bg", "Secondary text on page background"),
        ("dark-text-muted", "body-bg", "Muted text on page background"),
        ("dark-text-primary", "card-bg", "Primary text on card background"),
        ("dark-text-secondary", "card-bg", "Secondary text on card background"),
        ("dark-text-muted", "card-bg", "Muted text on card background"),
        ("dark-text-subtle", "card-bg", "Subtle text on card background"),
        
        # Dark mode info boxes
        ("dark-text-secondary", "info-blue-dark", "Text on dark blue info box"),
        ("dark-text-secondary", "info-green-dark", "Text on dark green info box"),
        ("dark-text-secondary", "info-purple-dark", "Text on dark purple info box"),
        ("dark-text-secondary", "info-yellow-dark", "Text on dark yellow info box"),
        ("dark-text-secondary", "info-red-dark", "Text on dark red info box"),
        ("dark-text-secondary", "info-teal-dark", "Text on dark teal info box"),
        
        # Dark mode table
        ("dark-text-secondary", "table-header-dark", "Table header text"),
        
        # Dark mode top highlights
        ("dark-text-primary", "top-1-dark", "Text on dark gold highlight"),
        ("dark-text-primary", "top-2-dark", "Text on dark silver highlight"),
        ("dark-text-primary", "top-3-dark", "Text on dark bronze highlight"),
        
        # Dark mode accent text
        ("dark-blue", "card-bg", "Blue accent on card"),
        ("dark-green", "card-bg", "Green accent on card"),
        ("dark-purple", "card-bg", "Purple accent on card"),
        ("dark-orange", "card-bg", "Orange accent on card"),
        
        # Banner
        ("banner-text-dark", "banner-bg-dark", "Banner text"),
        ("banner-link-dark", "banner-bg-dark", "Banner links"),
    ]
    
    for text, bg, description in dark_text_bg_combos:
        if text in TEXT_COLORS and bg in DARK_COLORS:
            ratio = contrast_ratio(TEXT_COLORS[text], DARK_COLORS[bg])
            passes = check_wcag_aa(ratio)
            status = "[PASS]" if passes else "[FAIL]"
            print(f"{status} {description}: {TEXT_COLORS[text]} on {DARK_COLORS[bg]} = {ratio:.2f}:1")
            if not passes:
                all_issues.append(f"DARK: {description} - {ratio:.2f}:1 (needs 4.5:1)")
    
    print()
    print("## Badge Text (Dark Mode)")
    print("-" * 80)
    
    # Dark mode uses same badge colors - check white on dark sector colors
    dark_badge_combos = [
        ("white", "sector-tech", "Tech badge (dark context)"),
        ("white", "sector-energy", "Energy badge (dark context)"),
        ("white", "sector-cdr", "CDR badge (dark context)"),
        ("white", "sector-finance", "Finance badge (dark context)"),
        ("white", "sector-consult", "Consulting badge (dark context)"),
        ("white", "sector-avia", "Aviation badge (dark context)"),
        ("white", "sector-media", "Media badge (dark context)"),
        
        # Brazil sectors
        ("white", "br-fin", "Brazil Finance (dark)"),
        ("white", "br-energia", "Brazil Energy (dark)"),
        ("white", "br-celulose", "Brazil Celulose (dark)"),
        ("white", "br-mineracao", "Brazil Mining (dark)"),
        ("white", "br-varejo", "Brazil Retail (dark)"),
        ("white", "br-aviacao", "Brazil Aviation (dark)"),
        ("white", "br-bebidas", "Brazil Beverages (dark)"),
        ("white", "br-agro", "Brazil Agro (dark)"),
        ("white", "br-saude", "Brazil Health (dark)"),
        ("white", "br-telecom", "Brazil Telecom (dark)"),
        ("white", "br-siderurgia", "Brazil Steel (dark)"),
        ("white", "br-cosmeticos", "Brazil Cosmetics (dark)"),
        ("white", "br-serv-fin", "Brazil Fin Services (dark)"),
        ("white", "br-logistica", "Brazil Logistics (dark)"),
        ("white", "br-proteina", "Brazil Protein (dark)"),
        
        # I-REC
        ("white", "irec-vendedor", "I-REC Vendedor (dark)"),
        ("white", "irec-comprador", "I-REC Comprador (dark)"),
        ("white", "irec-ambos", "I-REC Ambos (dark)"),
        
        # iREC Mundo
        ("white", "irec-mundo-tech", "iREC Mundo Tech (dark)"),
        ("white", "irec-mundo-varejo", "iREC Mundo Varejo (dark)"),
        ("white", "irec-mundo-manufatura", "iREC Mundo Manufatura (dark)"),
        ("white", "irec-mundo-telecom", "iREC Mundo Telecom (dark)"),
        ("white", "irec-mundo-semi", "iREC Mundo Semi (dark)"),
        ("white", "irec-mundo-mineracao", "iREC Mundo Mineracao (dark)"),
        ("white", "irec-mundo-alimentos", "iREC Mundo Alimentos (dark)"),
        ("white", "irec-mundo-automotivo", "iREC Mundo Automotivo (dark)"),
        ("white", "irec-mundo-quimica", "iREC Mundo Quimica (dark)"),
        ("white", "irec-mundo-financeiro", "iREC Mundo Financeiro (dark)"),
        ("white", "irec-mundo-saude", "iREC Mundo Saude (dark)"),
    ]
    
    for text, bg, description in dark_badge_combos:
        if text in TEXT_COLORS and bg in LIGHT_COLORS:
            ratio = contrast_ratio(TEXT_COLORS[text], LIGHT_COLORS[bg])
            passes = check_wcag_aa(ratio)
            status = "[PASS]" if passes else "[FAIL]"
            print(f"{status} {description}: White on {LIGHT_COLORS[bg]} = {ratio:.2f}:1")
            if not passes:
                all_issues.append(f"DARK BADGE: {description} - {ratio:.2f}:1 (needs 4.5:1)")
    
    print()
    print("## Growth Indicators (Dark Mode)")
    print("-" * 80)
    
    dark_growth_combos = [
        ("dark-growth-25plus", "card-bg", "25%+ growth on dark card"),
        ("dark-growth-20-24", "card-bg", "20-24% growth on dark card"),
        ("dark-growth-15-19", "card-bg", "15-19% growth on dark card"),
        ("dark-growth-10-14", "card-bg", "10-14% growth on dark card"),
        ("dark-growth-under10", "card-bg", "<10% growth on dark card"),
        ("dark-growth-high", "card-bg", "High growth on dark card"),
        ("dark-growth-medium", "card-bg", "Medium growth on dark card"),
        ("dark-growth-low", "card-bg", "Low growth on dark card"),
        ("dark-growth-neg", "card-bg", "Negative growth on dark card"),
    ]
    
    for text, bg, description in dark_growth_combos:
        if text in GROWTH_COLORS and bg in DARK_COLORS:
            ratio = contrast_ratio(GROWTH_COLORS[text], DARK_COLORS[bg])
            passes = check_wcag_aa(ratio)
            status = "[PASS]" if passes else "[FAIL]"
            print(f"{status} {description}: {GROWTH_COLORS[text]} on {DARK_COLORS[bg]} = {ratio:.2f}:1")
            if not passes:
                all_issues.append(f"DARK GROWTH: {description} - {ratio:.2f}:1 (needs 4.5:1)")
    
    print()
    print("## Navigation & Buttons (Dark Mode)")
    print("-" * 80)
    
    dark_nav_combos = [
        ("dark-text-subtle", "card-bg", "Inactive nav item (dark)"),
        ("dark-blue", "badge-blue-dark", "Active nav item (dark)"),
    ]
    
    for text, bg, description in dark_nav_combos:
        color_map = {**TEXT_COLORS, **GROWTH_COLORS, **DARK_COLORS}
        if text in color_map and bg in color_map:
            ratio = contrast_ratio(color_map[text], color_map[bg])
            passes = check_wcag_aa(ratio)
            status = "[PASS]" if passes else "[FAIL]"
            print(f"{status} {description}: {color_map[text]} on {color_map[bg]} = {ratio:.2f}:1")
            if not passes:
                all_issues.append(f"DARK NAV: {description} - {ratio:.2f}:1 (needs 4.5:1)")
    
    # SUMMARY
    print()
    print("=" * 80)
    print("SUMMARY")
    print("=" * 80)
    print()
    
    if all_issues:
        print(f"[FAIL] FOUND {len(all_issues)} WCAG AA CONTRAST ISSUES:")
        print()
        for i, issue in enumerate(all_issues, 1):
            print(f"{i}. {issue}")
    else:
        print("[PASS] ALL COLOR COMBINATIONS PASS WCAG AA CONTRAST REQUIREMENTS!")
    
    print()
    print("=" * 80)
    print("RECOMMENDATIONS FOR FIXES")
    print("=" * 80)
    print()
    
    if all_issues:
        print("Issues found. See above for details.")
        print()
        print("General recommendations:")
        print("1. Ensure all text has a minimum contrast ratio of 4.5:1")
        print("2. For large text (18pt+ or 14pt+bold), minimum is 3:1")
        print("3. Check badge colors - many may need adjustment")
        print("4. Verify growth indicator colors are visible on both light and dark backgrounds")
    else:
        print("No fixes needed - all combinations meet WCAG AA standards!")
    
    return all_issues

if __name__ == "__main__":
    issues = analyze_color_combinations()
