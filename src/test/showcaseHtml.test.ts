import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";

// The design system showcase is public at /showcase but unlisted: nothing
// links to it, the crawler and agent files leave it out, and it asks not to
// be indexed.
const root = resolve(__dirname, "../..");
const read = (path: string) => readFileSync(resolve(root, path), "utf8");

/** Every source file under `dir`, showcase and tests aside. */
function sources(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) {
      return name === "showcase" ? [] : sources(path);
    }
    return /\.tsx?$/.test(name) && !name.includes(".test.") ? [path] : [];
  });
}

describe("showcase.html", () => {
  it("is built by `pnpm build`, in its own pass", () => {
    const { scripts } = JSON.parse(read("package.json")) as {
      scripts: Record<string, string>;
    };
    expect(scripts.build).toMatch(/vite build && vite build --mode showcase$/);
  });

  it("asks not to be indexed, and robots.txt still lets crawlers read that", () => {
    expect(read("showcase.html")).toContain(
      '<meta name="robots" content="noindex" />',
    );
    expect(read("public/robots.txt")).not.toMatch(/Disallow:\s*\/showcase/);
  });

  it("carries the site's icons and a title of its own", () => {
    const html = read("showcase.html");
    expect(html).toContain("<title>Design system, Chris Tregaskis</title>");
    expect(html).toContain('<link rel="icon" href="/favicon.svg"');
  });

  it("is linked from nowhere: not the page, the sitemap or llms.txt", () => {
    for (const file of [
      "index.html",
      "public/sitemap.xml",
      "public/llms.txt",
    ]) {
      expect(read(file)).not.toMatch(/showcase/i);
    }
    for (const file of sources(resolve(root, "src"))) {
      expect(readFileSync(file, "utf8"), file).not.toMatch(/\/showcase/);
    }
  });
});
