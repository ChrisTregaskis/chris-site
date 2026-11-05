import { describe, expect, it } from "vitest";
import {
  INITIAL_LEAK,
  leakReducer,
  type LeakState,
  type LeakView,
  leakView,
} from "../leakTest";
import { type Org, ORGS } from "../organisations";
import { GlassStack } from "./GlassStack";
import { renderWithProviders } from "@/test/renderWithProviders";

function viewAt(stage: number, org: Org = "Alder", asking = false): LeakView {
  let state: LeakState = leakReducer(INITIAL_LEAK, { type: "pick", org });
  if (asking) state = leakReducer(state, { type: "try" });
  return leakView(stage, state);
}

/** Every state, there and back: down through the steps, the leak test, and up again. */
const JOURNEY: LeakView[] = [
  viewAt(1),
  viewAt(2),
  viewAt(3),
  viewAt(3, "Alder", true),
  viewAt(3, "Birch"),
  viewAt(3, "Birch", true),
  viewAt(2),
  viewAt(1),
  viewAt(3, "Cedar"),
  viewAt(1),
];

const slab = (org: Org) =>
  document.querySelector<HTMLElement>(`[data-slab="${org}"]`);

describe("the glass floor", () => {
  it("never fades a piece that holds 3D children as a whole (WebKit draws those children regardless)", () => {
    const { rerender, container } = renderWithProviders(
      <GlassStack view={JOURNEY[0]} attempt={0} still={false} />,
    );
    for (const view of JOURNEY) {
      rerender(<GlassStack view={view} attempt={1} still={false} />);
      const flatten = [...container.querySelectorAll<HTMLElement>("*")].filter(
        (element) =>
          (element.getAttribute("class") ?? "").includes("preserve-3d") &&
          element.style.opacity !== "",
      );
      expect(flatten).toEqual([]);
    }
  });

  it("hides what isn't showing for real: at rest no slab, tab or glass is there, only the one table", () => {
    const { rerender } = renderWithProviders(
      <GlassStack view={JOURNEY[0]} attempt={0} still={false} />,
    );
    for (const view of JOURNEY) {
      rerender(<GlassStack view={view} attempt={0} still={false} />);
      const expected = view.asked ? "visible" : "hidden";
      for (const org of ORGS) {
        expect(slab(org)?.style.visibility, `${org} slab`).toBe(expected);
      }
      expect(
        document.querySelector<HTMLElement>("[data-policy]")?.style.visibility,
      ).toBe(expected);
    }
  });

  it("keeps every organisation's tab in its place under the glass, lighting the one that comes back", () => {
    const { rerender } = renderWithProviders(
      <GlassStack view={viewAt(2)} attempt={0} still={false} />,
    );
    const places = new Map(
      ORGS.map((org) => [org, slab(org)?.style.transform]),
    );
    for (const view of JOURNEY.filter((v) => v.asked)) {
      rerender(<GlassStack view={view} attempt={0} still={false} />);
      for (const org of ORGS) {
        const element = slab(org);
        const tab = document.querySelector<HTMLElement>(`[data-tab="${org}"]`);
        // Same place and shape in every state: only whether it's selected changes.
        expect(element?.style.transform).toBe(places.get(org));
        expect(tab?.style.opacity).toBe("1");
        expect(element).toHaveAttribute(
          "data-selected",
          String(view.returned === org),
        );
      }
    }
  });
});
