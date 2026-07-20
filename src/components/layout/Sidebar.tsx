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
            Nutrima
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
              title={isTablet ? item.label : undefined}
              className={cn(
                "nav-item",
                isActive && "nav-item-active",
                isTablet && "justify-center px-2"
              )}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
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
          className={cn("nav-item", isTablet && "justify-center px-2")}
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
