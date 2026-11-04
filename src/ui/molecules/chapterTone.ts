import { type CSSProperties } from "react";

/** The chapter tones in tokens.css (`--color-tone-*`); `base` is surface. */
export type ToneName = "base" | "wayfinder" | "physio" | "burpees" | "about";

export interface ChapterTone {
  /** The tone of the chapter before, which this one fades in from. */
  from: ToneName;
  /** This chapter's own tone. */
  to: ToneName;
  /** How far the fade runs (a CSS length); 360px by default. */
  feather?: string;
}

/**
 * The custom properties a `.chapter-tone` element reads, as inline style.
 * Inside the chapter, surface is its tone, so anything drawn in surface
 * (the figure's pipe gaps, a pinned stage's backing) sits on it seamlessly.
 * The veils are the same two tones as see-through plates, which only the
 * night-sky prototype (`?scroll=a`) draws.
 */
export function chapterToneStyle({
  from,
  to,
  feather,
}: ChapterTone): CSSProperties {
  return {
    "--tone-from": `var(--color-tone-${from})`,
    "--tone-to": `var(--color-tone-${to})`,
    "--tone-from-veil": `var(--color-veil-${from})`,
    "--tone-to-veil": `var(--color-veil-${to})`,
    ...(feather ? { "--tone-feather": feather } : {}),
    ...(to === "base" ? {} : { "--color-surface": `var(--color-tone-${to})` }),
  } as CSSProperties;
}
