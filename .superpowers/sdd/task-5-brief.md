# Task 5: Create MobileMenu Component

**Files:**
- Create: `src/components/layout/MobileMenu.tsx`
- Create: `src/styles/mobile-menu.module.css`

**Interfaces:**
- Props: `{ isOpen: boolean, onClose: () => void }`
- Consumes: Navigation items from Sidebar

## Steps

- [ ] **Step 1: Create src/styles directory**

```bash
mkdir -p src/styles
```

- [ ] **Step 2: Create mobile-menu.module.css**

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
  width: 256px;
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

- [ ] **Step 3: Create MobileMenu component**

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

- [ ] **Step 4: Test compilation**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 5: Commit**

```bash
git add src/styles/mobile-menu.module.css src/components/layout/MobileMenu.tsx
git commit -m "feat: add MobileMenu drawer component for mobile navigation"
```
