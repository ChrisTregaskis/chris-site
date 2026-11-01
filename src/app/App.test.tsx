import { fireEvent, screen, within } from "@testing-library/react";
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
      "A multi-tenant SaaS for physio and wellness practices",
      "Badass Burpees",
      "AI prototypes and MCP tooling",
      "E-commerce for food manufacturing",
      "How I work with AI",
      "About",
      "Let's work together.",
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

  it("leads with Get in touch: the bar, the hero and Contact each open the enquiry", async () => {
    vi.stubEnv("VITE_CHRIS_API", "https://api.test");
    const user = userEvent.setup();
    renderWithProviders(<App />);

    const bar = screen
      .getByRole("navigation", { name: "Primary" })
      .closest("header") as HTMLElement;
    const hero = screen.getByRole("region", { name: /I build whole products/ });
    const contact = screen.getByRole("region", {
      name: "Let's work together.",
    });
    // The bar has one action, and it's Get in touch.
    expect(
      within(bar)
        .getAllByRole("button")
        .map((b) => b.textContent),
    ).toEqual(["Get in touch"]);
    // Hero and Contact: Get in touch first, Request my CV second.
    for (const region of [hero, contact]) {
      expect(
        within(region)
          .getAllByRole("button")
          .map((b) => b.textContent),
      ).toEqual(["Get in touch", "Request my CV"]);
    }
    expect(
      within(contact)
        .getAllByRole("link")
        .map((link) => link.textContent.replace(" (opens in a new tab)", "")),
    ).toEqual(["LinkedIn", "GitHub", "Articles"]);

    const opensTheEnquiry = async (region: HTMLElement) => {
      const opener = within(region).getByRole("button", {
        name: "Get in touch",
      });
      await user.click(opener);
      const drawer = screen.getByRole("dialog", { name: "Get in touch" });
      expect(drawer).toHaveAttribute("open");
      expect(
        screen.queryByRole("dialog", { name: "Request my CV" }),
      ).not.toBeInTheDocument();

      // Escape: jsdom's dialog has no key handling, so fire what it sends.
      fireEvent(drawer, new Event("cancel", { cancelable: true }));
      expect(drawer).not.toHaveAttribute("open");
      expect(opener).toHaveFocus();
    };
    await opensTheEnquiry(bar);
    await opensTheEnquiry(hero);
    await opensTheEnquiry(contact);
  });

  it("opens the CV drawer from any Request my CV button and closes it again", async () => {
    vi.stubEnv("VITE_CHRIS_API", "https://api.test");
    const user = userEvent.setup();
    renderWithProviders(<App />);

    const buttons = screen.getAllByRole("button", { name: "Request my CV" });
    expect(buttons).toHaveLength(2);

    await user.click(buttons[0]);
    const drawer = screen.getByRole("dialog", { name: "Request my CV" });
    expect(drawer).toHaveAttribute("open");

    expect(
      screen.queryByRole("dialog", { name: "Get in touch" }),
    ).not.toBeInTheDocument();
    await user.click(within(drawer).getByRole("button", { name: "Close" }));
    expect(drawer).not.toHaveAttribute("open");
    expect(buttons[0]).toHaveFocus();

    await user.click(buttons[1]);
    expect(drawer).toHaveAttribute("open");
  });

  it("keeps the enquiry sent when the drawer is opened again", async () => {
    vi.stubEnv("VITE_CHRIS_API", "https://api.test");
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({ ok: true })),
    );
    const user = userEvent.setup();
    renderWithProviders(<App />);

    const [open] = screen.getAllByRole("button", { name: "Get in touch" });
    await user.click(open);
    const enquiry = within(
      screen.getByRole("dialog", { name: "Get in touch" }),
    );
    await user.type(enquiry.getByLabelText("Name"), "Ada");
    await user.type(enquiry.getByLabelText("Email address"), "ada@example.com");
    await user.type(enquiry.getByLabelText("What's it about?"), "Hello");
    await user.click(enquiry.getByRole("button", { name: "Send message" }));
    await user.click(
      await screen.findByRole("button", { name: "Back to the site" }),
    );
    expect(open).toHaveFocus();

    await user.click(open);
    expect(
      screen.getByRole("dialog", { name: "Message sent" }),
    ).toHaveAttribute("open");
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
    const cv = within(screen.getByRole("dialog", { name: "Request my CV" }));
    await user.type(cv.getByLabelText("First name"), "Ada");
    await user.type(cv.getByLabelText("Email address"), "ada@example.com");
    await user.click(cv.getByRole("button", { name: "Unlock the CV" }));
    await user.click(
      await screen.findByRole("button", { name: "Back to the site" }),
    );

    await user.click(open);
    expect(screen.getByRole("dialog", { name: "CV unlocked" })).toHaveAttribute(
      "open",
    );
    expect(screen.getByRole("link", { name: /^View CV/ })).toBeInTheDocument();
  });
});
