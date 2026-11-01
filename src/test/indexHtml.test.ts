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

  describe("link previews (Open Graph and Twitter cards)", () => {
    const SITE = "https://chris-tregaskis.uk/";

    /** The content of each `<meta property|name="key" content="...">`. */
    const metaTags = () =>
      new Map(
        [
          ...read("index.html").matchAll(
            /<meta\s+(?:property|name)="([^"]+)"\s+content="([^"]*)"\s*\/>/g,
          ),
        ].map((match) => [match[1], match[2]]),
      );

    it("gives every tag a card needs", () => {
      const meta = metaTags();
      const html = read("index.html");
      const title = html.match(/<title>([^<]+)<\/title>/)?.[1];
      const description = meta.get("description");
      expect(title).toBeTruthy();
      expect(description).toBeTruthy();

      expect(Object.fromEntries(meta)).toMatchObject({
        "og:type": "website",
        "og:site_name": "Chris Tregaskis",
        "og:title": title,
        "og:description": description,
        "og:url": SITE,
        "og:image:type": "image/png",
        "og:image:width": "1200",
        "og:image:height": "630",
        "og:locale": "en_GB",
        "twitter:card": "summary_large_image",
        "twitter:title": title,
        "twitter:description": description,
      });
      for (const key of ["og:image:alt", "twitter:image:alt"]) {
        expect(meta.get(key)).toMatch(/^Chris Tregaskis, .{40,}/);
      }
      expect(html).toContain(`<link rel="canonical" href="${SITE}" />`);
    });

    it("points the image at an absolute https URL that public/ serves", () => {
      const meta = metaTags();
      const image = new URL(meta.get("og:image") ?? "", "file:///relative/");
      expect(image.href).toBe(`${SITE}og-image.png`);
      expect(image.protocol).toBe("https:");
      expect(meta.get("twitter:image")).toBe(image.href);
      const file = resolve(__dirname, "../../public", image.pathname.slice(1));
      expect(existsSync(file)).toBe(true);
    });

    it("ships a 1200 by 630 PNG", () => {
      const png = readFileSync(resolve(__dirname, "../../public/og-image.png"));
      expect(png.subarray(1, 4).toString("ascii")).toBe("PNG");
      expect(png.readUInt32BE(16)).toBe(1200);
      expect(png.readUInt32BE(20)).toBe(630);
    });
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
