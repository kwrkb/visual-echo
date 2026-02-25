import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ve: {
          bg: "var(--ve-bg)",
          "bg-muted": "var(--ve-bg-muted)",
          surface: "var(--ve-surface)",
          text: "var(--ve-text)",
          "text-muted": "var(--ve-text-muted)",
          "text-subtle": "var(--ve-text-subtle)",
          accent: "var(--ve-accent)",
          "accent-hover": "var(--ve-accent-hover)",
          "accent-light": "var(--ve-accent-light)",
          accent2: "var(--ve-accent2)",
          "accent2-light": "var(--ve-accent2-light)",
          border: "var(--ve-border)",
          "border-hover": "var(--ve-border-hover)",
          success: "var(--ve-success)",
          warning: "var(--ve-warning)",
          error: "var(--ve-error)",
        },
      },
      boxShadow: {
        "ve-sm": "0 1px 3px rgba(139, 126, 112, 0.08), 0 1px 2px rgba(139, 126, 112, 0.06)",
        "ve-md": "0 4px 12px rgba(139, 126, 112, 0.1), 0 2px 4px rgba(139, 126, 112, 0.06)",
        "ve-lg": "0 12px 32px rgba(139, 126, 112, 0.12), 0 4px 8px rgba(139, 126, 112, 0.08)",
      },
      animation: {
        "fade-up": "fade-up 0.5s ease-out both",
        ripple: "ripple 2s ease-out infinite",
        shimmer: "shimmer 1.5s ease-in-out infinite",
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        ripple: {
          "0%": { transform: "scale(0.8)", opacity: "0.6" },
          "100%": { transform: "scale(2.4)", opacity: "0" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
