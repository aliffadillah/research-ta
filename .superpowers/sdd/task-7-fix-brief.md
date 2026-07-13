# Task 7 Fix: Touch Target Size

## Issue Found

The hamburger button uses `p-2` (40px total) which is below the required 44px minimum touch target.

## Fix Required

In `src/components/layout/Header.tsx` line ~31:
- Change hamburger button from `p-2` to `p-3` (48px total)

Also fix the notifications button for consistency:
- Change from `p-2` to `p-3`

## Steps

1. Read `src/components/layout/Header.tsx`
2. Change `p-2` to `p-3` on hamburger button
3. Change `p-2` to `p-3` on notifications button
4. Test: `npx tsc --noEmit`
5. Commit: `git add src/components/layout/Header.tsx && git commit -m "fix(Header): increase touch target to 44px minimum"`
