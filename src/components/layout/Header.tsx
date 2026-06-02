"use client";

import { Bell, Search } from "lucide-react";

interface HeaderProps {
  user: {
    name?: string | null;
    email: string;
  };
}

export default function Header({ user }: HeaderProps) {
  return (
    <header className="h-16 bg-white border-b border-border flex items-center justify-between px-8">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
          <input
            type="text"
            placeholder="Cari makanan..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-border bg-bg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 rounded-xl hover:bg-bg transition-colors">
          <Bell className="w-5 h-5 text-text-muted" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <span className="text-primary font-medium">
              {user.name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="hidden md:block">
            <p className="font-medium text-sm">{user.name || "Pengguna"}</p>
            <p className="text-xs text-text-muted">{user.email}</p>
          </div>
        </div>
      </div>
    </header>
  );
}