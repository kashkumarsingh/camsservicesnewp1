import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "rgb(var(--brand-50))",
          100: "rgb(var(--brand-100))",
          200: "rgb(var(--brand-200))",
          300: "rgb(var(--brand-300))",
          400: "rgb(var(--brand-400))",
          500: "rgb(var(--brand-500))",
          600: "rgb(var(--brand-600))",
          700: "rgb(var(--brand-700))",
          800: "rgb(var(--brand-800))",
          900: "rgb(var(--brand-900))",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
      },
      fontSize: {
        display: ["var(--text-display)", { lineHeight: "var(--leading-tight)" }],
        title: ["var(--text-title)", { lineHeight: "var(--leading-tight)" }],
        body: ["var(--text-body)", { lineHeight: "var(--leading-normal)" }],
        ui: ["var(--text-ui)", { lineHeight: "var(--leading-normal)" }],
        caption: ["var(--text-caption)", { lineHeight: "var(--leading-normal)" }],
        micro: ["var(--text-micro)", { lineHeight: "var(--leading-normal)" }],
      },
      /* Centralised button/control heights – use with components. */
      spacing: {
        "button-sm-h": "1.75rem",
        "button-md-h": "2.25rem",
        "input-h": "2.25rem",
      },
    },
  },
  plugins: [],
};

export default config;

