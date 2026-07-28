-- Migration: Gamification & Streak Fixes
-- Date: 2026-03-09

-- Fix 1.1: Add UPDATE policy for user_achievements
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_achievements' AND policyname = 'Users can update own achievements'
    ) THEN
        CREATE POLICY "Users can update own achievements"
        ON public.user_achievements
        FOR UPDATE
        USING (auth.uid() = user_id);
    END IF;
END $$;

-- Fix 2.1: Update update_user_streak logic to handle expiration correctly in DB
CREATE OR REPLACE FUNCTION public.update_user_streak(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_today DATE := CURRENT_DATE;
    v_yesterday DATE := CURRENT_DATE - 1;
    v_last_activity DATE;
    v_current_streak INT;
    v_longest_streak INT;
    v_total_days INT;
    v_bonus INT := 0;
    v_result JSONB;
BEGIN
    -- Get current stats
    SELECT last_activity_date, current_streak, longest_streak, total_days_active
    INTO v_last_activity, v_current_streak, v_longest_streak, v_total_days
    FROM public.user_streaks
    WHERE user_id = p_user_id;

    -- If no record exists, create one
    IF NOT FOUND THEN
        INSERT INTO public.user_streaks (user_id, current_streak, longest_streak, last_activity_date, total_days_active)
        VALUES (p_user_id, 1, 1, v_today, 1)
        RETURNING last_activity_date, current_streak, longest_streak, total_days_active
        INTO v_last_activity, v_current_streak, v_longest_streak, v_total_days;
        
        v_bonus := 2; -- First day bonus
    ELSE
        -- If already active today, do nothing
        IF v_last_activity = v_today THEN
            v_bonus := 0;
        -- If active yesterday, increment streak
        ELSIF v_last_activity = v_yesterday THEN
            v_current_streak := v_current_streak + 1;
            v_total_days := v_total_days + 1;
            IF v_current_streak > v_longest_streak THEN
                v_longest_streak := v_current_streak;
            END IF;
            
            -- Calculate bonus (simple logic matching getStreakBonus)
            IF v_current_streak = 2 THEN v_bonus := 3;
            ELSIF v_current_streak = 3 THEN v_bonus := 4;
            ELSIF v_current_streak = 4 THEN v_bonus := 5;
            ELSIF v_current_streak = 5 THEN v_bonus := 6;
            ELSIF v_current_streak = 6 THEN v_bonus := 8;
            ELSIF v_current_streak = 7 THEN v_bonus := 10;
            ELSE v_bonus := LEAST(10 + (v_current_streak - 7), 15);
            END IF;

            UPDATE public.user_streaks
            SET current_streak = v_current_streak,
                longest_streak = v_longest_streak,
                last_activity_date = v_today,
                total_days_active = v_total_days,
                updated_at = NOW()
            WHERE user_id = p_user_id;
        -- If gap is more than 1 day, reset streak
        ELSE
            v_current_streak := 1;
            v_total_days := v_total_days + 1;
            v_bonus := 2; -- Reset bonus

            UPDATE public.user_streaks
            SET current_streak = v_current_streak,
                last_activity_date = v_today,
                total_days_active = v_total_days,
                updated_at = NOW()
            WHERE user_id = p_user_id;
        END IF;
    END IF;

    -- Award bonus karma if earned
    IF v_bonus > 0 THEN
        UPDATE public.profiles
        SET karma = COALESCE(karma, 0) + v_bonus
        WHERE id = p_user_id;
        
        INSERT INTO public.karma_transactions (user_id, amount, reason, created_at)
        VALUES (p_user_id, v_bonus, 'Streak diário (' || v_current_streak || ' dias)', NOW());
    END IF;

    v_result := jsonb_build_object(
        'current_streak', v_current_streak,
        'longest_streak', v_longest_streak,
        'total_days', v_total_days,
        'bonus_earned', v_bonus
    );

    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix 1.2: Achievement Awarding Function
CREATE OR REPLACE FUNCTION public.check_and_award_achievements(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_post_count INT;
    v_comment_count INT;
    v_karma INT;
    v_streak INT;
    v_created_at TIMESTAMP;
    v_linkedin_url TEXT;
    v_achievements_earned TEXT[] := ARRAY[]::TEXT[];
    v_ach_id TEXT;
BEGIN
    -- Get user stats
    SELECT COUNT(*) INTO v_post_count FROM public.posts WHERE author_id = p_user_id AND is_deleted = false;
    SELECT COUNT(*) INTO v_comment_count FROM public.comments WHERE author_id = p_user_id AND is_deleted = false;
    SELECT karma, created_at, linkedin_url INTO v_karma, v_created_at, v_linkedin_url FROM public.profiles WHERE id = p_user_id;
    SELECT current_streak INTO v_streak FROM public.user_streaks WHERE user_id = p_user_id;

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
    
    -- 3. Consistency achievements
    IF v_streak >= 7 THEN v_ach_id := 'week_warrior'; PERFORM public.award_achievement_if_missing(p_user_id, v_ach_id); END IF;
    IF v_streak >= 14 THEN v_ach_id := 'fortnight_fighter'; PERFORM public.award_achievement_if_missing(p_user_id, v_ach_id); END IF;
    IF v_streak >= 30 THEN v_ach_id := 'month_master'; PERFORM public.award_achievement_if_missing(p_user_id, v_ach_id); END IF;
    
    -- 4. Social & Special
    IF v_linkedin_url IS NOT NULL AND v_linkedin_url != '' THEN v_ach_id := 'connected'; PERFORM public.award_achievement_if_missing(p_user_id, v_ach_id); END IF;
    IF v_created_at < '2025-03-01'::TIMESTAMP THEN v_ach_id := 'early_adopter'; PERFORM public.award_achievement_if_missing(p_user_id, v_ach_id); END IF;

    RETURN jsonb_build_object('status', 'success');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to award achievement if not already earned
CREATE OR REPLACE FUNCTION public.award_achievement_if_missing(p_user_id UUID, p_achievement_id TEXT)
RETURNS VOID AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM public.user_achievements 
        WHERE user_id = p_user_id AND achievement_id = p_achievement_id
    ) THEN
        INSERT INTO public.user_achievements (id, user_id, achievement_id, earned_at)
        VALUES (gen_random_uuid(), p_user_id, p_achievement_id, NOW());
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
