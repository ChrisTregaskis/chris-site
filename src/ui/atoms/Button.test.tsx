import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Button } from "./Button";
import { renderWithProviders } from "@/test/renderWithProviders";

describe("Button", () => {
  it("defaults to a non-submitting button", () => {
    renderWithProviders(<Button>Send</Button>);
    expect(screen.getByRole("button", { name: "Send" })).toHaveAttribute(
      "type",
      "button",
    );
  });

  it("calls onClick when pressed", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    renderWithProviders(<Button onClick={onClick}>Send</Button>);
    await user.click(screen.getByRole("button", { name: "Send" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("while loading, keeps its name, announces busy and ignores clicks", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    renderWithProviders(
      <Button type="submit" loading onClick={onClick}>
        Unlock the CV
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Unlock the CV" });
    expect(button).toHaveAttribute("aria-busy", "true");
    expect(button).toHaveAttribute("aria-disabled", "true");
    expect(button).not.toBeDisabled();

    await user.tab();
    expect(button).toHaveFocus();

    await user.click(button);
    await user.keyboard("{Enter}");
    expect(onClick).not.toHaveBeenCalled();
  });

  it("does not submit its form while loading", async () => {
    const onSubmit = vi.fn((event: React.FormEvent) => event.preventDefault());
    const user = userEvent.setup();
    renderWithProviders(
      <form onSubmit={onSubmit}>
        <Button type="submit" loading>
          Unlock the CV
        </Button>
      </form>,
    );
    await user.click(screen.getByRole("button", { name: "Unlock the CV" }));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("ignores clicks when the caller marks it aria-disabled", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    renderWithProviders(
      <Button aria-disabled onClick={onClick}>
        Send
      </Button>,
    );
    await user.click(screen.getByRole("button", { name: "Send" }));
    expect(onClick).not.toHaveBeenCalled();
  });

  it("exposes a pressed state", () => {
    renderWithProviders(<Button pressed>Try it</Button>);
    expect(screen.getByRole("button", { name: "Try it" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });
});
