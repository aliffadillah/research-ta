# Task 8: Update Dashboard Layout

**Files:**
- Modify: `src/app/dashboard/layout.tsx`

**Interfaces:**
- Adds: Mobile menu open/close state management
- Integrates: MobileMenu component

## Steps

- [ ] **Step 1: Read current dashboard layout**

Read `src/app/dashboard/layout.tsx` first.

- [ ] **Step 2: Replace dashboard layout**

The current layout is a server component. We need to convert to a hybrid approach with a client wrapper for state management.

Replace `src/app/dashboard/layout.tsx` with:
```typescript
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import ClientDashboardLayout from "./ClientDashboardLayout";

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
```

- [ ] **Step 3: Create ClientDashboardLayout**

Create `src/app/dashboard/ClientDashboardLayout.tsx`:
```typescript
"use client";

import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import MobileMenu from "@/components/layout/MobileMenu";
import { useBreakpoint } from "@/hooks";
import { cn } from "@/lib/utils/helpers";

interface ClientDashboardLayoutProps {
  children: React.ReactNode;
  user: {
    name?: string | null;
    email: string;
  };
}

export default function ClientDashboardLayout({
  children,
  user,
}: ClientDashboardLayoutProps) {
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

- [ ] **Step 4: Test compilation**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 5: Commit**

```bash
git add src/app/dashboard/layout.tsx src/app/dashboard/ClientDashboardLayout.tsx
git commit -m "feat(dashboard): integrate mobile menu with responsive layout"
```
