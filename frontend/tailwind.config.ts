import type { Config } from "tailwindcss";

/**
 * GeoMap — design tokens.
 *
 * Color values live as CSS custom properties in app/globals.css (`:root`
 * for light, `.dark` for dark) so a single class flip re-themes the whole
 * tree. Tailwind maps semantic names onto those variables here.
 *
 * darkMode: "class" → toggle by adding/removing `dark` on <html>.
 */
const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        surface: {
          DEFAULT: "var(--surface)",
          2: "var(--surface-2)",
          3: "var(--surface-3)",
        },
        border: {
          DEFAULT: "var(--border)",
          strong: "var(--border-2)",
        },
        ink: {
          DEFAULT: "var(--ink)",
          soft: "var(--ink-2)",
          muted: "var(--ink-muted)",
          faint: "var(--ink-faint)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          strong: "var(--primary-strong)",
          50: "var(--primary-50)",
          100: "var(--primary-100)",
          fg: "var(--on-primary)",
        },
        success: { DEFAULT: "var(--success)", soft: "var(--success-soft)" },
        warning: { DEFAULT: "var(--warning)", soft: "var(--warning-soft)" },
        danger: { DEFAULT: "var(--danger)", soft: "var(--danger-soft)" },
        accent: { DEFAULT: "var(--accent)" },
        // stylized map preview palette
        map: {
          bg: "var(--map-bg)",
          park: "var(--map-park)",
          water: "var(--map-water)",
          street: "var(--map-street)",
          label: "var(--map-label)",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
      },
      fontSize: {
        // tuned for the dense SaaS dashboard
        xs: ["0.75rem", { lineHeight: "1rem" }],
        sm: ["0.8125rem", { lineHeight: "1.15rem" }],
        base: ["0.875rem", { lineHeight: "1.4rem" }],
      },
      borderRadius: {
        chip: "7px",
        control: "10px",
        card: "14px",
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        card: "var(--shadow-card)",
        lift: "var(--shadow-lift)",
        pop: "var(--shadow-pop)",
      },
      ringColor: {
        DEFAULT: "var(--ring)",
      },
      keyframes: {
        pulseDot: {
          "0%,100%": { opacity: "1" },
          "50%": { opacity: "0.35" },
        },
      },
      animation: {
        pulseDot: "pulseDot 1.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
