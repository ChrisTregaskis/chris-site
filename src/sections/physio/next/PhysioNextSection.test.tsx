import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { PHYSIO_HEADING } from "../physioHeading";
import { PhysioNextSection } from "./PhysioNextSection";
import { renderWithProviders } from "@/test/renderWithProviders";

/**
 * Reduced motion, side by side: no fades and no travelling pulse, so a
 * journey runs to its end at once and leaves its routes lit.
 */
function still() {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: query.includes("reduced-motion"),
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
  }));
}

async function renderChapter() {
  still();
  renderWithProviders(<PhysioNextSection />);
  await screen.findByTestId("rings-figure");
  return screen.getByRole("region", { name: PHYSIO_HEADING.title });
}

const figure = () => screen.getByTestId("rings-figure");
const litRoutes = () =>
  [...figure().querySelectorAll("[data-lit-route]")].filter((path) =>
    path.classList.contains("opacity-100"),
  );
const words = (step: string) =>
  document.querySelector(
    `[data-testid=rings-words] [data-step-text="${step}"]`,
  );

async function pick(name: string) {
  const user = userEvent.setup();
  await user.click(screen.getByRole("button", { name: /^Physio ring/ }));
  await user.click(screen.getByRole("option", { name }));
}

describe("the physio chapter, next draft", () => {
  it("keeps the live opener word for word", async () => {
    const region = await renderChapter();
    expect(region).toHaveTextContent(PHYSIO_HEADING.lede);
    for (const chip of PHYSIO_HEADING.chips) {
      expect(region).toHaveTextContent(chip);
    }
    expect(within(region).queryByTestId("sessions-stack")).toBeNull();
  });

  it("lists the rings in Wayfinder's picker, with Try it and a show-everything link", async () => {
    const user = userEvent.setup();
    await renderChapter();
    await user.click(screen.getByRole("button", { name: /^Physio ring/ }));
    expect(
      screen.getAllByRole("option").map((option) => option.textContent),
    ).toEqual([
      "The edge",
      "The private network",
      "The functions",
      "Postgres",
      "The queue",
      "The admin",
    ]);
    expect(screen.getByRole("button", { name: "Try it" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Show every ring" }),
    ).toBeInTheDocument();
  });

  it("reveals a ring with its words, and only its words", async () => {
    await renderChapter();
    // Before any step: the rings' ghosts, and no words yet.
    expect(figure().querySelector('[data-node="data"]')).toHaveAttribute(
      "data-reveal",
      "hidden",
    );
    await pick("Postgres");
    expect(figure().querySelector('[data-node="data"]')).toHaveAttribute(
      "data-reveal",
      "new",
    );
    expect(figure().querySelector('[data-node="admin"]')).toHaveAttribute(
      "data-reveal",
      "hidden",
    );
    expect(words("centre")).toHaveAttribute("aria-hidden", "false");
    expect(words("edge")).toHaveAttribute("aria-hidden", "true");
    expect(
      screen.getByRole("heading", {
        level: 3,
        name: "An app that owns nothing",
      }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", {
        level: 3,
        name: "Slow work waits its turn",
      }),
    ).toBeNull();
  });

  it("runs the ring's own journey with Try it: another organisation's read is turned away", async () => {
    const user = userEvent.setup();
    await renderChapter();
    await pick("Postgres");
    await user.click(screen.getByRole("button", { name: "Try it" }));
    expect(screen.getByLabelText("Trace")).toHaveTextContent(
      "policy Birch's rows aren't Alder's: none come back",
    );
    expect(screen.getByText("No sessions")).toBeInTheDocument();
    expect(figure().querySelector('[data-ring="policy"]')).toHaveAttribute(
      "data-held",
    );
  });

  it("clears every lit route and node when the step changes, leaving nothing behind", async () => {
    const user = userEvent.setup();
    await renderChapter();
    await pick("The admin");
    await user.click(screen.getByRole("button", { name: "Try it" }));
    expect(
      litRoutes().map((path) => path.getAttribute("data-lit-route")),
    ).toEqual(["admin-host", "host-data"]);
    expect(figure().querySelectorAll("[data-hot]").length).toBeGreaterThan(0);

    // Back up to the edge: the admin's spoke must not stay lit.
    await pick("The edge");
    expect(litRoutes()).toEqual([]);
    expect(figure().querySelectorAll("[data-hot]")).toHaveLength(0);
    expect(figure().querySelectorAll("[data-held]")).toHaveLength(0);
    expect(screen.queryByLabelText("Trace")).toBeNull();
  });

  it("queues a job and lets the runner finish it", async () => {
    const user = userEvent.setup();
    await renderChapter();
    await pick("The queue");
    await user.click(screen.getByRole("button", { name: "Try it" }));
    expect(screen.getByLabelText("Trace")).toHaveTextContent(
      "claims the job, locked so no other runner takes it",
    );
    expect(figure().querySelector("[data-token]")).toHaveAttribute(
      "data-token",
      "done",
    );
    expect(screen.getByText("Programme ready")).toBeInTheDocument();
    // The details come back, and the journey goes, when asked.
    await user.click(screen.getByRole("button", { name: "Show the details" }));
    expect(screen.queryByLabelText("Trace")).toBeNull();
    expect(litRoutes()).toEqual([]);
  });

  it("picks a detail's part out of the drawing", async () => {
    const user = userEvent.setup();
    await renderChapter();
    await pick("The functions");
    const signer = screen.getByRole("button", {
      name: "The video signer: the key that signs video links",
    });
    const node = () => figure().querySelector('[data-node="fnVideo"]');
    expect(node()).not.toHaveAttribute("data-hot");
    await user.click(signer);
    expect(signer).toHaveAttribute("aria-pressed", "true");
    expect(node()).toHaveAttribute("data-hot");
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
    expect(
      screen.getByRole("button", { name: "Back to ring by ring" }),
    ).toBeInTheDocument();
    await pick("The functions");
    expect(
      figure().querySelectorAll('[data-reveal="hidden"]').length,
    ).toBeGreaterThan(0);
  });
});
