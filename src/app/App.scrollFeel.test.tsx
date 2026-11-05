import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { App } from "./App";
import { AppProviders } from "./AppProviders";
import { type RailNumeral, type ScrollFeel } from "@/features/scroll-feel";

const renderFeel = (feel: ScrollFeel | null, railNumeral?: RailNumeral) =>
  render(
    <AppProviders scrollFeel={feel} railNumeral={railNumeral}>
      <App />
    </AppProviders>,
  );

const railsIn = (container: HTMLElement) => [
  ...container.querySelectorAll(".chapter-rail"),
];

describe("App's scroll-feel prototypes", () => {
  it("adds nothing without ?scroll=", () => {
    const { container } = renderFeel(null);
    expect(container.querySelector(".build-head")).toBeNull();
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
    expect(container.querySelector(".build-head")).toBeNull();
  });

  it("c: sends a spark along the build lane's pinned run", () => {
    const { container } = renderFeel("c");
    const head = container.querySelector("#how-it-was-built .build-head");
    expect(head).toHaveAttribute("aria-hidden", "true");
    expect(container.querySelector(".chapter-rail")).toBeNull();
  });

  it("bc: draws the rails and the cues together", () => {
    const { container } = renderFeel("bc");
    expect(
      [...container.querySelectorAll(".chapter-rail")].map(
        (rail) => rail.textContent,
      ),
    ).toEqual(["1", "2", "3"]);
    expect(
      container.querySelector("#how-it-was-built .build-head"),
    ).not.toBeNull();
  });

  it("b: each rail heads its line with a ring, and sets its number by &num=", () => {
    const { container } = renderFeel("bc");
    for (const rail of railsIn(container)) {
      expect(rail).toHaveAttribute("data-num", "a");
      expect(rail.querySelector(".chapter-rail__dot")).not.toBeNull();
    }

    const light = renderFeel("bc", "b").container;
    expect(railsIn(light).map((rail) => rail.getAttribute("data-num"))).toEqual(
      ["b", "b", "b"],
    );
  });

  it("b: the count treatment adds how many case studies there are", () => {
    const { container } = renderFeel("b", "c");
    expect(railsIn(container).map((rail) => rail.textContent)).toEqual([
      "1/3",
      "2/3",
      "3/3",
    ]);
  });
});
