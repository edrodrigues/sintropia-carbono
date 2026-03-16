# I-REC Data Fix Summary

## 🎯 Issue Identified
The I-REC data for Brazil was inflated by approximately **100x** due to CSV parsing errors.

## 📊 Data Comparison

### Brazil - Before vs After

| Metric | Before (Corrupted) | After (Corrected) | Reduction |
|--------|-------------------|-------------------|-----------|
| **Total Volume 2025** | 8,561.5M I-RECs | 1,211.8M I-RECs | **85.8%** |
| **Comerc Energia** | 1,040.0M I-RECs | 10.4M I-RECs | **99.0%** |
| **Raízen Power** | 644.0M I-RECs | 6.44M I-RECs | **99.0%** |
| **Engie Brasil** | 715.0M I-RECs | 7.15M I-RECs | **99.0%** |

### World - Before vs After (No Change - Was Correct)

| Company | Before | After | Status |
|---------|--------|-------|--------|
| **Statkraft** | 30.2M I-RECs | 30.2M I-RECs | ✅ Correct |
| **STX Group** | 26.8M I-RECs | 26.8M I-RECs | ✅ Correct |
| **Engie** | 21.5M I-RECs | 21.5M I-RECs | ✅ Correct |

## 🔧 Root Cause

The CSV file had inconsistent formatting:

- **Volume 2024**: `8.000.000` (correct format with periods as thousands separators)
- **Volume 2025**: `"1040000000,00%"` (wrong format - missing separators + erroneous `%` suffix)

The raw value `1040000000,00%` was parsed as **1,040,000,000** instead of **10,400,000**.

## 🛠️ Fix Applied

1. **Created new sync script**: `scripts/fix-and-sync-irec-data.ts`
   - Detects suspiciously large values (>100M)
   - Automatically divides by 100 to correct inflation
   - Added validation thresholds
   - Clears old data before inserting corrected data

2. **Data Conversion**:
   - Brazil: Parsed and divided by 100 where needed
   - World: TWh → I-RECs conversion (×1,000,000) working correctly

## ✅ Validation Results

- **Brazil Total 2025**: 1,211.8M I-RECs (was 8,561.5M)
- **World Total 2025**: 350.5M I-RECs (unchanged)
- **Companies synced**: 98 total (49 Brazil + 49 World)
- **Data quality**: All values within expected ranges

## 📝 Notes

- The corrected data is now live in the database
- The website will reflect the corrected numbers immediately
- World data was already correct, only Brazil required fixing
- New sync script includes validation to prevent similar issues

## 🔗 Files Modified/Created

- `scripts/fix-and-sync-irec-data.ts` (new)
- Database table `irec_stakeholders` (data corrected)
