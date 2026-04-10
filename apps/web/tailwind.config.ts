import type { Config } from "tailwindcss";

export default {
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "arc-bg": "#0f0f14",
        "arc-surface": "#1a1a24",
        "arc-accent": "var(--arc-accent, #3B82F6)",
        "arc-text": "#f0f0f5",
        "arc-muted": "#8888a0",
      },
      fontFamily: {
        title: ['"Bebas Neue"', '"Arial Black"', "sans-serif"],
        body: ["Inter", "system-ui", "sans-serif"],
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
} satisfies Config;
