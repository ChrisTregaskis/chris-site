import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { App } from "./App";
import { AppProviders } from "./AppProviders";
import { type ScrollFeel } from "@/features/scroll-feel";

const renderFeel = (feel: ScrollFeel | null) =>
  render(
    <AppProviders scrollFeel={feel}>
      <App />
    </AppProviders>,
  );

describe("App's scroll-feel prototypes", () => {
  it("adds nothing without ?scroll=", () => {
    const { container } = renderFeel(null);
    expect(container.querySelector(".night-sky")).toBeNull();
    expect(container.querySelector(".chapter-rail")).toBeNull();
  });

  it("a: lays one decorative star field behind the page", () => {
    const { container } = renderFeel("a");
    const skies = container.querySelectorAll(".night-sky");
    expect(skies).toHaveLength(1);
    expect(skies[0]).toHaveAttribute("aria-hidden", "true");
    expect(container.querySelector(".chapter-rail")).toBeNull();
  });

  it("b: gives each case study a decorative rail, by its number", () => {
    const { container } = renderFeel("b");
    const rails = [...container.querySelectorAll(".chapter-rail")];
    expect(rails.map((rail) => rail.textContent)).toEqual(["1", "2", "3"]);
    for (const rail of rails) {
      expect(rail).toHaveAttribute("aria-hidden", "true");
      expect(rail.parentElement).toHaveClass("chapter-tone");
    }
    expect(container.querySelector(".night-sky")).toBeNull();
  });
});
