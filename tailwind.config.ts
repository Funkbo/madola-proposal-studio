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
        background: "var(--background)",
        foreground: "var(--foreground)",
        solar: {
          50: "var(--brand-solar-50, #f0fdf4)",
          100: "var(--brand-solar-100, #dcfce7)",
          500: "var(--brand-primary, #10b981)",
          600: "var(--brand-button, #10b981)",
          700: "var(--brand-primary-hover, #059669)",
          900: "#064e3b",
        },
        brand: {
          primary: "var(--brand-primary, #10b981)",
          "primary-hover": "var(--brand-primary-hover, #059669)",
          secondary: "var(--brand-secondary, #0f172a)",
          button: "var(--brand-button, #10b981)",
          "button-text": "var(--brand-button-text, #ffffff)",
          "sidebar-bg": "var(--brand-sidebar-background, #0b1428)",
          "sidebar-text": "var(--brand-sidebar-text, #ffffff)",
          "login-bg": "var(--brand-login-background, #f5f7f6)",
          "login-card": "var(--brand-login-card, #ffffff)",
          slate: "#0f172a",
          amber: "#f59e0b",
        }
      },
    },
  },
  plugins: [],
};

export default config;
