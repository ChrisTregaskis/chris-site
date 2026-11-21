import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { PHYSIO_HEADING } from "../physioHeading";
import { PhysioNextSection } from "./PhysioNextSection";
import { renderWithProviders } from "@/test/renderWithProviders";

/** Reduced motion: the static layout, every ring drawn, journeys at once. */
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

describe("the physio chapter, next draft", () => {
  it("keeps the live opener word for word", async () => {
    const region = await renderChapter();
    expect(region).toHaveTextContent(PHYSIO_HEADING.lede);
    for (const chip of PHYSIO_HEADING.chips) {
      expect(region).toHaveTextContent(chip);
    }
  });

  it("replaces the sessions table and leak test with the rings, every ring drawn when still", async () => {
    const region = await renderChapter();
    expect(within(region).queryByTestId("sessions-stack")).toBeNull();
    const figure = screen.getByTestId("rings-figure");
    expect(figure).toHaveAccessibleName(/rings round the data/);
    expect(figure.querySelectorAll('[data-reveal="hidden"]')).toHaveLength(0);
    expect(
      within(region)
        .getAllByRole("heading", { level: 3 })
        .map((h) => h.textContent),
    ).toEqual([
      // Still, the journeys sit under the drawing, before the steps.
      "Now send something through it",
      "Everything comes in at the edge",
      "A network with no way out",
      "Only the keys each one needs",
      "An app that owns nothing",
      "Slow work waits its turn",
      "Admins look, never touch",
    ]);
  });

  it("turns another organisation's read away at the policy", async () => {
    const user = userEvent.setup();
    await renderChapter();
    await user.click(
      screen.getByRole("button", { name: "Read another organisation" }),
    );
    const trace = screen.getByLabelText("Trace");
    expect(trace).toHaveTextContent(
      "policy Birch's rows aren't Alder's: none come back",
    );
    expect(screen.getByText("No sessions")).toBeInTheDocument();
    expect(
      screen.getByTestId("rings-figure").querySelector('[data-ring="policy"]'),
    ).toHaveAttribute("data-held");
  });

  it("queues a job and lets the runner finish it", async () => {
    const user = userEvent.setup();
    await renderChapter();
    await user.click(
      screen.getByRole("button", { name: "Submit an assessment" }),
    );
    expect(screen.getByLabelText("Trace")).toHaveTextContent(
      "claims the job, locked so no other runner takes it",
    );
    expect(
      screen.getByTestId("rings-figure").querySelector("[data-token]"),
    ).toHaveAttribute("data-token", "done");
    expect(screen.getByText("Programme ready")).toBeInTheDocument();
  });

  it("picks a detail's part out of the drawing", async () => {
    const user = userEvent.setup();
    await renderChapter();
    const signer = screen.getByRole("button", {
      name: "The video signer: the key that signs video links",
    });
    const node = () =>
      screen.getByTestId("rings-figure").querySelector('[data-node="fnVideo"]');
    expect(node()).not.toHaveAttribute("data-hot");
    await user.click(signer);
    expect(signer).toHaveAttribute("aria-pressed", "true");
    expect(node()).toHaveAttribute("data-hot");
  });
});
