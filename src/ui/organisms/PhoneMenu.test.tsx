import { fireEvent, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { PhoneMenu } from "./PhoneMenu";
import { type NavMenuItem } from "./NavMenuLinks";
import { QUIET_FOCUS_ATTRIBUTE } from "@/lib/quietFocus";
import { renderWithProviders } from "@/test/renderWithProviders";

const ITEMS: NavMenuItem[] = [
  { href: "#one", label: "First study", numeral: "1" },
  { href: "#one-more", label: "How it was made", sub: true },
  { href: "#two", label: "Second study", numeral: "2" },
];

const LINKS = [
  { href: "#about", label: "About" },
  { href: "#contact", label: "Contact" },
];

function renderMenu(onAction = vi.fn()) {
  renderWithProviders(
    <PhoneMenu
      name="Ada Lovelace"
      homeHref="#top"
      items={ITEMS}
      links={LINKS}
      action={
        <button type="button" onClick={onAction}>
          Say hello
        </button>
      }
    />,
  );
  const button = screen.getByRole("button", { name: "Menu" });
  const dialog = () =>
    document.getElementById(
      button.getAttribute("aria-controls") ?? "",
    ) as HTMLDialogElement;
  return { button, dialog };
}

describe("PhoneMenu", () => {
  it("is a Menu button that opens the page's links, focus moving into it", async () => {
    const user = userEvent.setup();
    const { button, dialog } = renderMenu();
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await user.click(button);
    expect(button).toHaveAttribute("aria-expanded", "true");
    expect(dialog()).toHaveAttribute("open");
    const menu = screen.getByRole("dialog", { name: "Menu" });
    expect(menu).toBe(dialog());

    const nav = within(menu).getByRole("navigation", { name: "Primary" });
    expect(
      within(nav)
        .getAllByRole("link")
        .map((link) => [link.textContent, link.getAttribute("href")]),
    ).toEqual([
      ["1First study", "#one"],
      ["How it was made", "#one-more"],
      ["2Second study", "#two"],
      ["About", "#about"],
      ["Contact", "#contact"],
    ]);
    expect(within(nav).getByRole("list", { name: "Work" })).toBeInTheDocument();
    expect(
      within(menu).getByRole("link", { name: "Ada Lovelace" }),
    ).toHaveAttribute("href", "#top");
    expect(
      within(menu).getByRole("button", { name: "Say hello" }),
    ).toBeInTheDocument();
    // A click lands focus on the menu itself; the keyboard, on its first link.
    expect(menu).toHaveFocus();
  });

  it("shows no focus ring after a tap or click, and shows it after the keyboard", async () => {
    const user = userEvent.setup();
    const { button } = renderMenu();
    const quiet = (element: Element) =>
      element.hasAttribute(QUIET_FOCUS_ATTRIBUTE);

    // Tapped open: focus on the menu itself, no ring, no link looking chosen.
    await user.click(button);
    const menu = screen.getByRole("dialog", { name: "Menu" });
    expect(menu).toHaveFocus();
    expect(quiet(menu)).toBe(true);
    // Tapped shut: focus back on Menu, again with no ring.
    await user.click(screen.getByRole("button", { name: "Close menu" }));
    expect(button).toHaveFocus();
    expect(quiet(button)).toBe(true);

    // From the keyboard, both moves keep their ring.
    await user.keyboard("{Enter}");
    const first = screen.getByRole("link", { name: "First study" });
    expect(first).toHaveFocus();
    expect(quiet(first)).toBe(false);
    await user.keyboard("{Escape}");
    fireEvent(menu, new Event("cancel", { cancelable: true }));
    expect(button).toHaveFocus();
    expect(quiet(button)).toBe(false);
  });

  it("closes on Escape, handing focus back to the button", async () => {
    const user = userEvent.setup();
    const { button, dialog } = renderMenu();
    await user.click(button);

    // jsdom's dialog has no key handling, so fire what Escape sends.
    fireEvent(dialog(), new Event("cancel", { cancelable: true }));
    expect(dialog()).not.toHaveAttribute("open");
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(button).toHaveFocus();
  });

  it("closes from its own Close button, where Menu was", async () => {
    const user = userEvent.setup();
    const { button, dialog } = renderMenu();
    await user.click(button);

    await user.click(screen.getByRole("button", { name: "Close menu" }));
    expect(dialog()).not.toHaveAttribute("open");
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(button).toHaveFocus();
  });

  it("closes when a link is chosen, leaving the link to the page", async () => {
    const user = userEvent.setup();
    const { button, dialog } = renderMenu();
    const onPageClick = vi.fn((event: MouseEvent) => event.preventDefault());
    document.addEventListener("click", onPageClick);

    const choose = async (name: string) => {
      await user.click(button);
      await user.click(screen.getByRole("link", { name }));
      expect(dialog()).not.toHaveAttribute("open");
      expect(button).toHaveAttribute("aria-expanded", "false");
    };
    await choose("Second study");
    await choose("Contact");
    await choose("Ada Lovelace");
    // Each click still reached the page's anchor scroll.
    expect(onPageClick).toHaveBeenCalledTimes(6);
    document.removeEventListener("click", onPageClick);
  });

  it("closes when its call to action is chosen, handing focus back first", async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    const { button, dialog } = renderMenu(onAction);
    await user.click(button);

    await user.click(screen.getByRole("button", { name: "Say hello" }));
    expect(onAction).toHaveBeenCalledTimes(1);
    expect(dialog()).not.toHaveAttribute("open");
    expect(button).toHaveFocus();
  });

  it("closes when the window grows until its button is hidden", async () => {
    const user = userEvent.setup();
    const { button, dialog } = renderMenu();
    await user.click(button);

    // Still on a phone: the button shows, the menu stays.
    const shown = [new DOMRect(0, 0, 50, 44)] as unknown as DOMRectList;
    vi.spyOn(button, "getClientRects").mockReturnValue(shown);
    fireEvent(window, new Event("resize"));
    expect(dialog()).toHaveAttribute("open");

    // Wide: the bar hides the button.
    const hidden = [] as unknown as DOMRectList;
    vi.spyOn(button, "getClientRects").mockReturnValue(hidden);
    fireEvent(window, new Event("resize"));
    expect(dialog()).not.toHaveAttribute("open");
    expect(button).toHaveAttribute("aria-expanded", "false");
  });
});
