import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        dark: '#141414',
        light: '#f0f8ff',
        bgColor: 'var(--bgColor)',
        textColorPrimary: 'var(--textColorPrimary)',
        textColorSecondary: 'var(--textColorSecondary)',
        buttonPrimary: 'var(--buttonPrimary)',
        buttonSecondary: 'var(--buttonSecondary)'
      },
      animation: {
        'spin-fast': 'spin 0.5s linear infinite',
      },
    },
  },
  plugins: [],
} satisfies Config;
