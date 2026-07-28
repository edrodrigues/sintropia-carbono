-- Migration: Invite Functionality
-- Date: 2026-03-10

-- Add referral columns to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS referral_reward_claimed BOOLEAN DEFAULT FALSE;

-- Create index for referral code
CREATE INDEX IF NOT EXISTS idx_profiles_referral_code ON public.profiles(referral_code);

-- Add policy to allow users to read their own referral info (already covered by "Public profiles are viewable by everyone" or similar usually, but let's be safe)
-- Assuming there's a general policy for profiles.

-- Function to generate a random referral code
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TEXT AS $$
DECLARE
    v_code TEXT;
    v_exists BOOLEAN;
BEGIN
    LOOP
        v_code := upper(substring(md5(random()::text) from 1 for 8));
        SELECT EXISTS (SELECT 1 FROM public.profiles WHERE referral_code = v_code) INTO v_exists;
        EXIT WHEN NOT v_exists;
    END LOOP;
    RETURN v_code;
END;
$$ LANGUAGE plpgsql VOLATILE;

-- Trigger to set referral code on creation if not provided
CREATE OR REPLACE FUNCTION public.handle_new_user_referral()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.referral_code IS NULL THEN
        NEW.referral_code := public.generate_referral_code();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_profile_created_referral ON public.profiles;
CREATE TRIGGER on_profile_created_referral
    BEFORE INSERT ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user_referral();

-- Update existing users with a referral code
UPDATE public.profiles SET referral_code = public.generate_referral_code() WHERE referral_code IS NULL;

-- Function to handle new profile and set referred_by from metadata
CREATE OR REPLACE FUNCTION public.handle_profile_referral_from_metadata()
RETURNS TRIGGER AS $$
DECLARE
    v_referrer_id UUID;
    v_referral_code TEXT;
BEGIN
    v_referral_code := NEW.raw_user_meta_data->>'referred_by_code';

    IF v_referral_code IS NOT NULL THEN
        SELECT id INTO v_referrer_id FROM public.profiles WHERE referral_code = v_referral_code;

        IF v_referrer_id IS NOT NULL THEN
            UPDATE public.profiles SET referred_by = v_referrer_id WHERE id = NEW.id;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Since profiles are usually created via a trigger on auth.users, we should ideally hook into that or run this after.
-- Let's check if there's an existing trigger on auth.users to create profiles.

-- Re-implement handle_new_user to include referral if it's the one creating profiles
-- Typically it looks like this:
/*
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name, avatar_url, referred_by)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'username',
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url',
    (SELECT id FROM public.profiles WHERE referral_code = (NEW.raw_user_meta_data->>'referred_by_code'))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
*/

-- Alternatively, we can just update the profile after it's created if we don't want to mess with existing triggers.
-- We'll add a trigger to public.profiles that checks for the metadata if it's available,
-- but auth metadata isn't directly available in public.profiles triggers easily without extra steps.
-- Best is to update the handle_new_user function if we can find it, or use a separate trigger on auth.users.

DROP TRIGGER IF EXISTS on_auth_user_created_referral ON auth.users;
CREATE TRIGGER on_auth_user_created_referral
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_profile_referral_from_metadata();

-- Function to claim referral reward
CREATE OR REPLACE FUNCTION public.claim_referral_reward(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_referred_by UUID;
    v_reward_claimed BOOLEAN;
    v_inviter_count INT;
    v_result JSONB;
BEGIN
    -- Get referral info for the user
    SELECT referred_by, referral_reward_claimed INTO v_referred_by, v_reward_claimed
    FROM public.profiles
    WHERE id = p_user_id;

    -- If no referrer or already claimed, return
    IF v_referred_by IS NULL OR v_reward_claimed = TRUE THEN
        RETURN jsonb_build_object('status', 'already_claimed_or_no_referrer');
    END IF;

    -- Check if inviter has reached the limit (20)
    SELECT COUNT(*) INTO v_inviter_count
    FROM public.profiles
    WHERE referred_by = v_referred_by AND referral_reward_claimed = TRUE;

    -- Award to invitee (always)
    UPDATE public.profiles
    SET karma = COALESCE(karma, 0) + 50,
        referral_reward_claimed = TRUE
    WHERE id = p_user_id;

    INSERT INTO public.karma_transactions (user_id, amount, reason, created_at)
    VALUES (p_user_id, 50, 'Prêmio de indicação (Boas-vindas)', NOW());

    -- Award to inviter if under limit
    IF v_inviter_count < 20 THEN
        UPDATE public.profiles
        SET karma = COALESCE(karma, 0) + 50
        WHERE id = v_referred_by;

        INSERT INTO public.karma_transactions (user_id, amount, reason, created_at)
        VALUES (v_referred_by, 50, 'Bônus por indicação de novo usuário', NOW());

        v_result := jsonb_build_object('status', 'success', 'awarded_both', true);
    ELSE
        v_result := jsonb_build_object('status', 'success', 'awarded_both', false, 'reason', 'inviter_limit_reached');
    END IF;

    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
