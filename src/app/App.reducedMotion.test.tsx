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
  it("shows the physio story's end state: only the signed-in clinic's rows", () => {
    renderWithProviders(<App />);
    const physio = screen.getByRole("region", {
      name: "A multi-tenant SaaS for physio clinics",
    });
    expect(
      within(physio).getByText("Signed in as Riverside Physio"),
    ).toBeInTheDocument();
    expect(within(physio).getAllByText(", hidden")).toHaveLength(4);
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
  });
});
