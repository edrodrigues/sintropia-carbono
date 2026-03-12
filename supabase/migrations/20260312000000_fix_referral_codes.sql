-- Migration: Fix missing referral codes for existing profiles
-- Date: 2026-03-12

UPDATE public.profiles
SET referral_code = public.generate_referral_code()
WHERE referral_code IS NULL OR referral_code = '';
