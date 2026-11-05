import { act, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PhysioSection } from "./PhysioSection";
import { renderWithProviders } from "@/test/renderWithProviders";

/*
 * Full motion: no reduced-motion stub in this file (Framer reads it once
 * per file). Framer keeps one IntersectionObserver per root and settings
 * for the whole file, so the one the test fires by hand is installed once,
 * before anything renders, and remembers everything it was asked to watch.
 */
const watched: {
  callback: IntersectionObserverCallback;
  target: Element;
  margin?: string;
}[] = [];

vi.stubGlobal(
  "IntersectionObserver",
  class {
    callback: IntersectionObserverCallback;
    margin?: string;
    constructor(
      callback: IntersectionObserverCallback,
      options?: IntersectionObserverInit,
    ) {
      this.callback = callback;
      this.margin = options?.rootMargin;
    }
    observe(target: Element) {
      watched.push({ callback: this.callback, target, margin: this.margin });
    }
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  },
);

const marginOf = (target: Element) =>
  watched.filter((entry) => entry.target === target).at(-1)?.margin;

function scrollIntoView(target: Element) {
  act(() => {
    for (const entry of watched.filter((w) => w.target === target)) {
      entry.callback(
        [
          {
            isIntersecting: true,
            intersectionRatio: 1,
            target,
          } as unknown as IntersectionObserverEntry,
        ],
        {} as IntersectionObserver,
      );
    }
  });
}

describe("the physio steps, in full motion", () => {
  it("aren't numbered: each card holds only its text", () => {
    renderWithProviders(<PhysioSection />);
    const texts = screen.getAllByTestId("step-text");
    expect(texts).toHaveLength(3);
    for (const text of texts) {
      expect(text.parentElement?.children).toHaveLength(1);
      expect(text.textContent).not.toMatch(/^\s*[0-9]/);
    }
  });

  it("fades each step's text up into place once it scrolls a little way into view", async () => {
    renderWithProviders(<PhysioSection />);
    const [first, second] = screen.getAllByTestId("step-text");
    expect(first).toHaveStyle({ opacity: "0" });
    expect(second).toHaveStyle({ opacity: "0" });
    expect(marginOf(first)).toBe("0px 0px -15% 0px");

    scrollIntoView(first);
    await waitFor(() => expect(first).toHaveStyle({ opacity: "1" }));
    expect(second).toHaveStyle({ opacity: "0" });
  });
});
