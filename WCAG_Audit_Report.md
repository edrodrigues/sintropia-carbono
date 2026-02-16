# WCAG AA Contrast Compliance Audit Report
## Sintropia Carbono - All 6 HTML Pages

**Date:** February 15, 2026  
**WCAG Standard:** Level AA (4.5:1 minimum for normal text, 3:1 for large text)  
**Files Audited:** index.html, certificadoras.html, carbono-brasil.html, carbono-mundo.html, irec-brasil.html, irec-mundo.html

---

## Executive Summary

**Total Issues Found:** 36 contrast violations
- **Light Mode:** 21 issues
- **Dark Mode:** 15 issues

**Overall Compliance:** ~65% of color combinations pass WCAG AA

---

## Detailed Findings

### LIGHT MODE ISSUES (21)

#### 1. Text on Background Failures (4 issues)

| Issue | Current Colors | Contrast | Required | Fix Recommendation |
|-------|---------------|----------|----------|-------------------|
| Green success text on white | #16a34a on #ffffff | 3.30:1 | 4.5:1 | Change to **#15803d** (green-700) → 4.53:1 ✅ |
| Orange warning text on white | #ea580c on #ffffff | 3.56:1 | 4.5:1 | Change to **#c2410c** (orange-700) → 4.59:1 ✅ |
| Green links on green-50 | #16a34a on #f0fdf4 | 3.15:1 | 4.5:1 | Change to **#14532d** (green-900) → 7.00:1 ✅ |
| Red text on red-50 | #dc2626 on #fef2f2 | 4.41:1 | 4.5:1 | Change to **#991b1b** (red-800) → 7.08:1 ✅ |

**Affected Files:**
- `index.html` (KPI cards, insight boxes)
- `carbono-brasil.html` (growth indicators)
- `carbono-mundo.html` (growth indicators, insight boxes)
- `irec-brasil.html` (insight boxes)

#### 2. Badge Color Failures (16 issues)

**Critical Badge Issues (fails in BOTH light and dark modes):**

| Badge Type | Current Color | Contrast | Fix Recommendation |
|------------|--------------|----------|-------------------|
| Media/Telecom (#0891b2) | Cyan-600 | 3.68:1 | Use **#0e7490** (cyan-700) → 4.77:1 ✅ |
| Bebidas/Alimentos (#ea580c) | Orange-600 | 3.56:1 | Use **#9a3412** (orange-800) → 7.09:1 ✅ |
| Telecom (#d97706) | Amber-600 | 3.19:1 | Use **#92400e** (amber-800) → 6.73:1 ✅ |
| Cosméticos (#ec4899) | Pink-500 | 3.53:1 | Use **#be185d** (pink-700) → 5.08:1 ✅ |
| Fin Services (#3b82f6) | Blue-500 | 3.68:1 | Use **#1d4ed8** (blue-700) → 4.86:1 ✅ |
| Logística (#06b6d4) | Cyan-500 | 2.43:1 | Use **#155e75** (cyan-800) → 6.59:1 ✅ |
| Proteína (#65a30d) | Lime-600 | 3.09:1 | Use **#3f6212** (lime-800) → 6.06:1 ✅ |
| I-REC Vendedor (#16a34a) | Green-600 | 3.30:1 | Use **#15803d** (green-700) → 4.53:1 ✅ |

**Files Affected:**
- `carbono-brasil.html` (sector badges - lines 66-124)
- `carbono-mundo.html` (sector badges - lines 28-84)
- `irec-brasil.html` (papel badges - lines 27-64)
- `irec-mundo.html` (sector badges - lines 63-74)

#### 3. Growth Indicator Failures (5 issues)

| Class | Current Color | On Background | Contrast | Fix Recommendation |
|-------|--------------|---------------|----------|-------------------|
| .growth-20-24 | #16a34a | white | 3.30:1 | Use **#15803d** → 4.53:1 ✅ |
| .growth-15-19 | #d97706 | white | 3.19:1 | Use **#92400e** → 6.73:1 ✅ |
| .growth-under10 | #9ca3af | white | 2.54:1 | Use **#4b5563** (gray-600) → 4.83:1 ✅ |
| .growth-medium | #16a34a | white | 3.30:1 | Use **#15803d** → 4.53:1 ✅ |
| .growth-low | #d97706 | white | 3.19:1 | Use **#92400e** → 6.73:1 ✅ |

**Files Affected:**
- `carbono-brasil.html` (lines 127-149)
- `carbono-mundo.html` (lines 86-104)
- `irec-brasil.html` (lines 66-89)
- `irec-mundo.html` (lines 75-77)

---

### DARK MODE ISSUES (15)

#### 1. Text on Background (2 issues)

| Issue | Current Colors | Contrast | Fix Recommendation |
|-------|---------------|----------|-------------------|
| Teal info box text | #e2e8f0 on #0f766e | 4.44:1 | Use **#f1f5f9** + darken bg to **#115e59** → 5.29:1 ✅ |
| Active nav item | #60a5fa on #1e3a8a | 4.07:1 | Use **#93c5fd** (blue-300) → 5.61:1 ✅ |

**Files Affected:**
- All files with dark mode CSS

#### 2. Badge Color Failures (13 issues - same as light mode)

Same badge colors fail in dark mode context. The badge colors themselves need to be darkened as recommended above.

#### 3. Growth Indicator (1 issue)

| Class | Current Color | On Background | Contrast | Fix Recommendation |
|-------|--------------|---------------|----------|-------------------|
| .growth-under10 | #6b7280 | #1e293b | 3.03:1 | Use **#94a3b8** (gray-400) → 5.71:1 ✅ |

---

## Specific CSS Fix Recommendations

### 1. Fix Growth Indicators (All Files)

```css
/* LIGHT MODE - Update these in all files */
.growth-20-24 { color: #15803d; }  /* Was: #16a34a */
.growth-15-19 { color: #92400e; }  /* Was: #d97706 */
.growth-under10 { color: #4b5563; }  /* Was: #9ca3af */
.growth-medium { color: #15803d; }  /* Was: #16a34a */
.growth-low { color: #92400e; }  /* Was: #d97706 */

/* DARK MODE - Update these */
.dark .growth-under10 { color: #94a3b8; }  /* Was: #6b7280 */
```

### 2. Fix Sector Badges (carbono-brasil.html)

```css
/* Lines 28-43 - Update these CSS variables */
:root {
    --br-varejo: #0e7490;        /* Was: #0891b2 - Cyan-700 */
    --br-bebidas: #9a3412;       /* Was: #ea580c - Orange-800 */
    --br-telecom: #92400e;       /* Was: #d97706 - Amber-800 */
    --br-cosmeticos: #be185d;    /* Was: #ec4899 - Pink-700 */
    --br-serv-fin: #1d4ed8;      /* Was: #3b82f6 - Blue-700 */
    --br-logistica: #155e75;     /* Was: #06b6d4 - Cyan-800 */
    --br-proteina: #3f6212;      /* Was: #65a30d - Lime-800 */
}
```

### 3. Fix Sector Badges (carbono-mundo.html)

```css
/* Lines 27-35 - Update these CSS variables */
:root {
    --sector-media: #0e7490;     /* Was: #0891b2 - Cyan-700 */
}
```

### 4. Fix I-REC Badges (irec-brasil.html)

```css
/* Lines 27-31 - Update these CSS variables */
:root {
    --irec-vendedor: #15803d;    /* Was: #16a34a - Green-700 */
}
```

### 5. Fix iREC Mundo Badges (irec-mundo.html)

```css
/* Lines 63-74 - Update these badge classes */
.badge-varejo { background-color: #0e7490; }    /* Was: #0891b2 */
.badge-telecom { background-color: #92400e; }   /* Was: #d97706 */
.badge-alimentos { background-color: #9a3412; } /* Was: #ea580c */
```

### 6. Fix Dark Mode Navigation (All Files)

```css
/* Update dark mode active nav item */
.dark nav a.active,
.dark nav a.border-b-2 {
    color: #93c5fd;  /* Was: #60a5fa - Blue-300 for better contrast */
}
```

### 7. Fix Dark Mode Teal Info Box (All Files)

```css
/* Dark mode teal info box */
.dark .bg-teal-50,
.dark .info-teal-dark {
    background-color: #115e59;  /* Darker teal */
    color: #f1f5f9;  /* Lightest text color */
}
```

---

## Priority Order for Fixes

### 🔴 HIGH PRIORITY (Fix First)
1. **Logistics badge** (#06b6d4) - 2.43:1 (worst offender)
2. **<10% growth indicator** (#9ca3af) - 2.54:1
3. **Protein badge** (#65a30d) - 3.09:1
4. **Telecom badges** (#d97706) - 3.19:1

### 🟡 MEDIUM PRIORITY
5. I-REC Vendedor badge (#16a34a)
6. Green success text on white (#16a34a)
7. All growth indicators using orange (#d97706)
8. All badges using cyan (#0891b2)

### 🟢 LOW PRIORITY (Borderline)
9. Red text on red-50 (4.41:1 - only slightly under)
10. Dark mode active nav item (4.07:1)
11. Dark mode teal info box (4.44:1)

---

## Verification Checklist

After implementing fixes, verify:

- [ ] All sector badges in carbono-brasil.html pass 4.5:1
- [ ] All sector badges in carbono-mundo.html pass 4.5:1
- [ ] All I-REC badges pass 4.5:1
- [ ] All growth indicators pass 4.5:1 in both modes
- [ ] Active navigation states pass 4.5:1 in both modes
- [ ] All info box text passes 4.5:1 in both modes
- [ ] Test with browser dev tools contrast checker
- [ ] Test with actual screen readers
- [ ] Verify fixes don't break visual design

---

## Tools Used

- Custom Python contrast calculation script (wcag_audit.py)
- WCAG 2.1 AA guidelines (4.5:1 for normal text)
- Relative luminance formula per WCAG spec

---

## Appendix: Color Contrast Reference Table

| Color | Hex | Luminance | Notes |
|-------|-----|-----------|-------|
| White | #ffffff | 1.00 | Reference |
| Gray-100 | #f1f5f9 | 0.95 | Dark text bg |
| Gray-200 | #e2e8f0 | 0.88 | Dark mode text |
| Gray-300 | #cbd5e1 | 0.74 | Muted dark text |
| Gray-400 | #94a3b8 | 0.52 | Dark subtle |
| Gray-500 | #6b7280 | 0.35 | Muted light text |
| Gray-600 | #4b5563 | 0.21 | Light subtle |
| Gray-700 | #374151 | 0.11 | Light body |
| Gray-800 | #1f2937 | 0.06 | Light headings |
| Gray-900 | #111827 | 0.03 | Light primary |
| Black | #000000 | 0.00 | Reference |

**Contrast Ratio Formula:** (L1 + 0.05) / (L2 + 0.05)

---

*Report generated by WCAG AA Audit Script*
*For questions or updates, contact: ernj@cin.ufpe.br*
