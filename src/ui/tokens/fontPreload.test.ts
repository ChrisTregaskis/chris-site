import { describe, expect, it } from "vitest";
import { fontPreloadTags } from "./fontPreload";

describe("fontPreloadTags", () => {
  it("preloads the Latin sans and mono fonts, not their extended subsets", () => {
    const tags = fontPreloadTags([
      "assets/index-abc.js",
      "assets/ibm-plex-sans-latin-ext-wght-normal-Zx1.woff2",
      "assets/ibm-plex-sans-latin-wght-normal-Q_9-a.woff2",
      "assets/ibm-plex-mono-latin-500-normal-CD34.woff2",
      "assets/ibm-plex-mono-latin-400-normal-AB12.woff2",
    ]);

    expect(tags.map((tag) => tag.attrs.href)).toEqual([
      "/assets/ibm-plex-sans-latin-wght-normal-Q_9-a.woff2",
      "/assets/ibm-plex-mono-latin-400-normal-AB12.woff2",
    ]);
    expect(tags[0]).toMatchObject({
      tag: "link",
      injectTo: "head",
      attrs: {
        rel: "preload",
        as: "font",
        type: "font/woff2",
        crossorigin: true,
      },
    });
  });

  it("fails the build when a preloaded font is missing", () => {
    expect(() =>
      fontPreloadTags(["assets/ibm-plex-sans-latin-wght-normal-1.woff2"]),
    ).toThrow(/ibm-plex-mono-latin-400-normal/);
  });
});
