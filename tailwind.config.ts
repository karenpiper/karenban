import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        chart: {
          "1": "var(--chart-1)",
          "2": "var(--chart-2)",
          "3": "var(--chart-3)",
          "4": "var(--chart-4)",
          "5": "var(--chart-5)",
        },
        // Override gray scale with softer, more muted values
        gray: {
          50: "oklch(0.98 0.002 0)",
          100: "oklch(0.96 0.005 0)",
          200: "oklch(0.92 0.005 0)",
          300: "oklch(0.85 0.008 0)",
          400: "oklch(0.6 0.008 0)",
          500: "oklch(0.5 0.008 0)",
          600: "oklch(0.4 0.008 0)",
          700: "oklch(0.3 0.008 0)",
          800: "oklch(0.25 0.008 0)",
          900: "oklch(0.2 0.008 0)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "calc(var(--radius) + 4px)",
        "2xl": "calc(var(--radius) + 8px)",
        "3xl": "calc(var(--radius) + 12px)",
      },
      fontSize: {
        xs: ["0.6875rem", { lineHeight: "1.4", letterSpacing: "-0.01em" }],
        sm: ["0.8125rem", { lineHeight: "1.5", letterSpacing: "-0.01em" }],
        base: ["0.875rem", { lineHeight: "1.5", letterSpacing: "-0.01em" }],
        lg: ["1rem", { lineHeight: "1.5", letterSpacing: "-0.02em" }],
        xl: ["1.125rem", { lineHeight: "1.4", letterSpacing: "-0.02em" }],
        "2xl": ["1.25rem", { lineHeight: "1.3", letterSpacing: "-0.02em" }],
        "3xl": ["1.5rem", { lineHeight: "1.2", letterSpacing: "-0.03em" }],
      },
      fontWeight: {
        normal: "400",
        medium: "500",
        semibold: "500",
        bold: "600",
      },
    },
  },
  plugins: [],
}

export default config 