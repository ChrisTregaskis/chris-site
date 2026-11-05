import { act, renderHook, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FLAT_H } from "./flat/flatGeometry";
import { IsolationFigure } from "./IsolationFigure";
import { LINE_GAP, QUERY_LEADING, QUERY_TYPE, SIZES } from "./QueryLines";
import { ORGS } from "./organisations";
import { useLeakTest } from "./useLeakTest";
import { renderWithProviders } from "@/test/renderWithProviders";

const watch = { current: null };

/** The leak test's hook in a stage, signed in as `org`, asking or not. */
function testFor(stage: number, org: (typeof ORGS)[number], asking: boolean) {
  const { result } = renderHook(() =>
    useLeakTest(stage, { still: true, watch }),
  );
  act(() => result.current.pick(org));
  if (asking) act(() => result.current.tryOther());
  return result.current;
}

describe("the phone panel's height", () => {
  it("keeps room in the query block for the filter and the longest line under it", () => {
    for (const type of Object.values(QUERY_TYPE)) {
      const needed =
        3 * type.query * QUERY_LEADING +
        LINE_GAP +
        type.lines * type.line * type.lineLeading;
      expect(type.block).toBeGreaterThanOrEqual(needed);
      expect(type.block - needed).toBeLessThan(2);
    }
    expect(SIZES.large.block).toBe(`min-h-[${QUERY_TYPE.large.block}px]`);
    expect(SIZES.compact.block).toBe(
      `min-h-[${QUERY_TYPE.compact.block}px] wide:min-h-[${QUERY_TYPE.compactWide.block}px]`,
    );
  });

  it("is the same in every state of every step: the query's room and the drawing's fixed height", async () => {
    const states = [1, 2, 3].flatMap((stage) =>
      ORGS.flatMap((org) =>
        [false, true].map((asking) => testFor(stage, org, asking)),
      ),
    );
    const figure = (test: (typeof states)[number]) => (
      <IsolationFigure
        test={test}
        drawing="flat"
        controlsInside={false}
        drawn
        still
      />
    );
    const { rerender } = renderWithProviders(figure(states[0]));
    // The drawing loads on its own, once; every state after draws at once.
    await screen.findByTestId("sessions-stack");
    const seen = new Set<string>();
    for (const test of states) {
      rerender(figure(test));
      const stack = screen.getByTestId("sessions-stack");
      const block = screen.getByTestId("query");
      seen.add(`${stack.style.height} ${block.className}`);
    }
    expect(states.map((test) => test.view.line)).toContain(
      "The policy holds back Birch's, even when you ask by name.",
    );
    expect([...seen]).toEqual([`${FLAT_H}px ${SIZES.compact.block}`]);
  });
});
