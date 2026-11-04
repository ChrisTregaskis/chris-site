import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DirectionC } from "./DirectionC";
import { renderWithProviders } from "@/test/renderWithProviders";

// Reduced motion: the story starts at its end state, with the leak test open.
beforeEach(() => {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: query.includes("reduced-motion"),
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
  }));
});

const spot = (org: string) =>
  document.querySelector(`[data-sheet="${org}"]`)?.getAttribute("data-spot");

describe("Direction C's leak test", () => {
  it("adds the filter and gets an empty result, then resets to the signed-in organisation's", async () => {
    const user = userEvent.setup();
    renderWithProviders(<DirectionC />);
    const line = screen.getByTestId("leak-line");
    const spoken = screen.getByText(
      "Only Alder's sessions come back, with no filter in the query.",
      { selector: "[aria-live]" },
    );
    const filter = screen.getByTestId("leak-filter");
    const empty = screen.getByTestId("empty-result");
    expect(line).toHaveTextContent(
      "Only Alder's sessions come back, with no filter in the query.",
    );
    expect(filter).toHaveAttribute("aria-hidden", "true");
    expect(empty).toHaveAttribute("data-shown", "false");
    expect(spot("Alder")).toBe("result");

    await user.click(
      screen.getByRole("button", { name: "Try to read Birch’s sessions" }),
    );
    expect(filter).toHaveAttribute("aria-hidden", "false");
    expect(filter).toHaveTextContent("where organisation_id = ‘Birch’");
    expect(line).toHaveTextContent(
      "The policy holds back Birch's, even when you ask by name.",
    );
    expect(spoken).toHaveTextContent(
      "No sessions come back. The policy holds back Birch's, even when you ask by name.",
    );
    // Nothing comes back: the signed-in sheet leaves the result for an empty one.
    expect(empty).toHaveAttribute("data-shown", "true");
    expect(empty).toHaveTextContent("No sessions");
    expect(spot("Alder")).toBe("held");
    expect(spot("Birch")).toBe("held");

    await user.click(
      screen.getByRole("button", { name: "Ask for every session again" }),
    );
    expect(filter).toHaveAttribute("aria-hidden", "true");
    expect(empty).toHaveAttribute("data-shown", "false");
    expect(spot("Alder")).toBe("result");
    expect(spoken).toHaveTextContent(
      "Only Alder's sessions come back, with no filter in the query.",
    );
  });

  it("keeps the 3D stack out of the way of clicks (its wrappers overlap the buttons)", () => {
    renderWithProviders(<DirectionC />);
    expect(screen.getByTestId("leak-stack")).toHaveClass("pointer-events-none");
  });

  it("brings the organisation picked forward as the result", async () => {
    const user = userEvent.setup();
    renderWithProviders(<DirectionC />);
    await user.click(
      screen.getByRole("button", { name: "Try to read Birch’s sessions" }),
    );
    await user.click(screen.getByRole("button", { name: "Cedar" }));
    expect(screen.getByRole("button", { name: "Cedar" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(spot("Cedar")).toBe("result");
    expect(spot("Alder")).toBe("held");
    expect(screen.getByTestId("empty-result")).toHaveAttribute(
      "data-shown",
      "false",
    );
    expect(screen.getByTestId("leak-line")).toHaveTextContent(
      "Only Cedar's sessions come back, with no filter in the query.",
    );
    expect(
      screen.getByRole("button", { name: "Try to read Alder’s sessions" }),
    ).toBeInTheDocument();
  });
});
