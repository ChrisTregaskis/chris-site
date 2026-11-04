/// <reference types="vitest/config" />
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import dotenv from "dotenv";
import { fontPreloadTags } from "./src/ui/tokens/fontPreload";

// Load environment variables from .env file
dotenv.config();

/** Preloads the first-screen fonts in the built index.html (see fontPreload.ts). */
function fontPreload(): Plugin {
  let base = "/";
  return {
    name: "chris-site:font-preload",
    apply: "build",
    configResolved(config) {
      base = config.base;
    },
    transformIndexHtml: {
      order: "post",
      handler(_html, context) {
        return fontPreloadTags(Object.keys(context.bundle ?? {}), base);
      },
    },
  };
}

/**
 * The design system showcase (showcase.html) builds in a second pass,
 * `vite build --mode showcase`, into the same dist/ beside the page. Its
 * own pass gives it its own chunk graph, so the page's bundle is the same
 * as if the showcase didn't exist (one build with both entries would split
 * the code they share into common chunks). Served at /showcase.
 */
const SHOWCASE_MODE = "showcase";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const showcase = mode === SHOWCASE_MODE;
  return {
    // The showcase loads its fonts without preloads: only the page's first
    // screen needs them early.
    plugins: [react(), ...(showcase ? [] : [fontPreload()])],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: showcase
      ? {
          // Add to the page's build rather than replace it; public/ is
          // already there.
          emptyOutDir: false,
          copyPublicDir: false,
          rollupOptions: { input: path.resolve(__dirname, "showcase.html") },
        }
      : {},
    test: {
      environment: "jsdom",
      setupFiles: ["./src/test/setup.ts"],
    },
  };
});
