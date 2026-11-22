// @vitest-environment node
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { MAX_SHADOW } from "./meshLook";
import { shadeFill } from "./shading";

const tokens = readFileSync(
  new URL("../../ui/tokens/tokens.css", import.meta.url),
  "utf8",
);
const surfaceCss = readFileSync(
  new URL("./surface.css", import.meta.url),
  "utf8",
);

/** Every `--color-*` token with a raw RGB triplet. */
const colours: Record<string, number[]> = Object.fromEntries(
  [...tokens.matchAll(/--color-([a-z-]+):\s*(\d+ \d+ \d+);/g)].map((m) => [
    m[1],
    m[2].split(" ").map(Number),
  ]),
);

function contrast(a: string, b: string): number {
  const luminance = (name: string) => {
    const [r, g, bl] = colours[name].map((channel) => {
      const v = channel / 255;
      return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
  };
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const PAPERS = ["wayfinder", "physio", "burpees", "about"].map(
  (chapter) => `paper-${chapter}`,
);

describe("chapter tones", () => {
  it("has a paper for each chapter, and data-tones hands each chapter its own", () => {
    expect(surfaceCss).toContain(
      "--color-line-hover: var(--color-paper-line-hover);",
    );
    for (const paper of PAPERS) {
      expect(colours[paper], paper).toBeDefined();
      const chapter = paper.replace("paper-", "");
      expect(surfaceCss).toContain(
        `--color-tone-${chapter}: var(--color-${paper});`,
      );
    }
  });

  it("keeps every text role at AA (4.5:1) and the field underline at 3:1 on each paper", () => {
    for (const paper of PAPERS) {
      for (const text of [
        "ink",
        "muted",
        "dim-ink",
        "dim-muted",
        "accent",
        "accent-strong",
        "danger",
        "danger-ink",
      ]) {
        expect(
          contrast(text, paper),
          `${text} on ${paper}`,
        ).toBeGreaterThanOrEqual(4.5);
      }
      expect(contrast("line-field", paper), paper).toBeGreaterThanOrEqual(3);
      // The drawings' drawn edges, their stepped-back edges (line-hover,
      // firmer on the tones) and the practice's teal still read (3:1, graphics).
      expect(contrast("line-strong", paper), paper).toBeGreaterThanOrEqual(3);
      expect(contrast("paper-line-hover", paper), paper).toBeGreaterThanOrEqual(
        3,
      );
      expect(contrast("tenant-teal", paper), paper).toBeGreaterThanOrEqual(3);
    }
  });

  it("stays in the paper's family: barely tinted, close to the paper, never a colour of its own", () => {
    for (const paper of PAPERS) {
      const [r, g, b] = colours[paper];
      const [sr, sg, sb] = colours.surface;
      // Within a few levels of the plain paper on every channel...
      for (const [c, s] of [
        [r, sr],
        [g, sg],
        [b, sb],
      ]) {
        expect(Math.abs(c - s), paper).toBeLessThanOrEqual(12);
      }
      // ...and cool: blue and green at or above red, the spread small.
      expect(b, paper).toBeGreaterThanOrEqual(r);
      expect(g, paper).toBeGreaterThanOrEqual(r);
      expect(Math.max(r, g, b) - Math.min(r, g, b), paper).toBeLessThanOrEqual(
        10,
      );
    }
  });
});

describe("the mesh over the tones", () => {
  it("never takes text below AA: the darkest facet on the deepest paper still holds 4.5:1", () => {
    // As useMeshCanvas paints: the paper level between the plain paper and
    // the deepest chapter paper, ink as the shadow colour.
    const mean = (rgb: number[]) => (rgb[0] + rgb[1] + rgb[2]) / 3;
    const paperLevel =
      (mean(colours.surface) + mean(colours["paper-burpees"])) / 2;
    const { alpha } = shadeFill(-MAX_SHADOW, paperLevel, mean(colours.ink));
    for (const paper of ["surface", ...PAPERS]) {
      colours[`${paper}-shadowed`] = colours[paper].map(
        (c, i) => c * (1 - alpha) + colours.ink[i] * alpha,
      );
      for (const text of ["accent", "dim-muted", "danger"]) {
        expect(
          contrast(text, `${paper}-shadowed`),
          `${text} on ${paper} under the darkest facet`,
        ).toBeGreaterThanOrEqual(4.5);
      }
      expect(
        contrast("line-field", `${paper}-shadowed`),
      ).toBeGreaterThanOrEqual(3);
    }
  });
});
