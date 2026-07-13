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
        "px-4 md:px-6 lg:px-8"
      )}
    >
      {/* Left side - Mobile menu button or search */}
      <div className="flex items-center gap-4 flex-1">
        {/* Mobile: Show hamburger button */}
        {isMobile && (
          <button
            onClick={onMenuClick}
            className="p-3 -ml-3 rounded-lg hover:bg-bg transition-colors"
            aria-label="Buka menu"
          >
            <Menu className="w-6 h-6 text-text-muted" />
          </button>
        )}

        {/* Search bar - hide on mobile, show on tablet/desktop */}
        {!isMobile && (
          <div className={cn(
            "relative",
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
          className="relative p-3 rounded-xl hover:bg-bg transition-colors"
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
