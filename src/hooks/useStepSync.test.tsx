import { act, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useStepSync } from "./useStepSync";

type Callback = (entries: Partial<IntersectionObserverEntry>[]) => void;

/** An IntersectionObserver the test can fire by hand. */
function fakeObserver() {
  const observers: { callback: Callback; margin?: string }[] = [];
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      constructor(callback: Callback, options?: IntersectionObserverInit) {
        observers.push({ callback, margin: options?.rootMargin });
      }
      observe() {}
      disconnect() {}
    },
  );
  return {
    margin: () => observers.at(-1)?.margin,
    cross: (target: Element) =>
      act(() => observers.at(-1)?.callback([{ isIntersecting: true, target }])),
  };
}

const rect = (top: number, height: number) =>
  ({ top, bottom: top + height, height }) as DOMRect;

function Story({ reducedMotion = false }: { reducedMotion?: boolean }) {
  const { current, stepRef, cardRef, goTo } = useStepSync({
    measure: () => ({ focusY: 450, topLimit: 20 }),
    reducedMotion,
  });
  return (
    <>
      <output>{current}</output>
      {[1, 2, 3].map((n) => (
        <div key={n} ref={stepRef(n)} data-testid={`step-${n}`}>
          <button type="button" ref={cardRef(n)} onClick={() => goTo(n)}>
            Card {n}
          </button>
        </div>
      ))}
    </>
  );
}

describe("useStepSync", () => {
  it("selects whichever step scrolls across the focus band", () => {
    const io = fakeObserver();
    render(<Story />);
    expect(screen.getByRole("status")).toHaveTextContent("0");
    expect(io.margin()).toBe("-444px 0px -312px 0px"); // jsdom is 768 tall

    io.cross(screen.getByTestId("step-2"));
    expect(screen.getByRole("status")).toHaveTextContent("2");
  });

  it("selects a clicked step at once and scrolls its card to the focus line", () => {
    fakeObserver();
    const scrollTo = vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    render(<Story />);
    vi.spyOn(
      screen.getByRole("button", { name: "Card 3" }),
      "getBoundingClientRect",
    ).mockReturnValue(rect(1200, 200));

    act(() => screen.getByRole("button", { name: "Card 3" }).click());
    expect(screen.getByRole("status")).toHaveTextContent("3");
    expect(scrollTo).toHaveBeenCalledWith({ top: 850, behavior: "smooth" });
  });

  it("ignores the steps it scrolls past, then settles on the one at the focus line", () => {
    vi.useFakeTimers();
    const io = fakeObserver();
    vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    render(<Story />);
    const card = screen.getByRole("button", { name: "Card 3" });
    vi.spyOn(card, "getBoundingClientRect").mockReturnValue(rect(1200, 200));

    act(() => card.click());
    io.cross(screen.getByTestId("step-2"));
    expect(screen.getByRole("status")).toHaveTextContent("3");

    // The scroll lands with step 3 across the focus line.
    vi.spyOn(
      screen.getByTestId("step-3"),
      "getBoundingClientRect",
    ).mockReturnValue(rect(300, 400));
    act(() => {
      window.dispatchEvent(new Event("scroll"));
      vi.advanceTimersByTime(140);
    });
    io.cross(screen.getByTestId("step-1"));
    expect(screen.getByRole("status")).toHaveTextContent("1");
  });

  it("releases on scrollend, and jumps rather than glides under reduced motion", () => {
    const io = fakeObserver();
    const scrollTo = vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    render(<Story reducedMotion />);
    const card = screen.getByRole("button", { name: "Card 1" });
    vi.spyOn(card, "getBoundingClientRect").mockReturnValue(rect(900, 100));

    act(() => card.click());
    expect(scrollTo).toHaveBeenCalledWith({ top: 500, behavior: "auto" });

    vi.spyOn(
      screen.getByTestId("step-1"),
      "getBoundingClientRect",
    ).mockReturnValue(rect(200, 400));
    act(() => {
      window.dispatchEvent(new Event("scrollend"));
    });
    io.cross(screen.getByTestId("step-2"));
    expect(screen.getByRole("status")).toHaveTextContent("2");
  });
});
