# Task 2: Create useBreakpoint Hook

**Files:**
- Create: `src/hooks/useBreakpoint.ts`
- Create: `src/hooks/index.ts`

**Interfaces:**
- Consumes: `useMediaQuery` from Task 1
- Produces: `useBreakpoint(): { breakpoint: Breakpoint, isMobile: boolean, isTablet: boolean, isDesktop: boolean }`

**Breakpoint Type:**
```typescript
export type Breakpoint = "mobile" | "tablet" | "desktop";
```

## Steps

- [ ] **Step 1: Create useBreakpoint hook**

Create `src/hooks/useBreakpoint.ts`:
```typescript
"use client";

import { useMediaQuery } from "./useMediaQuery";

export type Breakpoint = "mobile" | "tablet" | "desktop";

interface UseBreakpointReturn {
  breakpoint: Breakpoint;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

/**
 * Hook to detect current breakpoint
 * - mobile: < 640px
 * - tablet: 640px - 1024px
 * - desktop: > 1024px
 */
export function useBreakpoint(): UseBreakpointReturn {
  const isMobile = useMediaQuery("(max-width: 639px)");
  const isTablet = useMediaQuery("(min-width: 640px) and (max-width: 1023px)");
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  const breakpoint: Breakpoint = isDesktop 
    ? "desktop" 
    : isTablet 
      ? "tablet" 
      : "mobile";

  return {
    breakpoint,
    isMobile,
    isTablet,
    isDesktop,
  };
}
```

- [ ] **Step 2: Create hooks barrel export**

Create `src/hooks/index.ts`:
```typescript
export { useMediaQuery } from "./useMediaQuery";
export { useBreakpoint, type Breakpoint } from "./useBreakpoint";
```

- [ ] **Step 3: Test compilation**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add src/hooks/
git commit -m "feat: add useBreakpoint hook and hooks barrel export"
```
