import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { demoPlan, SUGGESTIONS } from "./demo";
import { PLATE_PIECE, SUBS } from "./explode";
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

describe("WayfinderFigure taken apart", () => {
  it("draws every piece, and a number tag for each (and the plate), out of the way of assistive tech", () => {
    const { container } = render(
      <WayfinderFigure
        selected="bff"
        hot={new Set()}
        lit={new Set()}
        platform={1}
        onPart={() => {}}
        onSlot={() => {}}
        pulseRef={{ current: null }}
        apart
        highlight="2.3"
        reducedMotion
      />,
    );
    const svg = screen.getByRole("img");
    expect(svg).toHaveAccessibleName(/taken apart/);
    expect(svg).toHaveAttribute("data-picked", "2.3");
    expect(container.querySelectorAll("[data-piece]")).toHaveLength(
      SUBS.length,
    );
    const tags = [...container.querySelectorAll("[data-tag]")].map((tag) =>
      tag.getAttribute("data-tag"),
    );
    expect(tags).toHaveLength(SUBS.length + 1);
    expect(tags).toContain(PLATE_PIECE.id);
    // Tags and badges sit in a hidden group: the step cards say it in words.
    expect(
      container.querySelector("[data-tag]")?.closest("[aria-hidden='true']"),
    ).not.toBeNull();
  });

  it("swaps the platform when a cartridge is clicked, taken apart or not", async () => {
    const user = userEvent.setup();
    const onSlot = vi.fn();
    const onPart = vi.fn();
    const { container } = render(
      <WayfinderFigure
        selected="ai"
        hot={new Set()}
        lit={new Set()}
        platform={1}
        onPart={onPart}
        onSlot={onSlot}
        pulseRef={{ current: null }}
        apart
        reducedMotion
      />,
    );
    const c = container.querySelector('[data-slot="C"]');
    if (!c) throw new Error("no cartridge C");
    await user.click(c);
    expect(onSlot).toHaveBeenCalledWith(2);
    expect(onPart).not.toHaveBeenCalled();
  });
});
