import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { INITIAL_LEAK, leakReducer, leakView } from "./leakTest";
import { QueryLines } from "./QueryLines";
import { renderWithProviders } from "@/test/renderWithProviders";

const views = [1, 2, 3].flatMap((stage) => [
  leakView(stage, INITIAL_LEAK),
  leakView(stage, leakReducer(INITIAL_LEAK, { type: "try" })),
]);

/** Every element's tag and classes, without the ones that only fade it. */
function layoutOf(element: Element): string[] {
  return [element, ...element.querySelectorAll("*")].map((node) =>
    `${node.tagName} ${node.getAttribute("class") ?? ""}`
      .replace(/\bopacity-\d+\b/g, "")
      .trim(),
  );
}

describe("the query", () => {
  it("lays out the same lines in every state, so nothing under it shifts", () => {
    const { rerender, container } = renderWithProviders(
      <QueryLines view={views[0]} size="compact" still />,
    );
    const layouts = new Set<string>();
    for (const view of views) {
      rerender(<QueryLines view={view} size="compact" still />);
      layouts.add(layoutOf(container).join("|"));
      // The filter's line is always laid out; it wipes in rather than grows.
      const filter = screen.getByTestId("query-filter");
      expect(filter.style.clipPath).toBe(
        view.asking ? "inset(0 0 0 0)" : "inset(0 100% 0 0)",
      );
      expect(filter).toHaveAttribute("aria-hidden", String(!view.asking));
      expect(screen.getByTestId("query-select")).toHaveAttribute(
        "aria-hidden",
        String(!view.asked),
      );
    }
    expect(layouts.size).toBe(1);
  });

  it("says what comes back, and names whose sessions the leak test asks for", () => {
    renderWithProviders(<QueryLines view={views[5]} size="large" still />);
    expect(screen.getByTestId("query-outcome")).toHaveTextContent(
      "The policy holds back Birch's, even when you ask by name.",
    );
    expect(screen.getByTestId("query-filter")).toHaveTextContent(
      "where organisation_id = ‘Birch’",
    );
  });
});
