import { screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { BurpeesSection } from "./BurpeesSection";
import { renderWithProviders } from "@/test/renderWithProviders";
import { BELOW_WIDE } from "@/ui/tokens/breakpoints";

/** A viewport that is stacked (a phone) or side by side, with motion on. */
function viewport(stacked: boolean) {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: stacked && query === BELOW_WIDE,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
  }));
}

function renderSection() {
  renderWithProviders(<BurpeesSection />);
  return screen.getByRole("region", { name: "Badass Burpees" });
}

describe("BurpeesSection", () => {
  it("describes the app on phones too, not only side by side", () => {
    viewport(true);
    const section = renderSection();
    const description = within(section).getByText(
      /^A fitness app I built for myself, shared with everyone for free\./,
    );
    // It was hidden below the wide breakpoint; nothing may hide it there again.
    expect(description).not.toHaveClass("hidden");
    expect(description.className).not.toMatch(/(^|\s)hidden(\s|$)/);
  });

  it("counts the set on a progress bar on phones", () => {
    viewport(true);
    const section = renderSection();
    const bar = within(section).getByRole("progressbar", {
      name: "Burpees done",
    });
    expect(bar).toHaveAttribute("aria-valuemin", "0");
    expect(bar).toHaveAttribute("aria-valuemax", "100");
    // Says what the ring says side by side (the count depends on the scroll).
    const done = bar.getAttribute("aria-valuenow");
    expect(done).toMatch(/^\d+$/);
    expect(bar).toHaveAttribute(
      "aria-valuetext",
      `${done} of 100 burpees done`,
    );
    // The ring is not drawn as well.
    expect(
      within(section).queryByText(/of 100 burpees done/),
    ).not.toBeInTheDocument();
  });

  it("keeps the ring side by side", () => {
    viewport(false);
    const section = renderSection();
    expect(
      within(section).getByText(/^\d+ of 100 burpees done$/),
    ).toBeInTheDocument();
    expect(within(section).queryByRole("progressbar")).not.toBeInTheDocument();
  });
});
