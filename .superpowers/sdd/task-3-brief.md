# Task 3: Create Responsive Utilities

**Files:**
- Create: `src/lib/responsive-utils.ts`

**Interfaces:**
- Produces: `cn()`, `responsive()`, `responsiveSpacing`, `responsiveGrid` utilities

## Steps

- [ ] **Step 1: Create responsive utilities**

Create `src/lib/responsive-utils.ts`:
```typescript
import { clsx, type ClassValue } from "clsx";

/**
 * Tailwind class merger (alias for clsx)
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/**
 * Responsive class object for conditional styling
 * Usage: cnResponsive({ base: "p-4", md: "p-6", lg: "p-8" })
 */
export type ResponsiveClasses = {
  base?: string;
  sm?: string;
  md?: string;
  lg?: string;
  xl?: string;
  "2xl"?: string;
};

/**
 * Convert responsive class object to Tailwind string
 */
export function responsive(classes: ResponsiveClasses): string {
  return Object.entries(classes)
    .filter(([_, value]) => value !== undefined)
    .map(([key, value]) => {
      if (key === "base") return value;
      return `${key}:${value}`;
    })
    .join(" ");
}

/**
 * Responsive spacing values
 */
export const responsiveSpacing = {
  container: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
  card: "p-4 sm:p-6 lg:p-8",
  section: "py-6 sm:py-8 lg:py-12",
} as const;

/**
 * Responsive grid values
 */
export const responsiveGrid = {
  stats: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  cards: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
  features: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
} as const;
```

- [ ] **Step 2: Check if clsx is installed**

Run: `grep "clsx" package.json`
If not found, install it:
```bash
npm install clsx
```

- [ ] **Step 3: Test compilation**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add src/lib/responsive-utils.ts
git commit -m "feat: add responsive utilities and constants"
```
