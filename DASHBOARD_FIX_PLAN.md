# Plan: Dashboard UX Fixes & Invite URL Issue

## Issues Identified

### 1. Invite URL Missing Unique Code
**Location**: `src/components/dashboard/InviteSection.tsx:13`

The invite link uses `profile?.referral_code || ''`. If the profile doesn't have a referral_code, the URL will be malformed (e.g., `https://sintropia.space/register?ref=`).

**Root Cause**: 
- The migration creates a trigger to generate referral_code on new profiles, but existing profiles may not have one
- The trigger `on_profile_created_referral` only fires on INSERT, not on existing records

### 2. Dashboard UX Issues
Potential issues based on code review:
- Grid layout responsiveness at different breakpoints
- Dark mode styling inconsistencies  
- Complex nested layouts in profile card (lines 106-149)
- Avatar/badge positioning may break on mobile
- Stats section grid (3 columns) may overflow on small screens

---

## Step-by-Step Plan

### Phase 1: Diagnose the Invite URL Issue

**Step 1.1**: Check database for profiles missing referral_code
```sql
SELECT id, username, referral_code 
FROM profiles 
WHERE referral_code IS NULL OR referral_code = '';
```

**Step 1.2**: If missing codes found, generate them
```sql
-- Run the migration function to generate codes for existing profiles
UPDATE profiles SET referral_code = public.generate_referral_code() 
WHERE referral_code IS NULL;
```

**Step 1.3**: Verify the fix works by checking a user's dashboard

---

### Phase 2: Fix Invite Section Component

**Step 2.1**: Add error handling in InviteSection.tsx
- Show placeholder message if referral_code is empty
- Disable copy button if no code available

**Step 2.2**: Consider server-side URL generation
- Instead of using `window.location.origin`, pass the full URL from server component

---

### Phase 3: Diagnose Dashboard UX Issues

**Step 3.1**: Test page at different viewport sizes
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

**Step 3.2**: Check browser console for errors
- Open DevTools (F12) → Console tab

**Step 3.3**: Test dark mode
- Toggle dark mode in the app
- Check for contrast issues, missing styles

---

### Phase 4: Fix Dashboard UX Issues (Based on Findings)

**Step 4.1**: Fix profile card responsive layout
- Ensure avatar doesn't overflow on mobile
- Fix stats grid to stack on small screens

**Step 4.2**: Fix grid gaps and spacing
- Review `gap-6`, `gap-8` values at different breakpoints

**Step 4.3**: Fix text overflow issues
- Add `break-words` or `whitespace-normal` where needed
- Truncate long usernames properly

**Step 4.4**: Fix dark mode specific issues
- Check all `dark:` utility classes are working
- Verify background colors apply correctly

---

### Phase 5: Verify & Test

**Step 5.1**: Run lint/typecheck
```bash
npm run lint
npm run typecheck
```

**Step 5.2**: Test in browser
- Verify invite link shows correct code
- Check all dashboard sections render correctly
- Test responsive behavior

**Step 5.3**: Test on multiple browsers if possible

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/dashboard/InviteSection.tsx` | Add null check, handle missing code |
| `src/app/[locale]/(dashboard)/dashboard/page.tsx` | Possibly pass full URL to InviteSection |
| `src/app/globals.css` | Add any missing responsive styles |

---

## Notes

- Tailwind CSS v4 is being used with custom `@theme` configuration
- The dashboard uses SSR (server components), so client-side issues may need React hooks debugging
- Dark mode is controlled via CSS classes on the `html` element
