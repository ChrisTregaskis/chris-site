import { act, renderHook, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { IsolationFigure } from "../IsolationFigure";
import { ORGS } from "../organisations";
import { PhysioSection } from "../PhysioSection";
import { SIZES } from "../QueryLines";
import { useLeakTest } from "../useLeakTest";
import { SCENE_BOX_H } from "./sceneMeasures";
import { PHONE_DRAFTS, type PhoneDraft } from "./variant";
import { renderWithProviders } from "@/test/renderWithProviders";
import { BELOW_WIDE } from "@/ui/tokens/breakpoints";

/* The switch is read once at load; here each test sets it. */
const draftNow = vi.hoisted(() => ({ value: null as PhoneDraft | null }));
vi.mock("./variant", async (load) => {
  const actual = await load<typeof import("./variant")>();
  return {
    ...actual,
    get PHONE_DRAFT() {
      return draftNow.value;
    },
  };
});

/* Phones, under reduced motion (the static end state; Framer reads it once per file). */
beforeEach(() => {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: query.includes("reduced-motion") || query === BELOW_WIDE,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
  }));
});

const spot = (org: string) =>
  document.querySelector(`[data-sheet="${org}"]`)?.getAttribute("data-spot");

describe("with no draft asked for", () => {
  it("draws the live chapter's flat drawing on phones", async () => {
    draftNow.value = null;
    renderWithProviders(<PhysioSection />);
    expect(await screen.findByTestId("sessions-stack")).toHaveAttribute(
      "data-drawing",
      "flat",
    );
  });
});

describe.each(PHONE_DRAFTS)("phone draft %s", (draft) => {
  it("draws on phones in its static end state, and asks for another organisation's sessions to get none", async () => {
    draftNow.value = draft;
    const user = userEvent.setup();
    renderWithProviders(<PhysioSection />);
    const stack = await screen.findByTestId("sessions-stack");
    expect(stack).toHaveAttribute("data-drawing", draft);
    expect(stack).toHaveClass("pointer-events-none");
    expect(ORGS.map(spot)).toEqual(["result", "held", "held"]);
    expect(screen.queryByRole("button", { name: /demo/ })).toBeNull();

    const card = screen.getByTestId("leak-test-card");
    await user.click(
      within(card).getByRole("button", {
        name: "Try to read Birch’s sessions",
      }),
    );
    expect(screen.getByTestId("empty-result")).toHaveAttribute(
      "data-shown",
      "true",
    );
    expect(screen.getByTestId("query-filter")).toHaveAttribute(
      "aria-hidden",
      "false",
    );
    expect(ORGS.map(spot)).toEqual(["held", "held", "held"]);
    await user.click(
      within(card).getByRole("button", { name: "Ask for every session again" }),
    );
    expect(screen.getByTestId("empty-result")).toHaveAttribute(
      "data-shown",
      "false",
    );
    expect(spot("Alder")).toBe("result");
  });

  it("keeps the panel one height in every state: the query's room and the scene's box", async () => {
    const states = [1, 2, 3].flatMap((stage) =>
      ORGS.flatMap((org) =>
        [false, true].map((asking) => {
          const { result } = renderHook(() =>
            useLeakTest(stage, { still: true, watch: { current: null } }),
          );
          act(() => result.current.pick(org));
          if (asking) act(() => result.current.tryOther());
          return result.current;
        }),
      ),
    );
    const figure = (test: (typeof states)[number]) => (
      <IsolationFigure
        test={test}
        drawing={draft}
        controlsInside={false}
        drawn
        still
      />
    );
    const { rerender } = renderWithProviders(figure(states[0]));
    await screen.findByTestId("sessions-stack");
    const seen = new Set<string>();
    for (const test of states) {
      rerender(figure(test));
      const stack = screen.getByTestId("sessions-stack");
      const block = screen.getByTestId("query-select").closest("figure")
        ?.children[0];
      seen.add(`${stack.style.height} ${block?.className ?? "none"}`);
    }
    expect([...seen]).toEqual([`${SCENE_BOX_H} ${SIZES.compact.block}`]);
  });
});
