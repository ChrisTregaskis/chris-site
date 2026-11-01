import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import { NumberedDropdown, pad2 } from "./NumberedDropdown";

const OPTIONS = [
  { value: 1, label: "Chat overlay" },
  { value: 2, label: "API server (BFF)" },
  { value: 3, label: "Supervisor agent" },
  { value: 4, label: "Try it, live demo", separated: true },
];

function Harness() {
  const [value, setValue] = useState(0);
  const text = value ? `${pad2(value)} ${OPTIONS[value - 1].label}` : "None";
  return (
    <>
      <NumberedDropdown
        label="Wayfinder part"
        options={OPTIONS}
        value={value}
        valueText={text}
        onSelect={setValue}
      >
        <span>{text}</span>
      </NumberedDropdown>
      <button type="button">Elsewhere</button>
    </>
  );
}

const trigger = () => screen.getByRole("button", { name: /Wayfinder part/ });

describe("NumberedDropdown", () => {
  it("is a button named by its label and current value", () => {
    render(<Harness />);
    expect(trigger()).toHaveAccessibleName("Wayfinder part None");
    expect(trigger()).toHaveAttribute("aria-expanded", "false");
    expect(trigger()).toHaveAttribute("aria-haspopup", "listbox");
  });

  it("opens a listbox, picks by click and closes back to the button", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(trigger());

    const list = screen.getByRole("listbox", { name: "Wayfinder part" });
    expect(list).toHaveFocus();
    expect(trigger()).toHaveAttribute("aria-expanded", "true");

    await user.click(screen.getByRole("option", { name: /Supervisor agent/ }));
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(trigger()).toHaveAccessibleName(
      "Wayfinder part 03 Supervisor agent",
    );
    expect(trigger()).toHaveFocus();
  });

  it("works from the keyboard, starting on the selected option", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    trigger().focus();
    await user.keyboard("{ArrowDown}");

    const list = screen.getByRole("listbox");
    const options = screen.getAllByRole("option");
    expect(list).toHaveAttribute("aria-activedescendant", options[0].id);
    await user.keyboard("{ArrowDown}{ArrowDown}{Enter}");
    expect(trigger()).toHaveAccessibleName(
      "Wayfinder part 03 Supervisor agent",
    );

    await user.keyboard("{Enter}");
    expect(screen.getByRole("listbox")).toHaveAttribute(
      "aria-activedescendant",
      screen.getAllByRole("option")[2].id,
    );
    expect(screen.getAllByRole("option")[2]).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await user.keyboard("4{Enter}");
    expect(trigger()).toHaveAccessibleName(
      "Wayfinder part 04 Try it, live demo",
    );
  });

  it("closes on Escape without picking, and on a click elsewhere", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(trigger());
    await user.keyboard("{ArrowDown}{Escape}");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(trigger()).toHaveAccessibleName("Wayfinder part None");
    expect(trigger()).toHaveFocus();

    await user.click(trigger());
    await user.click(screen.getByRole("button", { name: "Elsewhere" }));
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });
});
