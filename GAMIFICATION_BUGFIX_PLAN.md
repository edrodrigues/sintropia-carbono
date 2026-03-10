# Gamification & Streak Bug Fix Plan

## Executive Summary
This document outlines the issues found in the gamification and streak functionality and provides a plan to fix them.

---

## Issues Found

### Critical Issues

#### 1. Achievements Are Never Persisted to Database
- **Location**: `src/lib/achievements.ts`, `src/types/gamification.ts`
- **Problem**: Achievements are calculated on-the-fly when viewing the profile but never saved to the `user_achievements` table. The table currently has **0 rows**.
- **Impact**: 
  - No way to track when achievements were earned
  - Can't show achievement history/earned date
  - Cannot display earned achievements in UI
  - `user_achievements` table is essentially unused
- **Database State**: `SELECT COUNT(*) FROM user_achievements` returns 0

#### 2. Missing RLS Policy for Updating user_achievements
- **Location**: Database RLS policies
- **Problem**: Only SELECT and INSERT policies exist for `user_achievements`, missing UPDATE policy
- **Current Policies**:
  - ✅ Users can view own achievements (SELECT)
  - ✅ Users can insert own achievements (INSERT)
  - ❌ Users can update own achievements (UPDATE) - **MISSING**
- **Impact**: If achievements need to be recalculated, the update will fail

#### 3. Early Adopter Achievement Date Is Hardcoded
- **Location**: `src/lib/achievements.ts:510`
- **Problem**: Uses `new Date("2025-01-01")` which is now in the past
- **Current Code**:
  ```typescript
  case "early_adopter":
    earned = new Date(stats.createdAt) < new Date("2025-01-01");
    break;
  ```
- **Impact**: Achievement will never be awarded (or will be awarded to everyone after the date passes)

---

### Medium Issues

#### 4. Streak Expiration Not Handled in Database
- **Location**: `src/lib/streaks.ts:19-25`
- **Problem**: Client-side code returns `current_streak: 0` if expired, but doesn't update the database. The database retains the old streak value.
- **Current Logic**:
  ```typescript
  if (data && !isStreakActive(data.last_activity_date)) {
    return {
      ...data,
      current_streak: 0  // Only affects display, not database
    };
  }
  ```
- **Impact**: When user returns after expiration, the UI shows 0 but database still has old value. The next update will correctly reset to 1, but this creates inconsistency.

#### 5. StreakUpdater Doesn't Check Last Activity Date
- **Location**: `src/components/gamification/StreakUpdater.tsx`
- **Problem**: Uses session-based `hasUpdated` state instead of checking if streak was already updated today
- **Current Logic**: 
  ```typescript
  const [hasUpdated, setHasUpdated] = useState(false);
  // Updates once per session, not per day
  ```
- **Impact**: Low (the database function handles duplicate updates correctly), but inefficient

#### 6. No Automatic Achievement Awarding Mechanism
- **Location**: Application-wide
- **Problem**: No trigger or function to automatically award achievements when criteria are met
- **Impact**: Users never receive achievements even when they meet criteria

---

### Minor Issues

#### 7. Streak Badge Shows "Next Bonus" Instead of Current
- **Location**: `src/components/gamification/StreakBadge.tsx:20`
- **Problem**: Shows `getStreakBonus(currentStreak + 1)` instead of current streak's bonus
- **Code**:
  ```typescript
  const bonus = getStreakBonus(currentStreak + 1); // Shows next day's bonus
  ```
- **Impact**: UI shows "+5" when user has 3-day streak (which gives +4), confusing users

#### 8. Leaderboard Query Filters Banned Users Incorrectly
- **Location**: `src/lib/streaks.ts:64`
- **Problem**: Uses `.neq('profiles.role', 'banned')` which filters incorrectly
- **Code**:
  ```typescript
  .neq('profiles.role', 'banned')
  ```
- **Impact**: The filter may not work as expected due to join complexity

---

## Fix Plan

### Phase 1: Critical Fixes

#### Fix 1.1: Add Missing RLS Policy for user_achievements
```sql
-- Add UPDATE policy for user_achievements
CREATE POLICY "Users can update own achievements"
ON public.user_achievements
FOR UPDATE
USING (auth.uid() = user_id);
```

#### Fix 1.2: Create Achievement Awarding Function
Create a PostgreSQL function to check and award achievements:

```sql
CREATE OR REPLACE FUNCTION check_and_award_achievements(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_stats RECORD;
  v_achievements_earned JSONB := '[]'::JSONB;
BEGIN
  -- Get user stats
  SELECT 
    (SELECT COUNT(*) FROM posts WHERE author_id = p_user_id AND is_deleted = false) as post_count,
    (SELECT COUNT(*) FROM comments WHERE author_id = p_user_id AND is_deleted = false) as comment_count,
    (SELECT COALESCE(SUM(karma), 0) FROM posts WHERE author_id = p_user_id AND is_deleted = false) as post_karma,
    (SELECT COALESCE(SUM(karma), 0) FROM comments WHERE author_id = p_user_id AND is_deleted = false) as comment_karma,
    (SELECT karma FROM profiles WHERE id = p_user_id) as karma,
    (SELECT created_at FROM profiles WHERE id = p_user_id) as created_at,
    (SELECT current_streak FROM user_streaks WHERE user_id = p_user_id) as streak_days,
    (SELECT linkedin_url FROM profiles WHERE id = p_user_id) as linkedin_url
  INTO v_stats;

  -- Check each achievement and insert if not already earned
  -- Implementation details...

  RETURN v_achievements_earned;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### Fix 1.3: Fix Early Adopter Date
Update `src/lib/achievements.ts:510`:

```typescript
case "early_adopter":
  earned = new Date(stats.createdAt) < new Date("2025-03-01"); // Use actual launch date
  break;
```

---

### Phase 2: Streak Improvements

#### Fix 2.1: Update Streak Expiration in Database
Add logic to reset streak to 0 when expired:

```sql
CREATE OR REPLACE FUNCTION update_user_streak(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_streak RECORD;
  v_today DATE := CURRENT_DATE;
  v_yesterday DATE := CURRENT_DATE - 1;
  v_bonus INT := 0;
  v_result JSONB;
  v_old_last_activity DATE;
  v_days_since_last_activity INT;
BEGIN
  -- Get current streak info
  SELECT last_activity_date, current_streak INTO v_old_last_activity, v_streak
  FROM user_streaks 
  WHERE user_id = p_user_id;

  -- Calculate days since last activity
  IF v_old_last_activity IS NOT NULL THEN
    v_days_since_last_activity := v_today - v_old_last_activity;
    
    -- If more than 1 day has passed, reset streak
    IF v_days_since_last_activity > 1 THEN
      UPDATE user_streaks 
      SET current_streak = 0 
      WHERE user_id = p_user_id;
    END IF;
  END IF;

  -- Rest of the existing logic...
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### Fix 2.2: Improve StreakUpdater to Check Today's Activity
Update `src/components/gamification/StreakUpdater.tsx`:

```typescript
useEffect(() => {
  const updateStreak = async () => {
    // First check if already updated today
    const res = await fetch("/api/gamification/streak");
    const data = await res.json();
    
    if (data.streak?.last_activity_date !== new Date().toISOString().split('T')[0]) {
      // Update streak if not updated today
      await fetch("/api/gamification/streak", { method: "POST" });
    }
  };
  updateStreak();
}, []);
```

---

### Phase 3: Minor Fixes

#### Fix 3.1: Correct Bonus Display in StreakBadge
Update `src/components/gamification/StreakBadge.tsx:20`:

```typescript
// Show current streak's bonus, not next
const bonus = getStreakBonus(currentStreak);
```

#### Fix 3.2: Fix Leaderboard Query
Update `src/lib/streaks.ts`:

```typescript
// Use proper filter after join
.filter(item => item.profiles?.role !== 'banned')
```

---

## Implementation Order

1. **Immediate (Critical)**:
   - Fix 1.1: Add missing RLS policy
   - Fix 1.3: Fix Early Adopter date

2. **Short-term**:
   - Fix 1.2: Create achievement awarding mechanism
   - Fix 2.1: Fix streak expiration in database

3. **Medium-term**:
   - Fix 2.2: Improve StreakUpdater
   - Fix 3.1: Correct bonus display

4. **Low-priority**:
   - Fix 3.2: Fix leaderboard query

---

## Testing Checklist

- [ ] Verify user_achievements RLS policies work correctly
- [ ] Test streak expiration after 1+ days of inactivity
- [ ] Test streak bonus calculation for all streak levels (1-30+ days)
- [ ] Test achievement awarding for all achievement types
- [ ] Test early_adopter achievement with various account creation dates
- [ ] Verify streak leaderboard shows correct data and filters banned users
- [ ] Test cross-timezone streak calculations
