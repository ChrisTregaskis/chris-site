import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { STACK_H } from "./depth/depthGeometry";
import { PhysioSection } from "./PhysioSection";
import { SIZES } from "./QueryLines";
import { renderWithProviders } from "@/test/renderWithProviders";
import { BELOW_WIDE } from "@/ui/tokens/breakpoints";

/** Reduced motion (the static end state), plus whichever layout queries match. */
function media(...matching: string[]) {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: query.includes("reduced-motion") || matching.includes(query),
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
  }));
}

/**
 * The room the 3D stack is measured against: the pinned stage's width (its
 * column side by side, the content width stacked) and the viewport's height.
 */
function room(width: number, height: number) {
  vi.spyOn(Element.prototype, "clientWidth", "get").mockReturnValue(width);
  vi.spyOn(Element.prototype, "clientHeight", "get").mockReturnValue(height);
}

const drawing = () =>
  screen.getByTestId("sessions-stack").getAttribute("data-drawing");

const spot = (org: string) =>
  document.querySelector(`[data-sheet="${org}"]`)?.getAttribute("data-spot");

const spoken = () => document.querySelector("#physio [aria-live]");

/** Renders the chapter and waits for its drawing, which loads on its own. */
async function renderDrawn() {
  const rendered = renderWithProviders(<PhysioSection />);
  await screen.findByTestId("sessions-stack");
  return rendered;
}

describe("the physio chapter", () => {
  it("opens on the approved heading, numbered 2", () => {
    media();
    renderWithProviders(<PhysioSection />);
    const region = screen.getByRole("region", {
      name: "A multi-tenant platform for physio and wellness",
    });
    expect(region).toHaveTextContent("A start-up we're building together");
    expect(region).not.toHaveTextContent(
      /tRPC|Riverside|bookings|personal project|Claude Code/i,
    );
  });

  it("asks for another organisation's sessions by name and gets an empty result, then resets", async () => {
    media();
    const user = userEvent.setup();
    await renderDrawn();
    const filter = screen.getByTestId("query-filter");
    const empty = screen.getByTestId("empty-result");
    expect(screen.getByTestId("query-outcome")).toHaveTextContent(
      "Only Alder's sessions come back, with no filter in the query.",
    );
    expect(filter).toHaveAttribute("aria-hidden", "true");
    expect(spot("Alder")).toBe("result");

    await user.click(
      screen.getByRole("button", { name: "Try to read Birch’s sessions" }),
    );
    expect(filter).toHaveAttribute("aria-hidden", "false");
    expect(filter).toHaveTextContent("where organisation_id = ‘Birch’");
    expect(spoken()).toHaveTextContent(
      "No sessions come back. The policy holds back Birch's, even when you ask by name.",
    );
    expect(empty).toHaveAttribute("data-shown", "true");
    expect(empty).toHaveTextContent("No sessions");
    expect(spot("Alder")).toBe("held");

    await user.click(
      screen.getByRole("button", { name: "Ask for every session again" }),
    );
    expect(empty).toHaveAttribute("data-shown", "false");
    expect(spot("Alder")).toBe("result");
  });

  it("brings the organisation picked forward as the result", async () => {
    media();
    const user = userEvent.setup();
    await renderDrawn();
    await user.click(screen.getByRole("button", { name: "Cedar" }));
    expect(screen.getByRole("button", { name: "Cedar" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(spot("Cedar")).toBe("result");
    expect(spoken()).toHaveTextContent(
      "Only Cedar's sessions come back, with no filter in the query.",
    );
  });

  it("draws the table in 3D at full size where there's room for it", async () => {
    // A 1440 x 900 desktop: the figure's column beside the steps.
    media();
    room(600, 900);
    await renderDrawn();
    await waitFor(() => expect(drawing()).toBe("depth"));
    expect(screen.getByTestId("sessions-stack").style.height).toBe(
      `${STACK_H}px`,
    );
    expect(screen.getByTestId("query")).toHaveClass(SIZES.large.block);
  });

  it("shrinks the 3D stack for a smaller laptop, its query a size down", async () => {
    // A 1366 x 768 laptop, about 657px of page under the browser's bars.
    media();
    room(653, 657);
    await renderDrawn();
    await waitFor(() => expect(drawing()).toBe("depth"));
    const height = parseFloat(
      screen.getByTestId("sessions-stack").style.height,
    );
    expect(height).toBeLessThan(STACK_H);
    expect(height).toBeGreaterThan(STACK_H * 0.82);
    expect(screen.getByTestId("query")).toHaveClass(SIZES.medium.block);
  });

  it("stacks the 3D stack above the steps on a tablet held upright, with the leak test in the last card", async () => {
    media(BELOW_WIDE);
    room(706, 1024);
    await renderDrawn();
    await waitFor(() => expect(drawing()).toBe("depth"));
    const figure = screen.getByRole("figure");
    expect(within(figure).queryByRole("button")).not.toBeInTheDocument();
    expect(screen.getByTestId("leak-test-card")).toBeInTheDocument();
  });

  it("draws phones and short or narrow screens their own way", async () => {
    media(BELOW_WIDE);
    room(358, 844);
    const { unmount } = await renderDrawn();
    await waitFor(() => expect(drawing()).toBe("glass"));
    unmount();
    // Side by side, but too short for the 3D stack even shrunk.
    media();
    room(600, 600);
    await renderDrawn();
    await waitFor(() => expect(drawing()).toBe("glass"));
  });

  it("keeps the stack out of the way of clicks", async () => {
    media();
    room(600, 900);
    await renderDrawn();
    expect(screen.getByTestId("sessions-stack")).toHaveClass(
      "pointer-events-none",
    );
  });

  it("on phones, puts the leak test's picker and buttons in the last step's card", async () => {
    media(BELOW_WIDE);
    const user = userEvent.setup();
    await renderDrawn();
    const card = screen.getByTestId("leak-test-card");
    const figure = screen.getByRole("figure");
    expect(within(figure).queryByRole("button")).not.toBeInTheDocument();
    await user.click(
      within(card).getByRole("button", {
        name: "Try to read Birch’s sessions",
      }),
    );
    expect(screen.getByTestId("empty-result")).toHaveAttribute(
      "data-shown",
      "true",
    );
  });

  it("shows every step's text at once under reduced motion, unnumbered", () => {
    media();
    renderWithProviders(<PhysioSection />);
    const texts = screen.getAllByTestId("step-text");
    expect(texts).toHaveLength(3);
    for (const text of texts) {
      expect(text).not.toHaveStyle({ opacity: "0" });
      expect(text.parentElement?.children).toHaveLength(1);
    }
  });

  it("offers no demo under reduced motion", () => {
    media();
    renderWithProviders(<PhysioSection />);
    expect(
      screen.queryByRole("button", { name: /demo/ }),
    ).not.toBeInTheDocument();
  });
});
