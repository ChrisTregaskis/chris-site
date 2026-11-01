import { screen, within } from "@testing-library/react";
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
  it("shows the physio story's end state: only the signed-in practice's rows", () => {
    renderWithProviders(<App />);
    const physio = screen.getByRole("region", {
      name: "A multi-tenant SaaS for physio and wellness practices",
    });
    expect(
      within(physio).getByText("Signed in as Riverside Wellness"),
    ).toBeInTheDocument();
    expect(within(physio).getAllByText(", hidden")).toHaveLength(4);
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
});
