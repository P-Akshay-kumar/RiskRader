import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        industrial: {
          950: "#060911", // Pitch dark obsidian background
          900: "#090D16", // Main dark canvas
          850: "#0F1623", // Card base dark
          800: "#151F32", // Card hover / elevated
          700: "#1F2E4A", // High contrast border / divider
          600: "#2B3F63", // Interactive border
          400: "#64748B", // Muted subtitle text
          200: "#CBD5E1", // Secondary body text
          50: "#F8FAFC",  // Primary bright text
        },
        safety: {
          orange: "#FF6B00", // Vibrant industrial signal orange accent
          amber: "#F59E0B",  // Warning hazard amber
          yellow: "#EAB308", // Alert indicator yellow
          red: "#EF4444",    // Critical risk red
          emerald: "#10B981",// Normal operating state emerald
          cyan: "#06B6D4",   // Tech telemetry cyan
        }
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        display: ["var(--font-space-grotesk)", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      backgroundImage: {
        "grid-pattern": "radial-gradient(rgba(255, 107, 0, 0.08) 1px, transparent 1px)",
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "industrial-glow": "radial-gradient(circle at 50% 0%, rgba(255, 107, 0, 0.15) 0%, transparent 60%)",
      },
      animation: {
        "radar-spin": "radarSweep 6s linear infinite",
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float-gentle": "float 6s ease-in-out infinite",
        "glow-fade": "glow 3s ease-in-out infinite alternate",
      },
      keyframes: {
        radarSweep: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        glow: {
          "0%": { opacity: "0.4", filter: "drop-shadow(0 0 15px rgba(255, 107, 0, 0.3))" },
          "100%": { opacity: "0.9", filter: "drop-shadow(0 0 25px rgba(255, 107, 0, 0.6))" },
        }
      }
    },
  },
  plugins: [],
};
export default config;
