import { act, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { BurpeesSection } from "./BurpeesSection";
import { CALLS } from "./calls";
import { STRAIN_OUTSET_EM, STRAIN_STROKE_EM } from "./countType";
import { RUN_HEIGHT } from "./stageRun";
import { AppProviders } from "@/app/AppProviders";
import { renderWithProviders } from "@/test/renderWithProviders";

/** Animation frames the test runs by hand. */
function fakeFrames() {
  let queue: FrameRequestCallback[] = [];
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
    queue.push(callback);
    return queue.length;
  });
  vi.stubGlobal("cancelAnimationFrame", () => {
    queue = [];
  });
  return () =>
    act(() => {
      const run = queue;
      queue = [];
      for (const callback of run) callback(0);
    });
}

type Observed = (entries: Partial<IntersectionObserverEntry>[]) => void;

/**
 * IntersectionObservers the test fires by hand. The one that matters here
 * watches the set's room from a screen and a half away; the returned
 * function brings it within reach.
 */
function fakeObservers() {
  const near: Observed[] = [];
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      constructor(callback: Observed, options?: IntersectionObserverInit) {
        if (options?.rootMargin?.startsWith("150%")) near.push(callback);
      }
      observe() {}
      disconnect() {}
    },
  );
  return () =>
    act(() => {
      for (const callback of near) callback([{ isIntersecting: true }]);
    });
}

/** The set's run, as tall as jsdom's window is short: 4000px against 768. */
const RUN = 4000;
const TRAVEL = RUN - window.innerHeight;

/**
 * Lays the stage out as a browser would (jsdom draws nothing): the run's
 * top where the test puts it, the stage 1088px wide, and the hidden ruler
 * drawing a finished set's three digits `rulerWidth` wide.
 */
function layOut(runTop: () => number, rulerWidth = 540) {
  vi.spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(
    function rect(this: Element) {
      const ruler = this.textContent === "000";
      const width = ruler ? rulerWidth : 1088;
      const top = runTop();
      const height = ruler ? 280 : RUN;
      return {
        x: 0,
        y: top,
        top,
        left: 0,
        width,
        height,
        right: width,
        bottom: top + height,
        toJSON: () => ({}),
      };
    },
  );
}

/** Scrolls the page so the run is `progress` of the way through. */
function scrollTo(progress: number, at: { top: number }, flush: () => void) {
  at.top = -progress * TRAVEL;
  window.dispatchEvent(new Event("scroll"));
  flush();
}

const region = () => screen.getByRole("region", { name: "Badass Burpees" });
const count = () => screen.getByTestId("burpees-count");
/** A call as drawn on the stage (its large heading), and whether it shows. */
const shown = (call: string) => {
  const heading = within(region()).getByText(call, { selector: "p" });
  return !heading.closest(".invisible");
};

describe("BurpeesSection", () => {
  let flush: () => void, approach: () => void;
  beforeEach(() => {
    flush = fakeFrames();
    approach = fakeObservers();
  });

  /** Scrolls the set's room within reach, and waits for its stage. */
  const nearSet = () => {
    approach();
    return screen.findByTestId("burpees-count");
  };

  it("opens with the app in a line and both ways out", () => {
    renderWithProviders(<BurpeesSection />);
    expect(
      within(region()).getByText(
        /^A fitness app I built for myself, quickly and with an AI-assisted workflow, then shared with everyone for free\./,
      ),
    ).toBeInTheDocument();
    expect(
      within(region()).getByRole("link", { name: /badass-burpees\.app/ }),
    ).toHaveAttribute("href", "https://badass-burpees.app/");
    expect(
      within(region()).getByRole("link", { name: /design system/ }),
    ).toHaveAttribute("href", "https://badass-burpees.app/design");
    // The old phone mock's copy is gone (the app has no organisms).
    expect(region()).not.toHaveTextContent(/organisms/);
  });

  it("holds the set's room at its full height until the visitor nears it, then draws it there", async () => {
    renderWithProviders(<BurpeesSection />);
    // Far off: no stage yet, only its room, as tall as the run.
    expect(screen.queryByTestId("burpees-count")).not.toBeInTheDocument();
    const room = region().lastElementChild;
    expect(room?.firstElementChild).toHaveClass(RUN_HEIGHT);
    // Within a screen and a half, it's drawn into a run of the same height.
    const stage = await nearSet();
    expect(room?.firstElementChild).toHaveClass(RUN_HEIGHT);
    expect(room?.firstElementChild).toContainElement(stage);
  });

  it("tells assistive tech the whole story, every call with its line, in order", async () => {
    renderWithProviders(<BurpeesSection />);
    await nearSet();
    // The stage is decorative; the list is the one thing a reader meets.
    const items = within(within(region()).getByRole("list")).getAllByRole(
      "listitem",
    );
    expect(items.map((item) => item.textContent)).toEqual(
      CALLS.map(({ call, line }) => `${call} ${line}`),
    );
    expect(count().closest("[aria-hidden='true']")).not.toBeNull();
  });

  it("counts the set as the page scrolls, calling each milestone, with Done only at 100", async () => {
    const at = { top: 0 };
    layOut(() => at.top);
    renderWithProviders(<BurpeesSection />);
    await nearSet();
    expect(count()).toHaveTextContent(/^0$/);
    expect(shown("Go!")).toBe(true);
    expect(shown("Halfway")).toBe(false);
    expect(shown("Done")).toBe(false);

    scrollTo(0.5, at, flush);
    expect(Number(count().textContent)).toBeGreaterThan(50);
    expect(shown("Go!")).toBe(false);
    expect(shown("Halfway")).toBe(true);

    // At 100 the calls step aside and Done comes in under the count.
    scrollTo(1, at, flush);
    expect(count()).toHaveTextContent(/^100$/);
    expect(shown("Done")).toBe(true);
    expect(shown("Last one")).toBe(false);

    // Back under 100, it reverses.
    scrollTo(0.85, at, flush);
    expect(count()).toHaveTextContent(/^99$/);
    expect(shown("Done")).toBe(false);
    expect(shown("Last one")).toBe(true);
  });

  it("keeps a finished set on the stage, however wide the browser draws the digits", async () => {
    layOut(() => 0, 1500);
    renderWithProviders(<BurpeesSection />);
    await nearSet();
    // Three digits 1500px wide on a 1088px stage: the count takes 1088/1500.
    const fit = Number(
      (count().parentElement as HTMLElement).style.getPropertyValue(
        "--count-fit",
      ),
    );
    expect(fit).toBeLessThan(1);
    expect(1500 * fit).toBeLessThanOrEqual(1088);
  });

  it("prototype c: strains the count through the last reps, from the set's progress", async () => {
    const at = { top: 0 };
    layOut(() => at.top);
    render(
      <AppProviders scrollFeel="c">
        <BurpeesSection />
      </AppProviders>,
    );
    await nearSet();
    const stage = count().closest("[aria-hidden='true']") as HTMLElement;
    expect(count()).toHaveClass("set-strain");
    expect(count().style.getPropertyValue("--strain-stroke")).toBe(
      `${STRAIN_STROKE_EM}em`,
    );
    scrollTo(0.85, at, flush);
    expect(stage.style.getPropertyValue("--set-p")).toBe("0.85");
  });

  it("prototype c: fits the count with its strained strokes, not just its digits", async () => {
    // The ruler's digits are drawn at 500px, three of them 1080px wide: a
    // finished set just fits the 1088px stage, until the strokes widen it.
    const size = 500;
    const real = window.getComputedStyle.bind(window);
    vi.spyOn(window, "getComputedStyle").mockImplementation(
      (element, pseudo) => {
        const style = real(element, pseudo);
        if (element.textContent !== "000") return style;
        return new Proxy(style, {
          get: (target, key) =>
            key === "fontSize"
              ? `${size}px`
              : (Reflect.get(target, key) as unknown),
        });
      },
    );
    layOut(() => 0, 1080);
    render(
      <AppProviders scrollFeel="c">
        <BurpeesSection />
      </AppProviders>,
    );
    await nearSet();
    const fit = () =>
      Number(
        (count().parentElement as HTMLElement).style.getPropertyValue(
          "--count-fit",
        ),
      );
    await vi.waitFor(() => expect(fit()).toBeLessThan(1));
    const outset = size * STRAIN_OUTSET_EM;
    expect((1080 + 2 * outset) * fit()).toBeLessThanOrEqual(1088);
  });

  it("leaves the count alone on the live site", async () => {
    const at = { top: 0 };
    layOut(() => at.top);
    renderWithProviders(<BurpeesSection />);
    await nearSet();
    scrollTo(0.85, at, flush);
    expect(count()).not.toHaveClass("set-strain");
    const stage = count().closest("[aria-hidden='true']") as HTMLElement;
    expect(stage.style.getPropertyValue("--set-p")).toBe("");
  });
});
