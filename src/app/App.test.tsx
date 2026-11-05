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
    expect(within(nav).getByRole("button", { name: "Work" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    expect(
      within(nav)
        .getAllByRole("link")
        .map((link) => link.getAttribute("href")),
    ).toEqual(["#about", "#contact"]);
  });

  it("sets the whole headline in ink, as one sentence", () => {
    renderWithProviders(<App />);
    const headline = screen.getByRole("heading", { level: 1 });
    expect(headline).toHaveTextContent(
      "I build whole products, end to end, built properly and shipped quickly with AI in the workflow.",
    );
    // No phrase set apart in another colour.
    expect(headline.children).toHaveLength(0);
  });

  it("numbers the case studies 1 to 3, as decoration", () => {
    renderWithProviders(<App />);
    for (const [region, numeral] of [
      [/^Wayfinder/, "1"],
      [/^A multi-tenant platform/, "2"],
      ["Badass Burpees", "3"],
    ] as const) {
      const section = screen.getByRole("region", { name: region });
      const number = within(section)
        .getAllByText(numeral)
        .find((element) => element.getAttribute("aria-hidden") === "true");
      expect(number).toBeDefined();
    }
  });

  it("gives each case study a progress rail out of three, as decoration", () => {
    const { container } = renderWithProviders(<App />);
    const rails = [...container.querySelectorAll(".chapter-rail")];
    expect(rails.map((rail) => rail.textContent)).toEqual([
      "1/3",
      "2/3",
      "3/3",
    ]);
    for (const rail of rails) {
      expect(rail).toHaveAttribute("aria-hidden", "true");
      // It spans its chapter, whose view it is driven by.
      expect(rail.parentElement).toHaveClass("chapter-tone");
    }
  });

  it("sends a spark along the build lane's pinned run", () => {
    renderWithProviders(<App />);
    const lane = screen.getByRole("region", { name: "How it was built" });
    expect(lane.querySelector(".build-head")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });

  it("tells the story in order: the work, how it's built, about and contact", () => {
    renderWithProviders(<App />);
    expect(
      screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent),
    ).toEqual([
      "Wayfinder, an AI guide for a global automotive brand",
      "A multi-tenant platform for physio and wellness",
      "Badass Burpees",
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

  it("describes Chris's own build as AI-assisted, one step at a time, never parallel agents", () => {
    renderWithProviders(<App />);
    const page = document.body.textContent;
    expect(page).not.toMatch(
      /agents build|agents implement|in parallel|several at once|subagent|fleet/i,
    );
    const lane = screen.getByRole("region", { name: "How it was built" });
    expect(within(lane).getByText("AI-assisted build")).toBeInTheDocument();
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
    // The bar has one action, Get in touch (Work is a menu in the nav), and
    // the phone menu that takes its place below wide.
    const nav = within(bar).getByRole("navigation", { name: "Primary" });
    expect(
      within(bar)
        .getAllByRole("button")
        .filter((b) => !nav.contains(b))
        .map((b) => b.textContent),
    ).toEqual(["Menu", "Get in touch"]);
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

  it("folds the bar into a phone menu: the Work menu's case studies, About, Contact, then Get in touch", async () => {
    vi.stubEnv("VITE_CHRIS_API", "https://api.test");
    const user = userEvent.setup();
    renderWithProviders(<App />);
    const nav = screen.getByRole("navigation", { name: "Primary" });
    await user.click(within(nav).getByRole("button", { name: "Work" }));
    const work = within(nav)
      .getAllByRole("link")
      .map((link) => [link.textContent, link.getAttribute("href")]);
    await user.keyboard("{Escape}");

    const button = screen.getByRole("button", { name: "Menu" });
    await user.click(button);
    const menu = screen.getByRole("dialog", { name: "Menu" });
    expect(
      within(menu)
        .getAllByRole("link")
        .map((link) => [link.textContent, link.getAttribute("href")]),
    ).toEqual([["Chris Tregaskis", "#top"], ...work]);

    // Get in touch: the menu closes and the enquiry opens; closing that
    // comes back to Menu.
    await user.click(
      within(menu).getByRole("button", { name: "Get in touch" }),
    );
    expect(menu).not.toHaveAttribute("open");
    const drawer = screen.getByRole("dialog", { name: "Get in touch" });
    expect(drawer).toHaveAttribute("open");
    fireEvent(drawer, new Event("cancel", { cancelable: true }));
    expect(button).toHaveFocus();
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
