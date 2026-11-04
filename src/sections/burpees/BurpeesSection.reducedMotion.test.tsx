import { screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { BurpeesSection } from "./BurpeesSection";
import { CALLS } from "./calls";
import { renderWithProviders } from "@/test/renderWithProviders";

// Framer reads the preference once per test file, so this file has its own.
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

describe("BurpeesSection under reduced motion", () => {
  it("shows the finished set: 100, a held pose and every call with its line, unpinned", async () => {
    renderWithProviders(<BurpeesSection />);
    const region = screen.getByRole("region", { name: "Badass Burpees" });
    const count = await screen.findByTestId("burpees-count");
    expect(count).toHaveTextContent(/^100$/);
    for (const { call, line } of CALLS) {
      const heading = within(region).getByText(call, { selector: "p" });
      expect(heading.closest(".invisible")).toBeNull();
      expect(heading.nextElementSibling).toHaveTextContent(line);
    }
    expect(region.querySelector(".sticky")).toBeNull();
    const pose = count.querySelector("img.opacity-100");
    expect(pose?.getAttribute("src")).toMatch(/plank-l-knee/);
  });
});
