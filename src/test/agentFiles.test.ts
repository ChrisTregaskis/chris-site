import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";

// Files for crawlers and AI agents. Vite copies public/ to the root of the
// build verbatim, so each one is served at /<path> (checked against
// `pnpm preview` when they were added).
const root = resolve(__dirname, "../..");
const read = (path: string) => readFileSync(resolve(root, path), "utf8");

/** Every `id="..."` given in src/sections (the page's anchors). */
function pageAnchors(): Set<string> {
  const ids = new Set<string>();
  const walk = (dir: string) => {
    for (const name of readdirSync(dir)) {
      const path = join(dir, name);
      if (statSync(path).isDirectory()) walk(path);
      else if (name.endsWith(".tsx") && !name.includes(".test.")) {
        for (const match of readFileSync(path, "utf8").matchAll(
          /\bid="([a-z-]+)"/g,
        )) {
          ids.add(match[1]);
        }
      }
    }
  };
  walk(resolve(root, "src/sections"));
  return ids;
}

describe("agent and crawler files", () => {
  it("are in public/, which Vite serves from the site's root", () => {
    expect(read("vite.config.ts")).not.toMatch(/publicDir/);
    for (const file of [
      "llms.txt",
      "robots.txt",
      "sitemap.xml",
      ".well-known/ard.json",
    ]) {
      expect(existsSync(resolve(root, "public", file))).toBe(true);
    }
  });

  it("llms.txt follows the convention: an H1, a summary, links to the page's sections", () => {
    const llms = read("public/llms.txt");
    expect(llms).toMatch(/^# Chris Tregaskis\n\n> .{100,}/);
    expect(llms).toMatch(/^## Work$/m);
    expect(llms).toMatch(/^## Contact$/m);
    const anchors = [
      ...llms.matchAll(/\(https:\/\/chris-tregaskis\.uk\/#([a-z-]+)\)/g),
    ].map((match) => match[1]);
    expect(anchors).toEqual(["work", "physio", "burpees", "about", "contact"]);
    const ids = pageAnchors();
    for (const anchor of anchors) expect(ids).toContain(anchor);
    expect(llms).toContain("(https://badass-burpees.app/design)");
    expect(llms).toContain("(https://github.com/ChrisTregaskis)");
  });

  it("serves a valid, empty ARD manifest (the site offers no agent tools)", () => {
    const manifest = JSON.parse(read("public/.well-known/ard.json")) as {
      entries: unknown;
    };
    expect(manifest.entries).toEqual([]);
  });

  it("points robots.txt at the sitemap, which lists the page", () => {
    expect(read("public/robots.txt")).toContain(
      "Sitemap: https://chris-tregaskis.uk/sitemap.xml",
    );
    expect(read("public/sitemap.xml")).toContain(
      "<loc>https://chris-tregaskis.uk/</loc>",
    );
  });

  it("describes Chris as a Person in structured data", () => {
    const json = read("index.html").match(
      /<script type="application\/ld\+json">([\s\S]*?)<\/script>/,
    )?.[1];
    const person = JSON.parse(json ?? "null") as Record<string, unknown>;
    expect(person).toMatchObject({
      "@context": "https://schema.org",
      "@type": "Person",
      name: "Chris Tregaskis",
      url: "https://chris-tregaskis.uk/",
    });
    expect(person.sameAs).toContain("https://github.com/ChrisTregaskis");
  });
});
