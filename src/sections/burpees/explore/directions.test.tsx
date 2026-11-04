import { screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DirectionA } from "./DirectionA";
import { DirectionC } from "./DirectionC";
import { renderWithProviders } from "@/test/renderWithProviders";

function reducedMotion() {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: query.includes("reduced-motion"),
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
  }));
}

const region = () => screen.getByRole("region", { name: "Badass Burpees" });

describe("the exploration directions", () => {
  it.each([
    ["A", DirectionA],
    ["C", DirectionC],
  ])("direction %s keeps the opening line and both links", (_, Direction) => {
    renderWithProviders(<Direction />);
    expect(
      within(region()).getByText(
        /^A fitness app I built for myself, .*shared with everyone for free\./,
      ),
    ).toBeInTheDocument();
    expect(
      within(region()).getByRole("link", { name: /badass-burpees\.app/ }),
    ).toHaveAttribute("href", "https://badass-burpees.app/");
    expect(
      within(region()).getByRole("link", { name: /design system/ }),
    ).toHaveAttribute("href", "https://badass-burpees.app/design");
  });

  it("C finishes the set and lists every call under reduced motion", () => {
    reducedMotion();
    renderWithProviders(<DirectionC />);
    expect(within(region()).getAllByText(/^Done/).length).toBeGreaterThan(0);
    expect(
      within(region()).getAllByText(/shared with everyone for free\.$/).length,
    ).toBeGreaterThan(0);
  });
});
