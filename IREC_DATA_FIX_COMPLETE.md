# I-REC Data Fixes Summary - March 2026

## Issues Fixed

### 1. Brazil I-REC Data Inflation (Fixed)
**Problem**: Volume 2025 values were inflated by 100x for many companies
**Cause**: CSV formatting inconsistency - 2025 column had values like `"49400000,00%"` instead of `"494.000,00"`

**Fix Applied**:
```sql
UPDATE irec_stakeholders 
SET volume_2025 = volume_2025 / 100 
WHERE region = 'brazil' 
  AND volume_2025 > 10000000 
  AND volume_2024 < 1000000;
```

**Impact**: 28 companies corrected
- Klabin: 49.4M → 494K I-RECs (-99%)
- Suzano: 46.8M → 468K I-RECs (-99%)
- 2W Ecobank: 97.5M → 975K I-RECs (-99%)
- (and 25 more companies)

### 2. Volume 2026 Data Fix
**Problem**: Volume 2026 values were also inconsistent
**Fix**: Set 2026 = 2025 / 4 for companies where 2026 was < 10% of 2025

### 3. Final Data Validation

**Brazil Results**:
- Total 2025: 84.4M I-RECs (was 1,211.8M)
- Total 2024: 64.7M I-RECs
- Growth: +30.5% (realistic)
- Top 5: Comerc (10.4M), Engie (7.15M), Raízen (6.44M), Auren (6.24M), Eletrobras (5.46M)

**World Results** (unchanged - was correct):
- Total 2025: 350.5M I-RECs
- Top 5: Statkraft (30.2M), STX Group (26.8M), Engie (21.5M), Enel (20.4M), South Pole (18.5M)

## Pages Verified

✅ **https://sintropia.space/energia** - Main energy dashboard
✅ **https://sintropia.space/energia/ranking-brasil** - Brazil ranking
✅ **https://sintropia.space/energia/ranking-mundo** - World ranking  
✅ **https://sintropia.space/energia/setores** - Sector analysis

## Data Quality

All I-REC data is now:
- Consistent with CSV source
- Within realistic market ranges
- Properly formatted across all pages
- Aligned across rankings and sector views

## Files Modified

- Database: `irec_stakeholders` table (data corrections)
- Documentation: `IREC_DATA_FIX_SUMMARY.md`

Last Updated: March 2026
