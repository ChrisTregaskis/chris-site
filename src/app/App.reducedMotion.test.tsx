import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "./App";
import { renderWithProviders } from "@/test/renderWithProviders";

// Every scroll story falls back to its finished, static state.
beforeEach(() => {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: query.includes("reduced-motion"),
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
  }));
});

describe("App under reduced motion", () => {
  it("shows the physio story's end state: only the signed-in organisation's sessions come back", async () => {
    renderWithProviders(<App />);
    const physio = screen.getByRole("region", {
      name: "A multi-tenant platform for physio and wellness",
    });
    // The drawing loads on its own.
    await within(physio).findByTestId("sessions-stack");
    expect(
      within(physio)
        .getByText(/set local/)
        .closest("p"),
    ).toHaveTextContent("set local organisation = ‘Alder’");
    expect(physio.querySelector("[aria-live]")).toHaveTextContent(
      "Only Alder's sessions come back, with no filter in the query.",
    );
    const spots = [...physio.querySelectorAll("[data-sheet]")].map(
      (sheet) =>
        `${sheet.getAttribute("data-sheet")}: ${sheet.getAttribute("data-spot")}`,
    );
    expect(spots).toEqual(["Alder: result", "Birch: held", "Cedar: held"]);
    // Static: the leak test is open, with no demo playing itself.
    expect(
      within(physio).getByRole("button", {
        name: "Try to read Birch’s sessions",
      }),
    ).toBeInTheDocument();
    expect(
      within(physio).queryByRole("button", { name: /demo/ }),
    ).not.toBeInTheDocument();
  });

  it("shows the build lane finished, with the eval bench as a note beneath it", () => {
    renderWithProviders(<App />);
    const lane = screen.getByRole("region", { name: "How it was built" });
    const steps = within(lane).getAllByRole("listitem");
    expect(steps.map((step) => step.querySelector("b")?.textContent)).toEqual([
      "Spec",
      "Plan",
      "AI-assisted build",
      "Review gates",
      "Ship",
    ]);
    // The bench is off the lane: not a step, not inside one.
    expect(within(lane).getByRole("list")).not.toHaveTextContent("Eval bench");
    const bench = within(lane).getByRole("complementary", {
      name: "Eval bench",
    });
    expect(bench).toHaveTextContent(
      /regression suite of conversation scenarios, run before every release\..*rather than every edge case/,
    );
    // Static: the lane is drawn in full and the note is simply there.
    const track = within(lane).getByRole("list").parentElement;
    expect(track?.style.getPropertyValue("--p")).toBe("1");
    expect(bench).not.toHaveStyle({ opacity: "0" });
  });

  it("shows a finished Badass Burpees set", () => {
    renderWithProviders(<App />);
    const burpees = screen.getByRole("region", { name: "Badass Burpees" });
    expect(within(burpees).getByText("100")).toBeInTheDocument();
    expect(
      within(burpees).getByText("One every 12.0s, 00:00 left"),
    ).toBeInTheDocument();
    expect(
      within(burpees).getByRole("link", { name: /Open badass-burpees.app/ }),
    ).toHaveAttribute("href", "https://badass-burpees.app/");
    expect(
      within(burpees).getByRole("link", {
        name: /^See the atomic design system\s*\(opens in a new tab\)$/,
      }),
    ).toHaveAttribute("href", "https://badass-burpees.app/design");
  });

  it("takes in-page links straight to their section, updates the hash and moves focus to its heading", async () => {
    const user = userEvent.setup();
    const scrollTo = vi.fn();
    vi.stubGlobal("scrollTo", scrollTo);
    renderWithProviders(<App />);

    await user.click(screen.getByRole("link", { name: "About" }));
    expect(scrollTo).toHaveBeenCalledWith(
      expect.objectContaining({ behavior: "instant" }),
    );
    expect(window.location.hash).toBe("#about");
    expect(screen.getByRole("heading", { name: "About" })).toHaveFocus();
  });

  it("offers each case study from the Work menu, each to a target on the page", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("scrollTo", vi.fn());
    renderWithProviders(<App />);

    await user.click(screen.getByRole("button", { name: "Work" }));
    const links = screen
      .getAllByRole("link")
      .filter((link) => link.closest("nav"))
      .filter((link) => !["About", "Contact"].includes(link.textContent));
    expect(links.map((link) => link.getAttribute("href"))).toEqual([
      "#work",
      "#how-it-was-built",
      "#physio",
      "#burpees",
    ]);
    for (const link of links) {
      const id = (link.getAttribute("href") ?? "").slice(1);
      expect(document.getElementById(id)).not.toBeNull();
    }

    await user.click(screen.getByRole("link", { name: "Badass Burpees" }));
    expect(screen.getByRole("button", { name: "Work" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    expect(
      screen.getByRole("heading", { name: "Badass Burpees" }),
    ).toHaveFocus();
  });

  it("takes the name in the bar home: to the top, focus on the headline", async () => {
    const user = userEvent.setup();
    const scrollTo = vi.fn();
    vi.stubGlobal("scrollTo", scrollTo);
    renderWithProviders(<App />);

    await user.click(screen.getByRole("link", { name: "Chris Tregaskis" }));
    expect(scrollTo).toHaveBeenLastCalledWith({ top: 0, behavior: "instant" });
    expect(window.location.hash).toBe("#top");
    expect(screen.getByRole("heading", { level: 1 })).toHaveFocus();
  });
});
