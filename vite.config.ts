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

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), fontPreload()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
  },
});
