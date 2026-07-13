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
