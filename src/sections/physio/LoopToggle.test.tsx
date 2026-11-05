import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { LOOP_LABEL, LoopToggle } from "./LoopToggle";
import { renderWithProviders } from "@/test/renderWithProviders";

describe("the loop toggle", () => {
  it("says what it will do and whether it's on, in its label and aria-pressed", async () => {
    const onToggle = vi.fn();
    const { rerender } = renderWithProviders(
      <LoopToggle live looping={false} onToggle={onToggle} />,
    );
    const off = screen.getByRole("button", { name: LOOP_LABEL.off });
    expect(off).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByTestId("loop-toggle")).toHaveTextContent(
      "or try it yourself.",
    );
    await userEvent.setup().click(off);
    expect(onToggle).toHaveBeenCalledOnce();

    rerender(<LoopToggle live looping onToggle={onToggle} />);
    expect(screen.getByRole("button", { name: LOOP_LABEL.on })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("lays out both labels in every state, so it keeps one width", () => {
    const { rerender } = renderWithProviders(
      <LoopToggle live looping={false} onToggle={vi.fn()} />,
    );
    const labels = () =>
      [...screen.getByRole("button").querySelectorAll("span > span")].map(
        (span) => `${span.textContent}:${span.getAttribute("aria-hidden")}`,
      );
    expect(labels()).toEqual([
      `${LOOP_LABEL.off}:false`,
      `${LOOP_LABEL.on}:true`,
    ]);
    rerender(<LoopToggle live looping onToggle={vi.fn()} />);
    expect(labels()).toEqual([
      `${LOOP_LABEL.off}:true`,
      `${LOOP_LABEL.on}:false`,
    ]);
  });

  it("is laid out but out of reach until the leak test opens", () => {
    renderWithProviders(
      <LoopToggle live={false} looping={false} onToggle={vi.fn()} />,
    );
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.getByTestId("loop-toggle")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });
});
