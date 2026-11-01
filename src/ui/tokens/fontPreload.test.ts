import { describe, expect, it } from "vitest";
import { fontPreloadTags } from "./fontPreload";

describe("fontPreloadTags", () => {
  it("preloads the Latin display and body fonts, not their extended subsets", () => {
    const tags = fontPreloadTags([
      "assets/index-abc.js",
      "assets/figtree-latin-ext-wght-normal-Zx1.woff2",
      "assets/figtree-latin-wght-normal-Q_9-a.woff2",
      "assets/bricolage-grotesque-latin-opsz-normal-AB12.woff2",
    ]);

    expect(tags.map((tag) => tag.attrs.href)).toEqual([
      "/assets/bricolage-grotesque-latin-opsz-normal-AB12.woff2",
      "/assets/figtree-latin-wght-normal-Q_9-a.woff2",
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
      fontPreloadTags(["assets/figtree-latin-wght-normal-1.woff2"]),
    ).toThrow(/bricolage-grotesque-latin-opsz-normal/);
  });
});
