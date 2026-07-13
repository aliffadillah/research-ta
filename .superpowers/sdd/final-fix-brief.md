# Final Fix: Critical Issues

## Issues to Fix

### 1. Tablet sidebar/content overlap (CRITICAL)
**File:** `src/app/dashboard/ClientDashboardLayout.tsx`
**Problem:** Sidebar renders at w-16 (64px) on tablet, but mainMarginClass is ml-0 for both mobile and tablet.
**Fix:** Change mainMarginClass logic:
```typescript
const mainMarginClass = isMobile ? "ml-0" : isTablet ? "ml-16" : "ml-64";
```

### 2. Card component breakpoint mismatch (CRITICAL)
**File:** `src/components/ui/index.tsx`
**Problem:** Card uses `md:grid-cols-2` (768px) but tablet starts at 640px (sm:).
**Fix:** Change to `sm:grid-cols-2 lg:grid-cols-4`

### 3. Hamburger button accessibility (IMPORTANT)
**File:** `src/components/layout/Header.tsx`
**Problem:** Missing aria-expanded and aria-controls.
**Fix:** Add `aria-expanded={false}` and `aria-controls="mobile-menu"`

### 4. MobileMenu drawer accessibility (IMPORTANT)
**File:** `src/components/layout/MobileMenu.tsx`
**Problem:** Missing role and aria-label on drawer aside.
**Fix:** Add `role="dialog"`, `aria-label="Menu navigasi"`, `aria-modal="true"`, and `id="mobile-menu"`

## Steps

1. Read and fix `src/app/dashboard/ClientDashboardLayout.tsx`
2. Read and fix `src/components/ui/index.tsx`
3. Read and fix `src/components/layout/Header.tsx`
4. Read and fix `src/components/layout/MobileMenu.tsx`
5. Test: `npx tsc --noEmit`
6. Commit: `git add -A && git commit -m "fix: tablet sidebar margin, card breakpoints, accessibility"`
