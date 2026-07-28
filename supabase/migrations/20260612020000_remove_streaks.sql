-- Migration: Remove streaks feature
-- Date: 2026-06-12

-- Clean up streak-related karma transactions
DELETE FROM public.karma_transactions
WHERE reason LIKE 'Streak diário%';

-- Drop streak-related achievements from users
DELETE FROM public.user_achievements
WHERE achievement_id IN ('week_warrior', 'fortnight_fighter', 'month_master');

-- Drop the user_streaks table
DROP TABLE IF EXISTS public.user_streaks CASCADE;

-- Drop the update_user_streak function
DROP FUNCTION IF EXISTS public.update_user_streak;

-- Recreate check_and_award_achievements without streak logic
CREATE OR REPLACE FUNCTION public.check_and_award_achievements(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_post_count INT;
    v_comment_count INT;
    v_karma INT;
    v_created_at TIMESTAMP;
    v_linkedin_url TEXT;
    v_ach_id TEXT;
BEGIN
    -- Get user stats
    SELECT COUNT(*) INTO v_post_count FROM public.posts WHERE author_id = p_user_id AND is_deleted = false;
    SELECT COUNT(*) INTO v_comment_count FROM public.comments WHERE author_id = p_user_id AND is_deleted = false;
    SELECT karma, created_at, linkedin_url INTO v_karma, v_created_at, v_linkedin_url FROM public.profiles WHERE id = p_user_id;

    -- Check each achievement
    
    -- 1. Karma achievements
    IF v_karma >= 10 THEN v_ach_id := 'karma_10'; PERFORM public.award_achievement_if_missing(p_user_id, v_ach_id); END IF;
    IF v_karma >= 50 THEN v_ach_id := 'karma_50'; PERFORM public.award_achievement_if_missing(p_user_id, v_ach_id); END IF;
    IF v_karma >= 100 THEN v_ach_id := 'karma_100'; PERFORM public.award_achievement_if_missing(p_user_id, v_ach_id); END IF;
    
    -- 2. Quantity achievements
    IF v_post_count >= 1 THEN v_ach_id := 'first_post'; PERFORM public.award_achievement_if_missing(p_user_id, v_ach_id); END IF;
    IF v_post_count >= 10 THEN v_ach_id := 'veteran'; PERFORM public.award_achievement_if_missing(p_user_id, v_ach_id); END IF;
    
    IF v_comment_count >= 1 THEN v_ach_id := 'first_comment'; PERFORM public.award_achievement_if_missing(p_user_id, v_ach_id); END IF;
    IF v_comment_count >= 20 THEN v_ach_id := 'chatterbox'; PERFORM public.award_achievement_if_missing(p_user_id, v_ach_id); END IF;
    
    -- 3. Social & Special
    IF v_linkedin_url IS NOT NULL AND v_linkedin_url != '' THEN v_ach_id := 'connected'; PERFORM public.award_achievement_if_missing(p_user_id, v_ach_id); END IF;
    IF v_created_at < '2025-03-01'::TIMESTAMP THEN v_ach_id := 'early_adopter'; PERFORM public.award_achievement_if_missing(p_user_id, v_ach_id); END IF;

    RETURN jsonb_build_object('status', 'success');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
