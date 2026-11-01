import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("index.html", () => {
  const read = (path: string) =>
    readFileSync(resolve(__dirname, "../..", path), "utf8");

  it("keeps the page title the deploy smoke check expects", () => {
    const title =
      "<title>Chris Tregaskis, senior full-stack TypeScript developer</title>";
    expect(read("index.html")).toContain(title);
    expect(read(".github/workflows/deploy.yml")).toContain(
      `expected="${title}"`,
    );
  });

  it("describes the page for search and link previews", () => {
    expect(read("index.html")).toMatch(
      /<meta\s+name="description"\s+content="[^"]{50,160}"/,
    );
  });

  it("links icons that exist in public/", () => {
    const icons = [
      ...read("index.html").matchAll(
        /<link\s+rel="(?:icon|apple-touch-icon)"\s+href="\/([^"]+)"/g,
      ),
    ].map((match) => match[1]);
    expect(icons).toEqual([
      "favicon.ico",
      "favicon.svg",
      "apple-touch-icon.png",
    ]);
    for (const icon of icons) {
      expect(existsSync(resolve(__dirname, "../../public", icon))).toBe(true);
    }
  });

  it("tints the browser chrome with the surface token", () => {
    const surface = read("src/ui/tokens/tokens.css").match(
      /--color-surface: [^;]+; \/\* (#[0-9A-F]{6}) \*\//,
    )?.[1];
    expect(surface).toBe("#13142E");
    expect(read("index.html")).toContain(
      `<meta name="theme-color" content="${surface}" />`,
    );
  });
});
