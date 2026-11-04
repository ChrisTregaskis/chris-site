import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { NavMenu, type NavMenuItem } from "./NavMenu";
import { renderWithProviders } from "@/test/renderWithProviders";

const ITEMS: NavMenuItem[] = [
  { href: "#one", label: "First study", numeral: "1" },
  { href: "#one-more", label: "How it was made", sub: true },
  { href: "#two", label: "Second study", numeral: "2" },
];

function renderMenu() {
  renderWithProviders(
    <>
      <NavMenu label="Work" items={ITEMS} />
      <button type="button">Elsewhere</button>
    </>,
  );
  return screen.getByRole("button", { name: "Work" });
}

const shownLinks = () => screen.queryAllByRole("link");

describe("NavMenu", () => {
  it("is a button that shows and hides its links, saying which it is doing", async () => {
    const user = userEvent.setup();
    const button = renderMenu();
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(shownLinks()).toHaveLength(0);

    await user.click(button);
    expect(button).toHaveAttribute("aria-expanded", "true");
    const list = document.getElementById(
      button.getAttribute("aria-controls") ?? "",
    ) as HTMLElement;
    expect(
      within(list)
        .getAllByRole("link")
        .map((link) => [link.textContent, link.getAttribute("href")]),
    ).toEqual([
      ["1First study", "#one"],
      ["How it was made", "#one-more"],
      ["2Second study", "#two"],
    ]);

    await user.click(button);
    expect(button).toHaveAttribute("aria-expanded", "false");
  });

  it("names each link by its label alone; the numeral is decoration", async () => {
    const user = userEvent.setup();
    await user.click(renderMenu());
    expect(
      screen.getByRole("link", { name: "First study" }),
    ).toBeInTheDocument();
  });

  it("opens from the keyboard, moves with the arrows and closes on Escape, back on the button", async () => {
    const user = userEvent.setup();
    const button = renderMenu();
    button.focus();

    await user.keyboard("{ArrowDown}");
    expect(button).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("link", { name: "First study" })).toHaveFocus();

    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("link", { name: "How it was made" })).toHaveFocus();
    await user.keyboard("{End}");
    expect(screen.getByRole("link", { name: "Second study" })).toHaveFocus();
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("link", { name: "First study" })).toHaveFocus();

    await user.keyboard("{Escape}");
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(button).toHaveFocus();

    await user.keyboard("{Enter}");
    expect(button).toHaveAttribute("aria-expanded", "true");
  });

  it("closes when a link is chosen, on a click outside, or when focus leaves it", async () => {
    const user = userEvent.setup();
    const button = renderMenu();

    await user.click(button);
    await user.click(screen.getByRole("link", { name: "Second study" }));
    expect(button).toHaveAttribute("aria-expanded", "false");

    await user.click(button);
    await user.click(document.body);
    expect(button).toHaveAttribute("aria-expanded", "false");

    await user.click(button);
    screen.getByRole("link", { name: "Second study" }).focus();
    await user.tab();
    expect(screen.getByRole("button", { name: "Elsewhere" })).toHaveFocus();
    expect(button).toHaveAttribute("aria-expanded", "false");
  });
});
