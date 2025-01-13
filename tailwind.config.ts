import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        bgColor: 'var(--bgColor)',
        textColorPrimary: 'var(--textColorPrimary)',
        textColorSecondary: 'var(--textColorSecondary)'
      }
    },
  },
  plugins: [],
} satisfies Config;