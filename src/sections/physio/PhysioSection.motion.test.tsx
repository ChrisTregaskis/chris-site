import { act, cleanup, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PHYSIO_HEADING } from "./physioHeading";
import { PhysioSection } from "./PhysioSection";
import { phoneStageSettings } from "@/features/phone-stage";
import { renderWithProviders } from "@/test/renderWithProviders";

/*
 * Full motion, side by side. Framer reads the reduced-motion preference once
 * per test file, so these live apart from the static tests.
 */
/**
 * The drawing loads as the reader nears it: here it's always near. Nothing
 * else the chapter observes (its steps, the chapter itself) reports by
 * itself; `scrollTo` has the step sync see a step's words reach the
 * reading line, as a scroll would.
 */
const observers = new Set<NearObserver>();
class NearObserver {
  readonly report: IntersectionObserverCallback;
  readonly targets = new Set<Element>();
  constructor(report: IntersectionObserverCallback) {
    this.report = report;
    observers.add(this);
  }
  observe(target: Element) {
    this.targets.add(target);
    if (target.getAttribute("data-testid") !== "rings-room") return;
    this.report(
      [{ isIntersecting: true, target } as IntersectionObserverEntry],
      this as unknown as IntersectionObserver,
    );
  }
  unobserve() {}
  disconnect() {
    observers.delete(this);
  }
  takeRecords() {
    return [];
  }
}

function scrollTo(step: string) {
  // The sync tracks a step's box or, stacked, its words.
  const targets = [
    document.querySelector(`[data-step="${step}"]`),
    document.querySelector(`[data-step-text="${step}"]`),
  ];
  // Any glide the chapter set off has settled: the sync is listening again.
  act(() => {
    window.dispatchEvent(new Event("scrollend"));
  });
  for (const observer of [...observers]) {
    const target = targets.find((t) => t && observer.targets.has(t));
    if (!target) continue;
    act(() =>
      observer.report(
        [
          {
            isIntersecting: true,
            target,
            boundingClientRect: target.getBoundingClientRect(),
          } as IntersectionObserverEntry,
        ],
        observer as unknown as IntersectionObserver,
      ),
    );
  }
}

/** Side by side, or stacked (a phone). */
function media(stacked = false) {
  vi.stubGlobal("IntersectionObserver", NearObserver);
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: stacked && query.includes("max-width"),
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
  }));
}

async function renderChapter(stacked = false) {
  media(stacked);
  renderWithProviders(<PhysioSection />);
  await screen.findByTestId("rings-figure");
  return screen.getByRole("region", { name: PHYSIO_HEADING.title });
}

const figure = () => screen.getByTestId("rings-figure");
const litRoutes = () =>
  [...figure().querySelectorAll("[data-lit-route]")]
    .filter((path) => path.classList.contains("opacity-100"))
    .map((path) => path.getAttribute("data-lit-route"));
const words = (step: string) =>
  document.querySelector(`[data-step-text="${step}"]`);
const reveal = (node: string) =>
  figure().querySelector(`[data-node="${node}"]`)?.getAttribute("data-reveal");

async function pick(name: string) {
  const user = userEvent.setup();
  await user.click(screen.getByRole("button", { name: /^Physio ring/ }));
  await user.click(screen.getByRole("option", { name }));
}

const tryIt = () =>
  userEvent.setup().click(screen.getByRole("button", { name: "Try it" }));

describe("the rings, scrolling", () => {
  /** Animation frames held, so a journey stays mid-route. */
  beforeEach(() => {
    vi.stubGlobal("requestAnimationFrame", () => 1);
    vi.stubGlobal("cancelAnimationFrame", () => {});
  });
  // Unmount while the frame stubs are still in place (jsdom has none).
  afterEach(() => cleanup());

  it("pins the drawing, and shows only the step's own words, fading the rest", async () => {
    await renderChapter();
    expect(screen.getByTestId("rings-stage")).toHaveClass("sticky");
    // Before any step: the rings' ghosts, and no words yet.
    expect(reveal("data")).toBe("hidden");
    expect(words("edge")).toHaveAttribute("aria-hidden", "true");

    await pick("Postgres");
    expect(reveal("data")).toBe("new");
    expect(reveal("engineer")).toBe("hidden");
    expect(words("centre")).toHaveAttribute("aria-hidden", "false");
    expect(words("centre")).toHaveClass("opacity-100");
    // Passed: faded, leaving upwards. To come: faded, waiting below.
    expect(words("edge")).toHaveClass("opacity-0", "-translate-y-3");
    expect(words("queue")).toHaveClass("opacity-0", "translate-y-3");

    // And back: the earlier step's words return, the later ones fade.
    await pick("The edge");
    expect(words("edge")).toHaveAttribute("aria-hidden", "false");
    expect(words("centre")).toHaveClass("opacity-0", "translate-y-3");
    expect(reveal("data")).toBe("hidden");
  });

  it("clears a journey mid-route the moment the step changes, leaving nothing lit", async () => {
    await renderChapter();
    await pick("Direct access");
    await tryIt();
    expect(litRoutes()).toEqual(["engineer-host"]);
    expect(figure().querySelectorAll("[data-hot]").length).toBeGreaterThan(0);

    // Back up to the edge: the engineer's spoke must not stay lit.
    await pick("The edge");
    expect(litRoutes()).toEqual([]);
    expect(figure().querySelectorAll("[data-hot]")).toHaveLength(0);
    expect(figure().querySelectorAll("[data-held]")).toHaveLength(0);
    expect(screen.queryByLabelText("Trace")).toBeNull();
    const pulse = figure().querySelector("g[visibility]");
    expect(pulse).toHaveAttribute("visibility", "hidden");
  });

  it("puts the trace in place of the step's details while it shows", async () => {
    await renderChapter();
    await pick("The queue");
    const card = words("queue");
    if (!(card instanceof HTMLElement)) throw new Error("no queue words");
    expect(
      within(card).getByRole("list", { name: "Inside the queue" }),
    ).toBeInTheDocument();
    await tryIt();
    expect(within(card).getByLabelText("Trace")).toHaveTextContent(
      "visitor submits an assessment",
    );
    expect(within(card).queryByRole("list")).toBeNull();
    // The details keep their room, hidden, so the words never get shorter
    // (a shorter step could slide the next under the reading line).
    expect(
      card
        .querySelector('ul[aria-label="Inside the queue"]')
        ?.closest("[aria-hidden]"),
    ).toHaveAttribute("aria-hidden", "true");
    await userEvent
      .setup()
      .click(within(card).getByRole("button", { name: "Show the details" }));
    expect(
      within(card).getByRole("list", { name: "Inside the queue" }),
    ).toBeInTheDocument();
    expect(litRoutes()).toEqual([]);
  });
});

describe("the rings on a phone", () => {
  beforeEach(() => {
    vi.stubGlobal("requestAnimationFrame", () => 1);
    vi.stubGlobal("cancelAnimationFrame", () => {});
  });
  afterEach(() => {
    cleanup();
    act(() => phoneStageSettings.set({ phoneStage: "compact" }));
  });

  const stage = () => screen.getByTestId("rings-stage");

  it("pins the drawing alone on the compact stage, with Try it on it and no picker", async () => {
    await renderChapter(true);
    expect(stage()).toHaveAttribute("data-compact");
    expect(screen.queryByRole("button", { name: /^Physio ring/ })).toBeNull();
    expect(
      within(stage()).getByRole("button", { name: "Try it" }),
    ).toBeInTheDocument();
    // Cropped to what's drawn: shorter than the square.
    expect(figure().getAttribute("viewBox")).toBe("-210 -212 420 370");
  });

  it("opens each step's words with its name and the picker's icon", async () => {
    await renderChapter(true);
    for (const [id, name] of [
      ["edge", "The edge"],
      ["queue", "The queue"],
      ["direct", "Direct access"],
    ] as const) {
      const card = words(id);
      if (!(card instanceof HTMLElement)) throw new Error(`no ${id} words`);
      const heading = card.firstElementChild;
      expect(heading).toHaveTextContent(name);
      expect(heading?.querySelector("svg")).toHaveAttribute(
        "aria-hidden",
        "true",
      );
    }
  });

  it("plays the step's journey from Try it on the stage, starting at the first step before any", async () => {
    await renderChapter(true);
    const tryOnStage = within(stage()).getByRole("button", { name: "Try it" });
    expect(tryOnStage).toHaveAttribute("aria-pressed", "false");
    // Before any step: it brings the first step in and sends its journey.
    await userEvent.setup().click(tryOnStage);
    expect(words("edge")).toHaveAttribute("aria-hidden", "false");
    expect(tryOnStage).toHaveAttribute("aria-pressed", "true");
    expect(litRoutes().length).toBeGreaterThan(0);
    // Scrolled on to another step: its journey cleared, Try it sends that one's.
    scrollTo("direct");
    expect(words("direct")).toHaveAttribute("aria-hidden", "false");
    expect(litRoutes()).toEqual([]);
    expect(tryOnStage).toHaveAttribute("aria-pressed", "false");
    await userEvent.setup().click(tryOnStage);
    expect(litRoutes()).toEqual(["engineer-host"]);
    // And back up: the step before it, nothing left lit.
    scrollTo("queue");
    expect(words("queue")).toHaveAttribute("aria-hidden", "false");
    expect(litRoutes()).toEqual([]);
  });

  it("keeps the picker on a phone when the current stage is chosen", async () => {
    act(() => phoneStageSettings.set({ phoneStage: "current" }));
    await renderChapter(true);
    expect(stage()).not.toHaveAttribute("data-compact");
    expect(
      screen.getByRole("button", { name: /^Physio ring/ }),
    ).toBeInTheDocument();
    expect(figure().getAttribute("viewBox")).toBe("-210 -210 420 420");
    expect(words("edge")?.firstElementChild?.querySelector("svg")).toBeNull();
  });
});
