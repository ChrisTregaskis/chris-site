/**
 * The first screen's two Latin font files (display and body), preloaded so the
 * hero doesn't flash a fallback face. Vite emits them as
 * `assets/<stem>-<hash>.woff2`; the build plugin in vite.config.ts turns the
 * bundle's file names into `<link rel="preload">` tags with this helper.
 */
export const PRELOAD_FONT_STEMS = [
  "bricolage-grotesque-latin-opsz-normal",
  "figtree-latin-wght-normal",
] as const;

export interface PreloadTag {
  tag: "link";
  attrs: Record<string, string | boolean>;
  injectTo: "head";
}

/** Preload tags for the first-screen fonts. Throws if one is missing, so a renamed font can't drop its preload silently. */
export function fontPreloadTags(fileNames: string[], base = "/"): PreloadTag[] {
  return PRELOAD_FONT_STEMS.map((stem) => {
    const file = fileNames.find(
      (name) => name.startsWith(`assets/${stem}-`) && name.endsWith(".woff2"),
    );
    if (!file) {
      throw new Error(`fontPreloadTags: no emitted font for ${stem}`);
    }
    return {
      tag: "link",
      attrs: {
        rel: "preload",
        as: "font",
        type: "font/woff2",
        href: `${base}${file}`,
        crossorigin: true,
      },
      injectTo: "head",
    };
  });
}
