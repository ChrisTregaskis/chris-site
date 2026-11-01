import { readFileSync } from "node:fs";
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
});
