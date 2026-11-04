import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DirectionC } from "./DirectionC";
import { renderWithProviders } from "@/test/renderWithProviders";

// Reduced motion: the story starts at its end state, with the policy in.
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

describe("Direction C's leak test", () => {
  it("adds the filter and gets nothing back, then resets", async () => {
    const user = userEvent.setup();
    renderWithProviders(<DirectionC />);
    const live = screen.getByText("Only Alder's sessions come back.");
    const filter = screen.getByTestId("leak-filter");
    expect(filter).toHaveAttribute("aria-hidden", "true");

    await user.click(
      screen.getByRole("button", { name: "Try to read Birch’s sessions" }),
    );
    expect(filter).toHaveAttribute("aria-hidden", "false");
    expect(filter).toHaveTextContent("where organisation_id = ‘Birch’");
    expect(live).toHaveTextContent(
      "No sessions come back. The policy holds back Birch's.",
    );

    await user.click(
      screen.getByRole("button", { name: "Ask for every session again" }),
    );
    expect(filter).toHaveAttribute("aria-hidden", "true");
    expect(live).toHaveTextContent("Only Alder's sessions come back.");
  });

  it("keeps the 3D stack out of the way of clicks (its wrappers overlap the buttons)", () => {
    renderWithProviders(<DirectionC />);
    expect(screen.getByTestId("leak-stack")).toHaveClass("pointer-events-none");
  });

  it("signs in as the organisation picked", async () => {
    const user = userEvent.setup();
    renderWithProviders(<DirectionC />);
    await user.click(screen.getByRole("button", { name: "Cedar" }));
    expect(screen.getByRole("button", { name: "Cedar" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(
      screen.getByText("Only Cedar's sessions come back."),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Try to read Alder’s sessions" }),
    ).toBeInTheDocument();
  });
});
