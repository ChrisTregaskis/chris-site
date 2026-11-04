import { type Config } from "tailwindcss";
import page from "./tailwind.config";

/**
 * The design system showcase's Tailwind config: the page's, scanning the
 * showcase too. Used only by src/showcase/showcase.css (its `@config`), so
 * the page's CSS never carries the showcase's utilities.
 */
export default {
  ...page,
  content: ["./showcase.html", "./src/**/*.{js,ts,jsx,tsx}"],
} satisfies Config;
