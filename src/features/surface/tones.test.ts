// @vitest-environment node
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { MAX_SHADOW, PENCIL, meshLookFor } from "./meshLook";
import { endsReach, reachAt } from "./reach";
import { LAYOUTS, TEXT_BOXES, type SampleLayout } from "./sampleLayouts";
import { shadeFill } from "./shading";
import { LINE_LEVELS, darkestUnderText } from "./strength";

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

/** The colour under the mesh at page y, as the tone plates paint it. */
function paperAt(y: number, layout: SampleLayout): number[] {
  const tone = (name: string) =>
    name === "base" ? colours.surface : colours[`paper-${name}`];
  const fade = (from: string, to: string, top: number, feather: number) => {
    const t = Math.min(1, Math.max(0, (y - top) / feather));
    return tone(from).map((c, i) => c + (tone(to)[i] - c) * t);
  };
  if (y < layout.workTop) return tone("base");
  if (y < layout.physioTop) {
    return fade("base", "wayfinder", layout.workTop, 360);
  }
  if (y < layout.burpeesTop) {
    return fade("wayfinder", "physio", layout.physioTop, 360);
  }
  if (y < layout.aboutTop) {
    return fade(
      "physio",
      "burpees",
      layout.burpeesTop,
      0.7 * layout.viewHeight,
    );
  }
  if (y < layout.contactTop) {
    return fade("burpees", "about", layout.aboutTop, 360);
  }
  return fade(
    "about",
    "base",
    layout.contactTop,
    layout.pageBottom - layout.contactTop,
  );
}

function contrastWith(text: string, rgb: number[]): number {
  colours["under-mesh"] = rgb;
  return contrast(text, "under-mesh");
}

describe("the mesh over the tones", () => {
  const mean = (rgb: number[]) => (rgb[0] + rgb[1] + rgb[2]) / 3;
  // As paintMesh draws it: the paper level between the plain paper and the
  // deepest chapter paper, ink for the shadows and the pencil.
  const paperLevel =
    (mean(colours.surface) + mean(colours["paper-burpees"])) / 2;
  const shadow = shadeFill(-MAX_SHADOW, paperLevel, mean(colours.ink)).alpha;
  const over = (rgb: number[], alpha: number) =>
    rgb.map((c, i) => c * (1 - alpha) + colours.ink[i] * alpha);
  // The canvas keeps alpha in 8 bits and dithers its gradients: allow a
  // level and a half of alpha more than asked for (as measured in Chrome).
  const PENCIL_AS_DRAWN = PENCIL + 1.5 / 255;

  for (const [name, layout] of Object.entries(LAYOUTS)) {
    it(`${name}: keeps every text role at AA wherever a pencil line crosses the darkest facet, all down the page`, () => {
      const reach = endsReach(layout);
      const strength = meshLookFor(
        name === "desktop" || name === "wide" ? 1440 : 390,
        0,
      ).strength;
      let tightest = Infinity;
      for (let y = 0; y <= layout.pageBottom; y += 4) {
        // The reach scales the facets and the lines alike (a gradient in both).
        const r = reachAt(y, reach) * strength;
        const under = over(
          over(paperAt(y, layout), shadow * r),
          PENCIL_AS_DRAWN * r,
        );
        for (const text of ["ink", "muted", "dim-muted", "accent", "danger"]) {
          const ratio = contrastWith(text, under);
          tightest = Math.min(tightest, ratio);
          expect(ratio, `${text} at y ${y}`).toBeGreaterThanOrEqual(4.5);
        }
      }
      expect(tightest).toBeLessThan(4.6); // The pencil is as strong as AA allows.
    });
  }

  it("holds the same on the drawer's paper, where the mesh is weaker still", () => {
    const under = over(over(colours.surface, shadow), PENCIL_AS_DRAWN);
    for (const text of ["ink", "muted", "accent", "danger-ink"]) {
      expect(contrastWith(text, under), text).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("under a line on the About paper with the darkest facet, the red pen is the tightest, at 4.5:1", () => {
    const under = over(over(colours["paper-about"], shadow), PENCIL_AS_DRAWN);
    expect(contrastWith("accent", under)).toBeGreaterThanOrEqual(4.5);
    expect(contrastWith("accent", under)).toBeLessThan(4.6);
    expect(contrastWith("muted", under)).toBeGreaterThan(6);
    expect(contrastWith("ink", under)).toBeGreaterThan(13);
  });
});

describe("text over the mesh, at every level, where the text really is", () => {
  const mean = (rgb: number[]) => (rgb[0] + rgb[1] + rgb[2]) / 3;
  const roles = ["ink", "muted", "dim-muted", "accent", "danger"];
  // The canvas's 8-bit alpha and gradient dithering, as measured in Chrome.
  const QUANTISATION = 1.5 / 255;
  const darken = (rgb: number[], alpha: number) =>
    rgb.map((c, i) => c * (1 - alpha) + colours.ink[i] * alpha);

  for (const name of ["desktop", "phone"] as const) {
    const layout = LAYOUTS[name];
    const reach = endsReach(layout);
    const strength = meshLookFor(name === "desktop" ? 1440 : 390, 0).strength;

    for (const [level, value] of Object.entries(LINE_LEVELS)) {
      it(`${name}, ${level}, text protected: every line of text keeps every text role at AA`, () => {
        let tightest = Infinity;
        for (const [left, top, right, bottom] of TEXT_BOXES[name]) {
          const box = { left, top, right, bottom };
          // The worst point of the line: where the reach is strongest.
          const r =
            Math.max(reachAt(top, reach), reachAt(bottom, reach)) * strength;
          if (r === 0) continue;
          const alpha =
            r * (darkestUnderText(value * 1, true, box) + QUANTISATION);
          for (const y of [top, bottom]) {
            const under = darken(paperAt(y, layout), alpha);
            for (const role of roles) {
              const ratio = contrastWith(role, under);
              tightest = Math.min(tightest, ratio);
              expect(ratio, `${role} at ${left},${top}`).toBeGreaterThanOrEqual(
                4.5,
              );
            }
          }
        }
        expect(tightest).toBeLessThan(Infinity);
      });
    }

    it(`${name}: Strong with text unprotected would take the red pen under AA (why it's protected)`, () => {
      const [left, top, right, bottom] = TEXT_BOXES[name][0];
      const alpha = darkestUnderText(LINE_LEVELS.strong, false, {
        left,
        top,
        right,
        bottom,
      });
      const under = darken(paperAt(top, layout), alpha);
      expect(contrastWith("accent", under)).toBeLessThan(4.5);
    });
  }

  it("keeps a paper level for the fills between the plain paper and the deepest", () => {
    const level = (mean(colours.surface) + mean(colours["paper-burpees"])) / 2;
    expect(level).toBeGreaterThan(mean(colours["paper-burpees"]));
    expect(level).toBeLessThan(mean(colours.surface));
  });
});
