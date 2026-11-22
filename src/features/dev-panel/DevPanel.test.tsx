import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { DevPanel } from "./DevPanel";
import { defineDevSettings, devGroups } from "./devSettings";

type Trial = { shade: boolean; size: "small" | "large" };
const DEFAULTS: Trial = { shade: false, size: "small" };

let before = 0;
function trial(note?: string) {
  before = devGroups.length;
  return defineDevSettings<Trial>(DEFAULTS, {
    title: "Trial",
    controls: [
      { kind: "flag", key: "shade", label: "Shade" },
      {
        kind: "choice",
        key: "size",
        label: "Size",
        options: [
          { value: "small", label: "Small" },
          { value: "large", label: "Large" },
        ],
      },
    ],
    inactive: (key, values) => key === "size" && !values.shade,
    useNote: note ? () => note : undefined,
  });
}

afterEach(() => {
  devGroups.splice(before);
  window.history.replaceState(null, "", "/");
});

describe("DevPanel", () => {
  it("shows each experiment's controls, greys out what can't apply, and writes changes to the URL", async () => {
    const user = userEvent.setup();
    const settings = trial();
    render(<DevPanel />);
    const group = screen.getByRole("group", { name: "Trial" });
    expect(group).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Large" })).toBeDisabled();

    await user.click(screen.getByRole("checkbox", { name: "Shade" }));
    expect(settings.get().shade).toBe(true);
    await user.click(screen.getByRole("radio", { name: "Large" }));
    expect(settings.get().size).toBe("large");
    expect(window.location.search).toContain("size=large");
  });

  it("follows changes made elsewhere, and shows a group's note", () => {
    const settings = trial("Holding still here.");
    render(<DevPanel />);
    act(() => settings.set({ shade: true }));
    expect(screen.getByRole("checkbox", { name: "Shade" })).toBeChecked();
    expect(screen.getByText("Holding still here.")).toBeInTheDocument();
  });

  it("folds away", async () => {
    const user = userEvent.setup();
    trial();
    render(<DevPanel />);
    await user.click(screen.getByRole("button", { name: /Dev panel/ }));
    expect(screen.queryByRole("group", { name: "Trial" })).toBeNull();
  });
});
