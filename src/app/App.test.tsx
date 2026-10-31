import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { App } from "./App";
import { renderWithProviders } from "@/test/renderWithProviders";

const CV_URL =
  "https://drive.google.com/file/d/1AZSv0lZslUnKFXBZXfNR6NeZ1FUkLonj/view";
const FILE_ID_PLACEHOLDER =
  "[ To access file id, please first click PDF icon and complete form request. ]";

const keyFor = (tip: string) => {
  const button = screen.getByText(tip).closest("button");
  if (!button) throw new Error(`No key with tooltip ${tip}`);
  return button;
};

describe("App", () => {
  it("auto-advances the terminal to the hidden file id", async () => {
    vi.useFakeTimers();
    renderWithProviders(<App />);

    expect(screen.getByText("yourcomputer ~/ $")).toBeInTheDocument();
    expect(screen.queryByText(FILE_ID_PLACEHOLDER)).not.toBeInTheDocument();

    await act(async () => {
      vi.advanceTimersByTime(5000);
    });
    await act(async () => {
      vi.advanceTimersByTime(5000);
    });
    expect(screen.getByText(FILE_ID_PLACEHOLDER)).toBeInTheDocument();
  });

  it("toggles between the terminal and About", async () => {
    const user = userEvent.setup();
    renderWithProviders(<App />);

    await user.click(keyFor("About Me"));
    expect(
      screen.getByRole("heading", { name: "Chris Tregaskis" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Software Developer" }),
    ).toBeInTheDocument();

    await user.click(keyFor("Terminal"));
    expect(
      screen.queryByRole("heading", { name: "Chris Tregaskis" }),
    ).not.toBeInTheDocument();
  });

  it("opens the CV form until the CV is unlocked, then opens Drive", async () => {
    vi.stubEnv("VITE_CHRIS_API", "https://api.test");
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({ ok: true })),
    );
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);
    const user = userEvent.setup();
    renderWithProviders(<App />);

    await user.click(keyFor("Request CV"));
    expect(
      screen.getByRole("heading", { name: "Unlock Chris's CV" }),
    ).toBeInTheDocument();
    expect(openSpy).not.toHaveBeenCalled();

    await user.type(screen.getByLabelText("First Name"), "Ada");
    await user.type(screen.getByLabelText("Email Address"), "ada@example.com");
    await user.click(screen.getByRole("button", { name: "Submit" }));
    await screen.findByRole("heading", { name: "CV Unlocked!" });

    await user.click(keyFor("Request CV"));
    expect(openSpy).toHaveBeenCalledWith(CV_URL);
  });

  it("shows the Enter key only on the terminal view", async () => {
    const user = userEvent.setup();
    renderWithProviders(<App />);

    expect(
      screen.getByText("Press enter to toggle commands"),
    ).toBeInTheDocument();
    await user.click(keyFor("About Me"));
    expect(
      screen.queryByText("Press enter to toggle commands"),
    ).not.toBeInTheDocument();
  });
});
