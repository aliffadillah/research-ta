# Responsive Design Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement responsive design system untuk GIZI-ML yang mendukung mobile (<640px), tablet (640-1024px), dan desktop (>1024px) dengan arsitektur kode modular.

**Architecture:** 
- Custom React hooks untuk breakpoint detection (`useMediaQuery`, `useBreakpoint`)
- Tailwind utility classes dengan breakpoint prefixes (`sm:`, `md:`, `lg:`)
- Layout components dengan responsive behavior (Sidebar → Mobile Menu)
- CSS Modules untuk complex responsive patterns

**Tech Stack:** Next.js 14, React 18, Tailwind CSS 3.4, TypeScript

---

## Global Constraints

- **Breakpoints:** mobile < 640px, tablet 640-1024px, desktop > 1024px
- **Min touch target:** 44px untuk mobile
- **Sidebar width (desktop):** w-64 (256px)
- **Sidebar collapsed (tablet):** w-16 (64px) with icons only
- **Mobile behavior:** Hidden sidebar, hamburger menu triggers drawer

---

## File Structure

```
src/
├── hooks/
│   ├── useMediaQuery.ts      # Hook for media query detection
│   └── useBreakpoint.ts      # Convenience hook for breakpoint
├── lib/
│   └── responsive-utils.ts   # Tailwind class utilities
├── components/
│   └── layout/
│       ├── Sidebar.tsx       # Responsive sidebar (refactor)
│       ├── Header.tsx        # Adaptive header (refactor)
│       └── MobileMenu.tsx    # NEW - Mobile drawer menu
└── styles/
    └── responsive.module.css # CSS Modules for mobile menu
```

---

## Implementation Tasks

### Task 1: Create useMediaQuery Hook

**Files:**
- Create: `src/hooks/useMediaQuery.ts`

**Interfaces:**
- Produces: `useMediaQuery(query: string): boolean`

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

---

### Task 2: Create useBreakpoint Hook

**Files:**
- Create: `src/hooks/useBreakpoint.ts`

**Interfaces:**
- Consumes: `useMediaQuery` from Task 1
- Produces: `useBreakpoint(): { breakpoint: Breakpoint, isMobile: boolean, isTablet: boolean, isDesktop: boolean }`

**Breakpoint Type:**
```typescript
export type Breakpoint = "mobile" | "tablet" | "desktop";
```

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

---

### Task 3: Create Responsive Utilities

**Files:**
- Create: `src/lib/responsive-utils.ts`

**Interfaces:**
- Produces: `cnResponsive()` helper for conditional responsive classes

- [ ] **Step 1: Create responsive utilities**

Create `src/lib/responsive-utils.ts`:
```typescript
import { clsx, type ClassValue } from "clsx";

/**
 * Tailwind class merger with responsive support
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

- [ ] **Step 2: Check if clsx is installed (used by cn)**

Run: `grep -r "clsx" package.json`
Expected: Should contain "clsx"

If not found, add it:
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

---

### Task 4: Update Tailwind Config

**Files:**
- Modify: `tailwind.config.ts`

**Interfaces:**
- Adds: Custom spacing for sidebar, responsive utilities

- [ ] **Step 1: Update tailwind.config.ts**

Modify `tailwind.config.ts` - add to `theme.extend`:
```typescript
theme: {
  extend: {
    // ... existing config ...
    
    // Sidebar widths
    width: {
      'sidebar': '16rem',      // 256px - full sidebar
      'sidebar-collapsed': '4rem', // 64px - collapsed sidebar
    },
    
    // Max widths
    maxWidth: {
      'container': '1280px',
      'content': '896px',
    },
    
    // Animation for mobile menu
    animation: {
      // ... existing ...
      'slide-in-left': 'slideInLeft 0.3s ease-out',
      'slide-out-left': 'slideOutLeft 0.3s ease-out',
    },
    keyframes: {
      // ... existing ...
      slideInLeft: {
        '0%': { transform: 'translateX(-100%)' },
        '100%': { transform: 'translateX(0)' },
      },
      slideOutLeft: {
        '0%': { transform: 'translateX(0)' },
        '100%': { transform: 'translateX(-100%)' },
      },
    },
  },
},
```

- [ ] **Step 2: Test compilation**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add tailwind.config.ts
git commit -m "feat(tailwind): add sidebar widths and mobile menu animations"
```

---

### Task 5: Create MobileMenu Component

**Files:**
- Create: `src/components/layout/MobileMenu.tsx`
- Create: `src/styles/mobile-menu.module.css`

**Interfaces:**
- Props: `{ isOpen: boolean, onClose: () => void }`
- Consumes: Navigation items from Sidebar

- [ ] **Step 1: Create CSS Module**

Create `src/styles/mobile-menu.module.css`:
```css
/* Mobile Menu Overlay */
.overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 40;
  animation: fadeIn 0.2s ease-out;
}

.overlay.closing {
  animation: fadeOut 0.2s ease-out;
}

/* Mobile Menu Drawer */
.drawer {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 64;
  background-color: white;
  z-index: 50;
  animation: slideInLeft 0.3s ease-out;
}

.drawer.closing {
  animation: slideOutLeft 0.3s ease-out;
}

/* Logo section */
.logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1.5rem;
  border-bottom: 1px solid #E5E5DC;
}

.logoIcon {
  width: 2.5rem;
  height: 2.5rem;
  background-color: #2D5A27;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

/* Navigation */
.nav {
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
}

.navItem {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  color: #6B6B63;
  font-weight: 500;
  transition: all 0.2s;
}

.navItem:hover {
  background-color: rgba(45, 90, 39, 0.05);
  color: #2D5A27;
}

.navItemActive {
  background-color: rgba(45, 90, 39, 0.1);
  color: #2D5A27;
}

/* Bottom section */
.bottomSection {
  padding: 1rem;
  border-top: 1px solid #E5E5DC;
}

.closeButton {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  width: 100%;
  color: #6B6B63;
  font-weight: 500;
  transition: all 0.2s;
}

.closeButton:hover {
  background-color: rgba(45, 90, 39, 0.05);
  color: #2D5A27;
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fadeOut {
  from { opacity: 1; }
  to { opacity: 0; }
}

@keyframes slideInLeft {
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
}

@keyframes slideOutLeft {
  from { transform: translateX(0); }
  to { transform: translateX(-100%); }
}
```

- [ ] **Step 2: Create MobileMenu component**

Create `src/components/layout/MobileMenu.tsx`:
```typescript
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Leaf,
  Home,
  Camera,
  History,
  Utensils,
  BookOpen,
  Settings,
  LogOut,
  Apple,
  Brain,
  Sparkles,
  X,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils/helpers";
import styles from "@/styles/mobile-menu.module.css";

const navItems = [
  { href: "/dashboard", icon: Home, label: "Dashboard" },
  { href: "/dashboard/detect", icon: Camera, label: "Deteksi" },
  { href: "/dashboard/history", icon: History, label: "Riwayat" },
  { href: "/dashboard/generate-menu", icon: Sparkles, label: "Generate Menu" },
  { href: "/dashboard/menu-harian", icon: Utensils, label: "Menu Harian" },
  { href: "/dashboard/nutrisi-harian", icon: Brain, label: "Nutrisi Harian" },
  { href: "/dashboard/foods", icon: Apple, label: "Daftar Makanan" },
  { href: "/dashboard/referensi-akg", icon: BookOpen, label: "Referensi AKG" },
];

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const pathname = usePathname();

  if (!isOpen) return null;

  const handleLinkClick = () => {
    onClose();
  };

  return (
    <>
      {/* Backdrop overlay */}
      <div 
        className={styles.overlay}
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Drawer */}
      <aside className={styles.drawer}>
        {/* Logo */}
        <div className={styles.logo}>
          <Link href="/dashboard" onClick={handleLinkClick}>
            <div className={styles.logoIcon}>
              <Leaf className="w-5 h-5" />
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className={styles.nav}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleLinkClick}
                className={cn(
                  styles.navItem,
                  isActive && styles.navItemActive
                )}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className={styles.bottomSection}>
          <Link
            href="/dashboard/settings"
            onClick={handleLinkClick}
            className={styles.navItem}
          >
            <Settings className="w-5 h-5" />
            <span>Pengaturan</span>
          </Link>
          <button
            onClick={() => {
              onClose();
              signOut({ callbackUrl: "/login" });
            }}
            className={cn(styles.navItem, "w-full text-red-600")}
          >
            <LogOut className="w-5 h-5" />
            <span>Keluar</span>
          </button>
        </div>
      </aside>
    </>
  );
}
```

- [ ] **Step 3: Ensure styles directory exists**

```bash
mkdir -p src/styles
```

- [ ] **Step 4: Test compilation**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 5: Commit**

```bash
git add src/styles/mobile-menu.module.css src/components/layout/MobileMenu.tsx
git commit -m "feat: add MobileMenu drawer component for mobile navigation"
```

---

### Task 6: Refactor Sidebar for Responsive Behavior

**Files:**
- Modify: `src/components/layout/Sidebar.tsx`

**Interfaces:**
- Desktop (>1024px): Full sidebar (w-64) with labels
- Tablet (640-1024px): Collapsed sidebar (w-16) with icons only
- Mobile (<640px): Hidden (handled by MobileMenu)

- [ ] **Step 1: Read current Sidebar**

The current Sidebar.tsx has been reviewed. Now refactor it.

- [ ] **Step 2: Replace Sidebar.tsx content**

Replace `src/components/layout/Sidebar.tsx` with:

```typescript
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Leaf,
  Home,
  Camera,
  History,
  Utensils,
  BookOpen,
  Settings,
  LogOut,
  Apple,
  Brain,
  Sparkles,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils/helpers";
import { useBreakpoint } from "@/hooks";

const navItems = [
  { href: "/dashboard", icon: Home, label: "Dashboard" },
  { href: "/dashboard/detect", icon: Camera, label: "Deteksi" },
  { href: "/dashboard/history", icon: History, label: "Riwayat" },
  { href: "/dashboard/generate-menu", icon: Sparkles, label: "Generate Menu" },
  { href: "/dashboard/menu-harian", icon: Utensils, label: "Menu Harian" },
  { href: "/dashboard/nutrisi-harian", icon: Brain, label: "Nutrisi Harian" },
  { href: "/dashboard/foods", icon: Apple, label: "Daftar Makanan" },
  { href: "/dashboard/referensi-akg", icon: BookOpen, label: "Referensi AKG" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { isDesktop, isTablet } = useBreakpoint();

  // On mobile, sidebar is hidden (mobile menu handles navigation)
  if (!isDesktop && !isTablet) {
    return null;
  }

  return (
    <aside 
      className={cn(
        "fixed left-0 top-0 h-screen bg-white border-r border-border flex flex-col",
        "transition-all duration-300 ease-in-out",
        // Desktop: Full width with labels
        isDesktop && "w-64",
        // Tablet: Collapsed with icons only
        isTablet && "w-16"
      )}
    >
      {/* Logo */}
      <div className={cn(
        "border-b border-border",
        isDesktop ? "p-6" : "p-3 justify-center flex"
      )}>
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center flex-shrink-0">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          {/* Hide label on tablet */}
          <span className={cn("text-xl font-sans", isTablet && "hidden")}>
            Makan Bergizi
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className={cn(
        "flex-1 py-4 overflow-y-auto",
        isDesktop ? "px-4 space-y-1" : "px-2 space-y-1"
      )}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              title={isTablet ? item.label : undefined} // Tooltip on tablet
              className={cn(
                "nav-item",
                isActive && "nav-item-active",
                // Adjust padding for collapsed state
                isTablet && "justify-center px-2"
              )}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {/* Hide label on tablet */}
              <span className={isTablet ? "hidden" : undefined}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className={cn(
        "border-t border-border py-4 space-y-1",
        isDesktop ? "px-4" : "px-2"
      )}>
        <Link
          href="/dashboard/settings"
          title={isTablet ? "Pengaturan" : undefined}
          className={cn(
            "nav-item",
            isTablet && "justify-center px-2"
          )}
        >
          <Settings className="w-5 h-5 flex-shrink-0" />
          <span className={isTablet ? "hidden" : undefined}>Pengaturan</span>
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          title={isTablet ? "Keluar" : undefined}
          className={cn(
            "nav-item w-full text-red-600 hover:bg-red-50",
            isTablet && "justify-center px-2"
          )}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          <span className={isTablet ? "hidden" : undefined}>Keluar</span>
        </button>
      </div>
    </aside>
  );
}
```

- [ ] **Step 3: Test compilation**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add src/components/layout/Sidebar.tsx
git commit -m "refactor(Sidebar): add responsive behavior for tablet collapse"
```

---

### Task 7: Refactor Header for Mobile

**Files:**
- Modify: `src/components/layout/Header.tsx`

**Interfaces:**
- Props: unchanged
- Desktop: Full search bar + user info
- Tablet: Condensed search + user info
- Mobile: Hamburger button + minimal user avatar

- [ ] **Step 1: Replace Header.tsx content**

Replace `src/components/layout/Header.tsx` with:

```typescript
"use client";

import { Bell, Search, Menu } from "lucide-react";
import { cn } from "@/lib/utils/helpers";
import { useBreakpoint } from "@/hooks";

interface HeaderProps {
  user: {
    name?: string | null;
    email: string;
  };
  onMenuClick?: () => void; // Mobile menu toggle
}

export default function Header({ user, onMenuClick }: HeaderProps) {
  const { isMobile, isTablet } = useBreakpoint();

  return (
    <header 
      className={cn(
        "h-16 bg-white border-b border-border flex items-center",
        // Responsive padding
        "px-4 md:px-6 lg:px-8"
      )}
    >
      {/* Left side - Mobile menu button or search */}
      <div className="flex items-center gap-4 flex-1">
        {/* Mobile: Show hamburger button */}
        {isMobile && (
          <button
            onClick={onMenuClick}
            className="p-2 -ml-2 rounded-lg hover:bg-bg transition-colors"
            aria-label="Buka menu"
          >
            <Menu className="w-6 h-6 text-text-muted" />
          </button>
        )}

        {/* Search bar - hide on mobile, show on tablet/desktop */}
        {!isMobile && (
          <div className={cn(
            "relative",
            // Full width on desktop, constrained on tablet
            isTablet ? "max-w-sm" : "max-w-md"
          )}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
            <input
              type="text"
              placeholder="Cari makanan..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-border bg-bg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
        )}
      </div>

      {/* Right side - Notifications and user */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Notifications */}
        <button 
          className="relative p-2 rounded-xl hover:bg-bg transition-colors"
          aria-label="Notifikasi"
        >
          <Bell className="w-5 h-5 text-text-muted" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full" />
        </button>

        {/* User info */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <span className="text-primary font-medium text-sm md:text-base">
              {user.name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
            </span>
          </div>
          
          {/* User details - hide on mobile */}
          <div className={cn("hidden sm:block")}>
            <p className="font-medium text-sm leading-tight">
              {user.name || "Pengguna"}
            </p>
            <p className="text-xs text-text-muted leading-tight hidden md:block">
              {user.email}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Test compilation**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/Header.tsx
git commit -m "refactor(Header): add responsive behavior with hamburger menu"
```

---

### Task 8: Update Dashboard Layout with Mobile Menu State

**Files:**
- Modify: `src/app/dashboard/layout.tsx`

**Interfaces:**
- Adds: Mobile menu open/close state management
- Integrates: MobileMenu component

- [ ] **Step 1: Replace dashboard layout**

Replace `src/app/dashboard/layout.tsx` with:

```typescript
"use client";

import { useState } from "react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import MobileMenu from "@/components/layout/MobileMenu";
import { useBreakpoint } from "@/hooks";
import { cn } from "@/lib/utils/helpers";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <ClientDashboardLayout user={session.user}>
      {children}
    </ClientDashboardLayout>
  );
}

// Client component for interactive state
function ClientDashboardLayout({
  children,
  user,
}: {
  children: React.ReactNode;
  user: {
    name?: string | null;
    email: string;
  };
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isMobile, isTablet } = useBreakpoint();

  // Calculate main content margin based on screen size
  const mainMarginClass = isMobile || isTablet ? "ml-0" : "ml-64";

  return (
    <div className="min-h-screen flex">
      {/* Desktop/Tablet Sidebar */}
      <Sidebar />
      
      {/* Mobile Menu Overlay */}
      <MobileMenu 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />

      {/* Main Content Area */}
      <div 
        className={cn(
          "flex-1 flex flex-col transition-all duration-300",
          mainMarginClass
        )}
      >
        {/* Header with mobile menu toggle */}
        <Header 
          user={user} 
          onMenuClick={() => setIsMobileMenuOpen(true)} 
        />
        
        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Test compilation**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/app/dashboard/layout.tsx
git commit -m "feat(dashboard): integrate mobile menu with responsive layout"
```

---

### Task 9: Add Responsive Card Variants

**Files:**
- Modify: `src/components/ui/index.tsx`

**Interfaces:**
- Add responsive prop to Card component for stacking on mobile

- [ ] **Step 1: Update Card component**

Find the Card function in `src/components/ui/index.tsx` and replace with:

```typescript
export function Card({
  className,
  children,
  hover = false,
  responsive = false, // NEW: Add responsive prop
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { 
  hover?: boolean;
  responsive?: boolean; // NEW
}) {
  return (
    <div
      className={cn(
        "bg-white rounded-2xl shadow-card p-6",
        hover && "transition-all duration-200 hover:shadow-card-hover hover:-translate-y-1",
        // NEW: Responsive layout classes
        responsive && "grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
```

- [ ] **Step 2: Test compilation**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/index.tsx
git commit -m "feat(ui): add responsive prop to Card component"
```

---

### Task 10: Update Sample Dashboard Page for Responsive Grid

**Files:**
- Modify: `src/app/dashboard/page.tsx`

**Interfaces:**
- Demonstrates responsive grid pattern for stat cards

- [ ] **Step 1: Read current dashboard page**

- [ ] **Step 2: Apply responsive grid pattern**

Look for stat cards grid and apply:
```tsx
// Change from:
<div className="grid grid-cols-4 gap-6">
// To:
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
```

- [ ] **Step 3: Commit**

```bash
git add src/app/dashboard/page.tsx
git commit -m "refactor(dashboard): apply responsive grid layout"
```

---

## Summary

| Task | File | Action |
|------|------|--------|
| 1 | `src/hooks/useMediaQuery.ts` | Create |
| 2 | `src/hooks/useBreakpoint.ts` | Create |
| 3 | `src/lib/responsive-utils.ts` | Create |
| 4 | `tailwind.config.ts` | Modify |
| 5 | `src/components/layout/MobileMenu.tsx` | Create |
| 6 | `src/components/layout/Sidebar.tsx` | Refactor |
| 7 | `src/components/layout/Header.tsx` | Refactor |
| 8 | `src/app/dashboard/layout.tsx` | Refactor |
| 9 | `src/components/ui/index.tsx` | Modify |
| 10 | `src/app/dashboard/page.tsx` | Modify |

---

## Testing Checklist

After implementation:
- [ ] Mobile (<640px): Hamburger menu appears, sidebar hidden
- [ ] Tablet (640-1024px): Collapsed sidebar with icons
- [ ] Desktop (>1024px): Full sidebar with labels
- [ ] Mobile menu slides in/out smoothly
- [ ] Cards stack vertically on mobile
- [ ] Grid layouts adapt per breakpoint
- [ ] No horizontal scroll on mobile
- [ ] Touch targets ≥44px on mobile
