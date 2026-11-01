import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { CVDrawer } from "./CVDrawer";
import { CVRequestButton } from "./CVRequestButton";
import { renderWithProviders } from "@/test/renderWithProviders";

describe("CVDrawer", () => {
  it("opens on the unlocked view, focused and named by it, after an earlier unlock", async () => {
    localStorage.setItem(
      "ct:cv-unlocked:v1",
      JSON.stringify({ at: "2026-11-01T09:30:00Z" }),
    );
    const user = userEvent.setup();
    renderWithProviders(
      <>
        <CVRequestButton />
        <CVDrawer />
      </>,
    );

    await user.click(screen.getByRole("button", { name: "Request my CV" }));

    const dialog = screen.getByRole("dialog", { name: "CV unlocked" });
    expect(dialog).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "CV unlocked" }).parentElement,
    ).toHaveFocus();
  });

  it("leaves focus to the browser when it opens on the form", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <>
        <CVRequestButton />
        <CVDrawer />
      </>,
    );
    const opener = screen.getByRole("button", { name: "Request my CV" });

    await user.click(opener);

    expect(
      screen.getByRole("dialog", { name: "Request my CV" }),
    ).toBeInTheDocument();
    expect(opener).toHaveFocus();
  });
});
