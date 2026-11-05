import { screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TopNav } from "./TopNav";
import { renderWithProviders } from "@/test/renderWithProviders";

describe("TopNav", () => {
  it("labels the primary navigation and lists its links", () => {
    renderWithProviders(
      <TopNav
        name="Ada Lovelace"
        links={[
          { href: "#work", label: "Work" },
          { href: "#contact", label: "Contact" },
        ]}
      />,
    );
    const nav = screen.getByRole("navigation", { name: "Primary" });
    expect(within(nav).getByRole("link", { name: "Work" })).toHaveAttribute(
      "href",
      "#work",
    );
    expect(within(nav).getByRole("link", { name: "Contact" })).toHaveAttribute(
      "href",
      "#contact",
    );
    expect(screen.getByText("Ada Lovelace")).toBeInTheDocument();
  });

  it("renders every link even when two share an href", () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    renderWithProviders(
      <TopNav
        name="Ada Lovelace"
        links={[
          { href: "#top", label: "Home" },
          { href: "#top", label: "Back to top" },
        ]}
      />,
    );
    const nav = screen.getByRole("navigation", { name: "Primary" });
    expect(within(nav).getAllByRole("link")).toHaveLength(2);
    expect(consoleError).not.toHaveBeenCalled();
  });

  it("keeps its action visible beside the links", () => {
    renderWithProviders(
      <TopNav
        name="Ada Lovelace"
        links={[{ href: "#work", label: "Work" }]}
        action={<button type="button">Request my CV</button>}
      />,
    );
    const nav = screen.getByRole("navigation", { name: "Primary" });
    const action = screen.getByRole("button", { name: "Request my CV" });
    expect(nav).not.toContainElement(action);
  });

  it("puts a menu beside the action, for the bar to show one or the other", () => {
    renderWithProviders(
      <TopNav
        name="Ada Lovelace"
        links={[{ href: "#work", label: "Work" }]}
        action={<button type="button">Get in touch</button>}
        menu={<button type="button">Menu</button>}
      />,
    );
    const nav = screen.getByRole("navigation", { name: "Primary" });
    const menu = screen.getByRole("button", { name: "Menu" });
    const action = screen.getByRole("button", { name: "Get in touch" });
    expect(nav).not.toContainElement(menu);
    // Below wide the menu shows and the action doesn't; from wide, the reverse.
    expect(menu.parentElement).toHaveClass("wide:hidden");
    expect(action.parentElement).toHaveClass("hidden", "wide:contents");
  });

  it("links the name home when given where home is", () => {
    renderWithProviders(
      <TopNav name="Ada Lovelace" links={[]} homeHref="#top" />,
    );
    expect(screen.getByRole("link", { name: "Ada Lovelace" })).toHaveAttribute(
      "href",
      "#top",
    );
  });
});
