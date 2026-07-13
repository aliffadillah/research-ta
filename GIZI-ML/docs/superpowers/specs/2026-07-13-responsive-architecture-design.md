# Responsive Design Architecture Design

**Date:** 2026-07-13  
**Project:** GIZI-ML (Next.js 14 + Tailwind CSS)  
**Status:** Approved

---

## 1. Overview

Menerapkan responsive design system yang mendukung mobile, tablet, dan desktop pada aplikasi GIZI-ML dengan arsitektur kode yang modular dan maintainable.

---

## 2. Goals

- **Device Support:** Mobile (<640px), Tablet (640-1024px), Desktop (>1024px)
- **Modular Code:** Pecah kode responsive menjadi komponen kecil yang reusable
- **Maintainable:** Mudah di-maintain dan di-extend
- **Performance:** Zero runtime overhead untuk responsive logic

---

## 3. Breakpoints

| Device | Width | Tailwind Prefix | Use Case |
|--------|-------|-----------------|----------|
| Mobile | < 640px | (default) | Phone |
| Tablet | 640px - 1024px | `md:` | iPad, small laptop |
| Desktop | > 1024px | `lg:` | Desktop, large screen |

---

## 4. Architecture

### 4.1 File Structure

```
src/
├── components/
│   ├── ui/                        # Base UI Components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   └── index.ts
│   ├── layout/                    # Layout Components
│   │   ├── Sidebar.tsx           # Responsive sidebar → hamburger
│   │   ├── Header.tsx            # Adaptive header
│   │   ├── MobileMenu.tsx        # Mobile drawer menu
│   │   └── index.ts
│   └── features/                  # Feature Components (split per feature)
│       ├── dashboard/
│       ├── detect/
│       ├── foods/
│       └── ...
├── hooks/                          # Custom Hooks
│   ├── useMediaQuery.ts           # Hook for responsive state
│   └── useBreakpoint.ts            # Breakpoint detection
├── lib/
│   └── responsive-utils.ts        # Tailwind class utilities
└── styles/
    └── responsive.module.css      # CSS Modules for complex patterns
```

### 4.2 Component Categories

| Category | Purpose | Example |
|----------|---------|---------|
| **UI Primitives** | Reusable atoms | Button, Card, Input, Badge |
| **Layout Components** | Page structure | Sidebar, Header, MobileMenu |
| **Feature Components** | Business logic | DetectionResult, NutritionCard |

---

## 5. Components Detail

### 5.1 Custom Hooks

#### `useMediaQuery.ts`
```typescript
// Hook untuk detect current breakpoint
export function useMediaQuery(query: string): boolean
export function useBreakpoint(): 'mobile' | 'tablet' | 'desktop'
```

#### `useBreakpoint.ts`
```typescript
// Convenience hook untuk responsive logic
const { isMobile, isTablet, isDesktop } = useBreakpoint()
```

### 5.2 Layout Components

#### Sidebar.tsx
| State | Desktop (>1024px) | Tablet (640-1024px) | Mobile (<640px) |
|-------|-------------------|---------------------|-----------------|
| Default | Visible (w-64) | Collapsed (icons only, w-16) | Hidden |
| Expanded | Full | Expanded (w-64) | Full overlay |
| Trigger | Always visible | Hover/click to expand | Hamburger button |

#### MobileMenu.tsx
| State | Behavior |
|-------|----------|
| Closed | Hidden, transform off-canvas |
| Open | Slide in from left, backdrop overlay |
| Close | Click outside / close button / link click |

#### Header.tsx
| Desktop | Tablet | Mobile |
|---------|--------|--------|
| Full search bar | Condensed | Hamburger + minimal |

### 5.3 UI Primitives (Refactored)

#### Card.tsx
```tsx
// Desktop: horizontal layout, grid
// Mobile: vertical stack
<Card responsive variant="stat">
  <CardHeader>Title</CardHeader>
  <CardContent className="md:grid md:grid-cols-2">
    {/* Responsive content */}
  </CardContent>
</Card>
```

#### Button.tsx
```tsx
// Mobile: Full width
// Desktop: Auto width
<Button responsive size="md" fullWidthOnMobile>
  Action
</Button>
```

---

## 6. Responsive Patterns

### 6.1 Layout Pattern
```tsx
// Dashboard layout - responsive grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  {/* Cards stack on mobile, 2 cols on tablet, 4 on desktop */}
</div>
```

### 6.2 Navigation Pattern
```tsx
// Sidebar transforms to hamburger menu
<div className="hidden lg:block">{/* Desktop sidebar */}</div>
<div className="lg:hidden">{/* Mobile menu */}</div>
```

### 6.3 Typography Pattern
```tsx
// Text scales per breakpoint
<h1 className="text-2xl md:text-4xl lg:text-5xl">
  Responsive Heading
</h1>
```

---

## 7. Implementation Order

### Phase 1: Foundation
1. Create `useMediaQuery.ts` and `useBreakpoint.ts` hooks
2. Create responsive utility functions in `lib/responsive-utils.ts`
3. Update Tailwind config with responsive utilities

### Phase 2: Layout Components
1. Refactor `Sidebar.tsx` - Add responsive behavior + hamburger menu
2. Create `MobileMenu.tsx` - Drawer component
3. Update `Header.tsx` - Mobile adaptation
4. Update `dashboard/layout.tsx` - Responsive wrapper

### Phase 3: UI Components
1. Refactor `Card.tsx` - Add responsive variants
2. Refactor `Button.tsx` - Add responsive props
3. Update other UI primitives

### Phase 4: Page Adaptation
1. Landing page (`/`)
2. Dashboard main page
3. Detect page
4. Foods page
5. History page
6. Other pages

---

## 8. Tailwind Configuration

### Extended in `tailwind.config.ts`
```typescript
theme: {
  screens: {
    'mobile': '320px',
    'tablet': '640px',
    'desktop': '1024px',
    'wide': '1280px',
  },
  extend: {
    spacing: {
      'sidebar': '16rem', // 256px
      'sidebar-collapsed': '4rem', // 64px
    },
    maxWidth: {
      'container': '1280px',
    }
  }
}
```

---

## 9. Testing Checklist

- [ ] Sidebar visible on desktop (>1024px)
- [ ] Sidebar collapsed icons on tablet (640-1024px)
- [ ] Hamburger menu on mobile (<640px)
- [ ] Mobile menu slides in/out smoothly
- [ ] Cards stack vertically on mobile
- [ ] Grid layouts adapt per breakpoint
- [ ] Typography scales appropriately
- [ ] Touch targets adequate on mobile (min 44px)
- [ ] No horizontal scroll on mobile

---

## 10. Success Criteria

1. ✅ Fully responsive on mobile, tablet, desktop
2. ✅ Code organized into modular components
3. ✅ No single file exceeds reasonable line count
4. ✅ Consistent responsive patterns across app
5. ✅ Smooth transitions between breakpoints
6. ✅ Maintainable and extensible architecture

---

## 11. Files to Modify

| File | Action | Priority |
|------|--------|----------|
| `src/hooks/useMediaQuery.ts` | Create | 1 |
| `src/hooks/useBreakpoint.ts` | Create | 1 |
| `src/lib/responsive-utils.ts` | Create | 1 |
| `src/components/layout/Sidebar.tsx` | Refactor | 2 |
| `src/components/layout/MobileMenu.tsx` | Create | 2 |
| `src/components/layout/Header.tsx` | Refactor | 2 |
| `src/app/dashboard/layout.tsx` | Update | 2 |
| `src/components/ui/Card.tsx` | Refactor | 3 |
| `src/components/ui/Button.tsx` | Refactor | 3 |
| `tailwind.config.ts` | Update | 1 |

---

*Design approved on 2026-07-13*
