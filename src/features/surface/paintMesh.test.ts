import { describe, expect, it } from "vitest";
import { type Facet, meshFacets } from "./meshFacets";
import { PENCIL, meshLookFor } from "./meshLook";
import { lineGroups, outOfReach, paintMesh } from "./paintMesh";
import { endsReach } from "./reach";
import { LAYOUTS } from "./sampleLayouts";

const facet = (points: Facet["points"], strength = 1, levels = -1): Facet => ({
  points,
  strength,
  levels,
});

describe("the pencil lines", () => {
  it("draw every edge once, however many facets share it, at the stronger facet's strength", () => {
    // Two facets sharing the edge (10,0)-(0,10).
    const a = facet([0, 0, 10, 0, 0, 10], 1);
    const b = facet([10, 0, 10, 10, 0, 10], 0.5);
    const groups = lineGroups([a, b]);
    const all = [...groups.values()].flat();
    expect(all).toHaveLength(5);
    expect(groups.get(1)).toContainEqual([0, 10, 10, 0]);
    expect(groups.get(0.5)).toHaveLength(2);
  });

  it("over a whole patch, draw each edge exactly once", () => {
    const look = meshLookFor(1440, 720, true);
    const facets = meshFacets(
      { left: 0, top: 0, right: 1440, bottom: 900 },
      look,
      [],
      null,
    );
    const segments = [...lineGroups(facets).values()].flat();
    const keys = new Set(segments.map((s) => s.join()));
    expect(keys.size).toBe(segments.length);
    // A triangulation has about one and a half edges per facet.
    expect(segments.length).toBeLessThan(facets.length * 1.6 + 60);
  });

  it("leave out facets with no strength", () => {
    expect(lineGroups([facet([0, 0, 1, 0, 0, 1], 0)]).size).toBe(0);
  });
});

describe("facets out of reach", () => {
  const reach = endsReach(LAYOUTS.desktop);

  it("are the ones wholly in the case studies", () => {
    expect(outOfReach(facet([0, 4000, 100, 4000, 50, 4100]), reach)).toBe(true);
    expect(outOfReach(facet([0, 300, 100, 300, 50, 400]), reach)).toBe(false);
    expect(outOfReach(facet([0, 4000, 100, 4000, 50, 4100]), null)).toBe(false);
  });
});

/** A context that records what's drawn, in order. */
function recorder() {
  const strokes: number[] = [];
  const fills: number[] = [];
  const order: string[] = [];
  const context = {
    globalAlpha: 1,
    globalCompositeOperation: "source-over",
    fillStyle: "" as unknown,
    strokeStyle: "" as unknown,
    lineWidth: 1,
    lineCap: "butt",
    lineJoin: "miter",
    createLinearGradient: () => ({ addColorStop: () => {} }),
    beginPath: () => {},
    moveTo: () => {},
    lineTo: () => {},
    closePath: () => {},
    fill() {
      fills.push(this.globalAlpha);
      order.push(`fill:${this.globalCompositeOperation}`);
    },
    stroke() {
      strokes.push(this.globalAlpha);
      order.push(`stroke:${this.globalCompositeOperation}`);
    },
    drawImage() {
      order.push(`mask:${this.globalCompositeOperation}:${this.globalAlpha}`);
    },
  };
  return {
    context: context as unknown as CanvasRenderingContext2D,
    strokes,
    fills,
    order,
  };
}

describe("painting the mesh", () => {
  const look = meshLookFor(1440, 720, true);
  const ink = {
    paper: 238,
    ink: [26, 32, 35] as const,
    light: [255, 255, 255] as const,
    edge: look.edge,
  };

  it("strokes the pencil at most at its alpha, one stroke per strength", () => {
    const facets = meshFacets(
      { left: 0, top: 0, right: 1440, bottom: 900 },
      look,
      [],
      null,
    );
    const { context, strokes, fills } = recorder();
    paintMesh(context, facets, { ...ink, top: 0, bottom: 900, reach: null });
    expect(strokes).toEqual([PENCIL]);
    expect(fills.length).toBeGreaterThan(50);
  });

  it("draws nothing in a band the mesh doesn't reach", () => {
    const facets = meshFacets(
      { left: 0, top: 4000, right: 1440, bottom: 5400 },
      look,
      [],
      null,
    );
    const { context, strokes, fills } = recorder();
    paintMesh(context, facets, {
      ...ink,
      top: 4000,
      bottom: 5400,
      reach: endsReach(LAYOUTS.desktop),
    });
    expect(strokes).toEqual([]);
    expect(fills).toEqual([]);
  });

  it("thins only the pencil behind text: lines, then the mask rubbing them out, then the facets slid in behind", () => {
    const facets = meshFacets(
      { left: 0, top: 0, right: 1440, bottom: 900 },
      look,
      [],
      null,
    );
    const { context, order } = recorder();
    paintMesh(context, facets, {
      ...ink,
      top: 0,
      bottom: 900,
      reach: null,
      protect: [
        {
          mask: {} as CanvasImageSource,
          left: 0,
          top: 0,
          width: 1440,
          height: 900,
          keep: 0.25,
        },
      ],
    });
    expect(order[0]).toBe("stroke:source-over");
    const mask = order.indexOf("mask:destination-out:0.75");
    expect(mask).toBeGreaterThan(0);
    expect(
      order
        .slice(mask + 1)
        .every((step: string) => step === "fill:destination-over"),
    ).toBe(true);
    expect(context.globalCompositeOperation).toBe("source-over");
  });

  it("rubs out lines and facets alike round the drawings, after everything else", () => {
    const facets = meshFacets(
      { left: 0, top: 0, right: 1440, bottom: 900 },
      look,
      [],
      null,
    );
    const { context, order } = recorder();
    const mask = {
      mask: {} as CanvasImageSource,
      left: 0,
      top: 0,
      width: 1440,
      height: 900,
    };
    paintMesh(context, facets, {
      ...ink,
      top: 0,
      bottom: 900,
      reach: null,
      protect: [{ ...mask, keep: 0.25 }],
      quiet: [{ ...mask, keep: 0 }],
    });
    expect(order[order.length - 1]).toBe("mask:destination-out:1");
    expect(order.filter((step) => step.startsWith("mask"))).toEqual([
      "mask:destination-out:0.75",
      "mask:destination-out:1",
    ]);
    expect(context.globalCompositeOperation).toBe("source-over");
  });
});
