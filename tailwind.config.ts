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
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.3s ease',
        'shimmer': 'shimmer 2s infinite linear',
      },
      boxShadow: {
        'accent': '0 4px 14px rgba(21, 243, 236, 0.25)',
        'accent-lg': '0 8px 24px rgba(21, 243, 236, 0.3)',
      },
    },
  },
  plugins: [],
};
export default config;
