import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#2D5A27",
          light: "#4A7C43",
          dark: "#1E3D1A",
        },
        accent: {
          DEFAULT: "#E8A838",
          soft: "#F5D89A",
        },
        bg: {
          DEFAULT: "#FAFAF7",
          card: "#FFFFFF",
        },
        border: "#E5E5DC",
        text: {
          DEFAULT: "#1A1A18",
          muted: "#6B6B63",
        },
      },
      fontFamily: {
        display: ["var(--font-dm-serif)", "serif"],
        body: ["var(--font-plus-jakarta)", "sans-serif"],
        mono: ["var(--font-jetbrains)", "monospace"],
      },
      borderRadius: {
        xl: "16px",
        "2xl": "24px",
      },
      boxShadow: {
        card: "0 2px 8px rgba(0, 0, 0, 0.06)",
        "card-hover": "0 8px 24px rgba(0, 0, 0, 0.1)",
        lift: "0 4px 16px rgba(0, 0, 0, 0.08)",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
        "scan": "scan 1.5s ease-in-out infinite",
        pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scan: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;