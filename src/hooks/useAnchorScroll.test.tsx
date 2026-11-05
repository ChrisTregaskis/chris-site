import { fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAnchorScroll } from "./useAnchorScroll";
import { QUIET_FOCUS_ATTRIBUTE } from "@/lib/quietFocus";
import { renderWithProviders } from "@/test/renderWithProviders";

function Page() {
  useAnchorScroll();
  return (
    <>
      <a href="#about">About</a>
      <section id="about" aria-labelledby="about-title">
        <h2 id="about-title">About</h2>
        <a href="#elsewhere">Elsewhere</a>
      </section>
    </>
  );
}

// Reduced motion: the scroll jumps, so focus moves at once.
beforeEach(() => {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: query.includes("reduced-motion"),
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  }));
  vi.stubGlobal("scrollTo", vi.fn());
});

const heading = () => screen.getByRole("heading", { name: "About" });
const quiet = (element: Element) => element.hasAttribute(QUIET_FOCUS_ATTRIBUTE);

describe("useAnchorScroll", () => {
  it("after a tap or click, focuses the section's heading with no ring", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Page />);

    await user.click(screen.getByRole("link", { name: "About" }));
    expect(window.location.hash).toBe("#about");
    expect(heading()).toHaveFocus();
    expect(quiet(heading())).toBe(true);

    // The next key press brings rings back.
    fireEvent.keyDown(heading(), { key: "Tab" });
    expect(quiet(heading())).toBe(false);
  });

  it("followed from the keyboard, focuses the heading ringed", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Page />);

    screen.getByRole("link", { name: "About" }).focus();
    await user.keyboard("{Enter}");
    expect(heading()).toHaveFocus();
    expect(quiet(heading())).toBe(false);
  });

  it("leaves no quiet mark behind once focus moves on", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Page />);

    await user.click(screen.getByRole("link", { name: "About" }));
    await user.tab();
    expect(screen.getByRole("link", { name: "Elsewhere" })).toHaveFocus();
    expect(document.querySelector(`[${QUIET_FOCUS_ATTRIBUTE}]`)).toBeNull();
  });
});
