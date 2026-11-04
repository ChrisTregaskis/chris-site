import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { demoPlan, SUGGESTIONS } from "./demo";
import { ROUTE_KEYS, type RouteKey } from "./iso";
import { PLATFORM_INDEXES } from "./parts";
import { WayfinderFigure } from "./WayfinderFigure";

function renderFigure(lit: ReadonlySet<RouteKey>) {
  return render(
    <WayfinderFigure
      selected={null}
      hot={new Set()}
      lit={lit}
      platform={0}
      onPart={() => {}}
      onSlot={() => {}}
      pulseRef={{ current: null }}
    />,
  );
}

describe("WayfinderFigure", () => {
  it("draws every lit pipe above every pipe's casing, so shared runs stay lit", () => {
    const { container } = renderFigure(new Set(ROUTE_KEYS));
    // Document order is paint order in SVG.
    const paths = [...container.querySelectorAll("path")];
    const lit = paths.filter((path) => path.hasAttribute("data-route"));
    const casings = paths.filter((path) => path.hasAttribute("data-casing"));
    expect(lit).toHaveLength(ROUTE_KEYS.length);
    expect(casings).toHaveLength(ROUTE_KEYS.length * 2);
    const lastCasing = Math.max(...casings.map((path) => paths.indexOf(path)));
    const firstLit = Math.min(...lit.map((path) => paths.indexOf(path)));
    expect(firstLit).toBeGreaterThan(lastCasing);
  });

  it("lights every pipe each suggestion travels, on every platform", () => {
    for (const platform of PLATFORM_INDEXES) {
      for (const suggestion of SUGGESTIONS) {
        const travelled = new Set(
          demoPlan(suggestion, platform).flatMap((step) =>
            step.type === "travel" ? [step.route] : [],
          ),
        );
        const { container, unmount } = renderFigure(travelled);
        for (const key of travelled) {
          const line = container.querySelector(`path[data-route="${key}"]`);
          expect(line).toHaveClass("opacity-100");
        }
        unmount();
      }
    }
  });
});
