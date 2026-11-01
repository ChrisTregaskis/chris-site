import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { App } from "./App";
import { renderWithProviders } from "@/test/renderWithProviders";

describe("App", () => {
  it("leads with who Chris is and what he does", () => {
    renderWithProviders(<App />);
    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /I build whole products, end to end/,
      }),
    ).toBeInTheDocument();
    const nav = screen.getByRole("navigation", { name: "Primary" });
    expect(
      within(nav)
        .getAllByRole("link")
        .map((link) => link.getAttribute("href")),
    ).toEqual(["#work", "#about", "#contact"]);
  });

  it("tells the story in order: the work, how it's built, about and contact", () => {
    renderWithProviders(<App />);
    expect(
      screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent),
    ).toEqual([
      "Wayfinder, an AI guide for a global automotive brand",
      "A multi-tenant SaaS for physio clinics",
      "Badass Burpees",
      "AI prototypes and MCP tooling",
      "E-commerce for food manufacturing",
      "How I work with AI",
      "About",
      "Always up for an interesting side project. Get in touch.",
    ]);
    expect(
      screen.getByRole("heading", { level: 3, name: "How it was built" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("img", {
        name: "Chris with his son on his shoulders, out walking through the ferns",
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /GitHub/ })).toHaveAttribute(
      "href",
      "https://github.com/ChrisTregaskis",
    );
    expect(screen.getByRole("link", { name: /Articles/ })).toHaveAttribute(
      "href",
      "https://medium.com/@c.tregaskis",
    );
  });

  it("opens the CV drawer from any Request my CV button and closes it again", async () => {
    vi.stubEnv("VITE_CHRIS_API", "https://api.test");
    const user = userEvent.setup();
    renderWithProviders(<App />);

    const buttons = screen.getAllByRole("button", { name: "Request my CV" });
    expect(buttons.length).toBeGreaterThanOrEqual(3);

    await user.click(buttons[0]);
    const drawer = screen.getByRole("dialog", { name: "Request my CV" });
    expect(drawer).toHaveAttribute("open");

    await user.click(within(drawer).getByRole("button", { name: "Close" }));
    expect(drawer).not.toHaveAttribute("open");
    expect(buttons[0]).toHaveFocus();
  });

  it("keeps the CV unlocked when the drawer is opened again", async () => {
    vi.stubEnv("VITE_CHRIS_API", "https://api.test");
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({ ok: true })),
    );
    const user = userEvent.setup();
    renderWithProviders(<App />);

    const [open] = screen.getAllByRole("button", { name: "Request my CV" });
    await user.click(open);
    await user.type(screen.getByLabelText("First name"), "Ada");
    await user.type(screen.getByLabelText("Email address"), "ada@example.com");
    await user.click(screen.getByRole("button", { name: "Unlock the CV" }));
    await user.click(
      await screen.findByRole("button", { name: "Back to the site" }),
    );

    await user.click(open);
    expect(screen.getByRole("dialog", { name: "CV unlocked" })).toHaveAttribute(
      "open",
    );
    expect(screen.getByRole("link", { name: "View CV" })).toBeInTheDocument();
  });
});
