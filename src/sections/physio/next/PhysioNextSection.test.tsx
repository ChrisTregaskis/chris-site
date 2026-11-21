import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { PHYSIO_HEADING } from "../physioHeading";
import { PhysioNextSection } from "./PhysioNextSection";
import { renderWithProviders } from "@/test/renderWithProviders";

/** Side by side; with or without reduced motion. */
function media(reduced: boolean) {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: reduced && query.includes("reduced-motion"),
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
  }));
}

async function renderChapter(reduced: boolean) {
  media(reduced);
  renderWithProviders(<PhysioNextSection />);
  await screen.findByTestId("rings-figure");
  return screen.getByRole("region", { name: PHYSIO_HEADING.title });
}

const figure = () => screen.getByTestId("rings-figure");
const litRoutes = () =>
  [...figure().querySelectorAll("[data-lit-route]")]
    .filter((path) => path.classList.contains("opacity-100"))
    .map((path) => path.getAttribute("data-lit-route"));

async function pick(name: string) {
  const user = userEvent.setup();
  await user.click(screen.getByRole("button", { name: /^Physio ring/ }));
  await user.click(screen.getByRole("option", { name }));
}

const tryIt = () =>
  userEvent.setup().click(screen.getByRole("button", { name: "Try it" }));

describe("the physio chapter, next draft", () => {
  it("keeps the live title and lede word for word, with its own chips", async () => {
    const region = await renderChapter(true);
    expect(region).toHaveTextContent(PHYSIO_HEADING.lede);
    const chips = region.querySelectorAll("header ul > li");
    expect([...chips].map((chip) => chip.textContent)).toEqual([
      "React",
      "Postgres RLS",
      "Private network",
      "Job queue",
      "SST",
      "Turborepo",
    ]);
    // The live chapter's chips are left as they were.
    expect(PHYSIO_HEADING.chips).toEqual([
      "React",
      "Zod",
      "Drizzle",
      "Postgres RLS",
      "SST",
      "Turborepo",
    ]);
    expect(within(region).queryByTestId("sessions-stack")).toBeNull();
  });

  it("lists the rings in Wayfinder's picker, with Try it", async () => {
    const user = userEvent.setup();
    await renderChapter(true);
    await user.click(screen.getByRole("button", { name: /^Physio ring/ }));
    expect(
      screen.getAllByRole("option").map((option) => option.textContent),
    ).toEqual([
      "The edge",
      "The private network",
      "The functions",
      "Postgres",
      "The queue",
      "Direct access",
    ]);
    expect(screen.getByRole("button", { name: "Try it" })).toBeInTheDocument();
  });
});

describe("the rings, static (reduced motion)", () => {
  it("pins nothing and shows every ring and every step's words", async () => {
    await renderChapter(true);
    expect(screen.getByTestId("rings-stage")).not.toHaveClass("sticky");
    expect(figure().querySelectorAll('[data-reveal="hidden"]')).toHaveLength(0);
    expect(
      document.querySelectorAll('[data-step-text][aria-hidden="true"]'),
    ).toHaveLength(0);
    expect(
      screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent),
    ).toEqual([
      "Everything comes in at the edge",
      "A network with no way out",
      "Only the keys each one needs",
      "An app that owns nothing",
      "Slow work waits its turn",
      "Nobody edits the data by hand",
    ]);
    expect(
      screen.queryByRole("button", { name: "Show every ring" }),
    ).toBeNull();
  });

  it("runs the chosen ring's journey with Try it, its trace under the picker", async () => {
    await renderChapter(true);
    await pick("Postgres");
    await tryIt();
    const stage = screen.getByTestId("rings-stage");
    expect(within(stage).getByLabelText("Trace")).toHaveTextContent(
      "policy Globex's rows aren't Acme's: none come back",
    );
    expect(within(stage).getByText("No sessions")).toBeInTheDocument();
    expect(figure().querySelector('[data-ring="policy"]')).toHaveAttribute(
      "data-held",
    );
  });

  it("clears what a finished journey lit when another ring is chosen", async () => {
    await renderChapter(true);
    await pick("Direct access");
    await tryIt();
    expect(litRoutes()).toEqual(["engineer-host", "host-data"]);
    await pick("The edge");
    expect(litRoutes()).toEqual([]);
    expect(figure().querySelectorAll("[data-hot]")).toHaveLength(0);
    expect(screen.queryByLabelText("Trace")).toBeNull();
  });

  it("queues a job and lets the runner finish it", async () => {
    await renderChapter(true);
    await pick("The queue");
    await tryIt();
    expect(screen.getByLabelText("Trace")).toHaveTextContent(
      "claims the job, locked so no other runner takes it",
    );
    expect(figure().querySelector("[data-token]")).toHaveAttribute(
      "data-token",
      "done",
    );
    expect(screen.getByText("Programme ready")).toBeInTheDocument();
  });

  it("picks a detail's part out of the drawing", async () => {
    const user = userEvent.setup();
    await renderChapter(true);
    const signer = screen.getByRole("button", {
      name: "The video signer: the key that signs video links",
    });
    const node = () => figure().querySelector('[data-node="fnVideo"]');
    expect(node()).not.toHaveAttribute("data-hot");
    await user.click(signer);
    expect(signer).toHaveAttribute("aria-pressed", "true");
    expect(node()).toHaveAttribute("data-hot");
  });
});
