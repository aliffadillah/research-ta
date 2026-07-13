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
  const mainMarginClass = isMobile ? "ml-0" : isTablet ? "ml-16" : "ml-64";

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
