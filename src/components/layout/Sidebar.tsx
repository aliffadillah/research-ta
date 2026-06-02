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
} from "lucide-react";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils/helpers";

const navItems = [
  { href: "/dashboard", icon: Home, label: "Dashboard" },
  { href: "/dashboard/detect", icon: Camera, label: "Deteksi" },
  { href: "/dashboard/history", icon: History, label: "Riwayat" },
  { href: "/dashboard/menu-harian", icon: Utensils, label: "Menu Harian" },
  { href: "/dashboard/foods", icon: Apple, label: "Daftar Makanan" },
  { href: "/dashboard/referensi-akg", icon: BookOpen, label: "Referensi AKG" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-border flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-display">Makan Bergizi</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "nav-item",
                isActive && "nav-item-active"
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-border space-y-1">
        <Link
          href="/dashboard/settings"
          className="nav-item"
        >
          <Settings className="w-5 h-5" />
          <span>Pengaturan</span>
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="nav-item w-full text-red-600 hover:bg-red-50"
        >
          <LogOut className="w-5 h-5" />
          <span>Keluar</span>
        </button>
      </div>
    </aside>
  );
}