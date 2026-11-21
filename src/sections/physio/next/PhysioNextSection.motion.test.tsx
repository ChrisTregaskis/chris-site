import { cleanup, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PHYSIO_HEADING } from "../physioHeading";
import { PhysioNextSection } from "./PhysioNextSection";
import { renderWithProviders } from "@/test/renderWithProviders";

/*
 * Full motion, side by side. Framer reads the reduced-motion preference once
 * per test file, so these live apart from the static tests.
 */
function media() {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: false,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
  }));
}

async function renderChapter() {
  media();
  renderWithProviders(<PhysioNextSection />);
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
    expect(reveal("admin")).toBe("hidden");
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
    await pick("The admin");
    await tryIt();
    expect(litRoutes()).toEqual(["admin-host"]);
    expect(figure().querySelectorAll("[data-hot]").length).toBeGreaterThan(0);

    // Back up to the edge: the admin's spoke must not stay lit.
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
    await userEvent
      .setup()
      .click(within(card).getByRole("button", { name: "Show the details" }));
    expect(
      within(card).getByRole("list", { name: "Inside the queue" }),
    ).toBeInTheDocument();
    expect(litRoutes()).toEqual([]);
  });

  it("shows every ring at once on request, until the step changes", async () => {
    const user = userEvent.setup();
    await renderChapter();
    await pick("The edge");
    expect(
      figure().querySelectorAll('[data-reveal="hidden"]').length,
    ).toBeGreaterThan(0);
    await user.click(screen.getByRole("button", { name: "Show every ring" }));
    expect(figure().querySelectorAll('[data-reveal="hidden"]')).toHaveLength(0);
    await user.click(
      screen.getByRole("button", { name: "Back to ring by ring" }),
    );
    expect(
      figure().querySelectorAll('[data-reveal="hidden"]').length,
    ).toBeGreaterThan(0);
    await user.click(screen.getByRole("button", { name: "Show every ring" }));
    await pick("The functions");
    expect(
      figure().querySelectorAll('[data-reveal="hidden"]').length,
    ).toBeGreaterThan(0);
  });
});
