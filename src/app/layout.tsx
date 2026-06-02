import type { Metadata } from "next";
import { DM_Serif_Display, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

const dmSerif = DM_Serif_Display({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-dm-serif",
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Makan Bergizi - Deteksi Nutrisi Makanan",
  description: "Sistem deteksi makanan dan pelacakan nutrisi untuk program makan bergizi gratis",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${dmSerif.variable} ${plusJakarta.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen bg-bg">
        <Providers>
          <div className="grain-overlay" aria-hidden="true" />
          {children}
        </Providers>
      </body>
    </html>
  );
}