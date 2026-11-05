import { fireEvent } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { QUIET_FOCUS_ATTRIBUTE, quietFocus } from "./quietFocus";

afterEach(() => {
  document.body.innerHTML = "";
});

function twoButtons() {
  document.body.innerHTML =
    '<button type="button">One</button><button type="button">Two</button>';
  return [...document.querySelectorAll("button")];
}

describe("quietFocus", () => {
  it("focuses the element, marked so its ring stays hidden", () => {
    const [one] = twoButtons();
    quietFocus(one);
    expect(one).toHaveFocus();
    expect(one).toHaveAttribute(QUIET_FOCUS_ATTRIBUTE);
  });

  it("drops the mark on the next key press, so the keyboard gets its ring", () => {
    const [one] = twoButtons();
    quietFocus(one);
    fireEvent.keyDown(one, { key: "Tab" });
    expect(one).not.toHaveAttribute(QUIET_FOCUS_ATTRIBUTE);
  });

  it("drops the mark when focus leaves", () => {
    const [one, two] = twoButtons();
    quietFocus(one);
    two.focus();
    expect(one).not.toHaveAttribute(QUIET_FOCUS_ATTRIBUTE);
    expect(two).not.toHaveAttribute(QUIET_FOCUS_ATTRIBUTE);
  });
});
