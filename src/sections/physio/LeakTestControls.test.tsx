import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { LeakTestControls } from "./LeakTestControls";
import { renderWithProviders } from "@/test/renderWithProviders";

function controls(asking: boolean, single = false) {
  return (
    <LeakTestControls
      live
      target="Birch"
      asking={asking}
      onTry={vi.fn()}
      onReset={vi.fn()}
      single={single}
    />
  );
}

describe("the leak test's controls", () => {
  it("beside the steps, lays out the same buttons in every state and shows ask-again only while asking", () => {
    const { container, rerender } = renderWithProviders(controls(false));
    const laidOut = () => container.querySelectorAll("button").length;
    expect(laidOut()).toBe(2);
    expect(
      screen.queryByRole("button", { name: "Ask for every session again" }),
    ).not.toBeInTheDocument();

    rerender(controls(true));
    expect(laidOut()).toBe(2);
    expect(
      screen.getByRole("button", { name: "Ask for every session again" }),
    ).toHaveAttribute("tabindex", "0");
    expect(
      screen.getByRole("button", { name: "Try to read Birch’s sessions" }),
    ).toBeInTheDocument();
  });

  it("on phones, shows one button at a time", () => {
    const { rerender } = renderWithProviders(controls(false, true));
    expect(
      screen.getByRole("button", { name: "Try to read Birch’s sessions" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Ask for every session again" }),
    ).not.toBeInTheDocument();
    rerender(controls(true, true));
    expect(
      screen.queryByRole("button", { name: "Try to read Birch’s sessions" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Ask for every session again" }),
    ).toBeInTheDocument();
  });
});
