# Task 1: Create useMediaQuery Hook

**Files:**
- Create: `src/hooks/useMediaQuery.ts`

**Interfaces:**
- Produces: `useMediaQuery(query: string): boolean`

## Steps

- [ ] **Step 1: Create hook file**

Create `src/hooks/useMediaQuery.ts`:
```typescript
"use client";

import { useState, useEffect } from "react";

/**
 * Hook to detect if a media query matches
 * @param query - CSS media query string (e.g., "(min-width: 1024px)")
 * @returns boolean indicating if the query matches
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // Check if window is available (client-side)
    if (typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia(query);
    
    // Set initial value
    setMatches(mediaQuery.matches);

    // Create event listener
    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Add listener with modern API
    mediaQuery.addEventListener("change", handler);

    // Cleanup
    return () => {
      mediaQuery.removeEventListener("change", handler);
    };
  }, [query]);

  return matches;
}
```

- [ ] **Step 2: Test the hook compiles**

Run: `npx tsc --noEmit src/hooks/useMediaQuery.ts`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useMediaQuery.ts
git commit -m "feat: add useMediaQuery hook for responsive detection"
```
