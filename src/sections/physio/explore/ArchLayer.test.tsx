import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { ARCH_COPY } from "./archCopy";
import { type ArchDirection, type ArchPlace } from "./archDraft";
import { ArchLayer } from "./ArchLayer";
import { renderWithProviders } from "@/test/renderWithProviders";

const DIRECTIONS: ArchDirection[] = ["a", "b", "c"];
const PLACES: ArchPlace[] = ["before", "after"];

describe("the how-it-runs layer (draft)", () => {
  for (const direction of DIRECTIONS) {
    for (const place of PLACES) {
      it(`draws ${direction} ${place} the steps, with the four principles in its order`, () => {
        renderWithProviders(<ArchLayer draft={{ direction, place }} />);
        const copy = ARCH_COPY[place];
        const layer = screen.getByRole("region", { name: copy.title });
        expect(layer).toHaveAttribute("data-direction", direction);
        expect(layer).toHaveTextContent(copy.intro);
        expect(
          within(layer)
            .getAllByRole("heading", { level: 4 })
            .map((h) => h.textContent),
        ).toEqual(copy.principles.map((p) => p.title));
        // The drawing is a described image, carrying each principle's glyph.
        const drawing = within(layer).getByRole("img");
        expect(drawing).toHaveAccessibleName(/private network/);
        for (const p of copy.principles) {
          expect(
            drawing.querySelector(`[data-marker="${p.id}"]`),
          ).not.toBeNull();
        }
      });
    }
  }

  it("opens before the steps on the role that owns nothing last, and after the leak test on it first", () => {
    expect(ARCH_COPY.before.principles.at(-1)?.id).toBe("role");
    expect(ARCH_COPY.after.principles[0]?.id).toBe("role");
  });

  it("lights a principle's part of the drawing while the pointer is over it", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <ArchLayer draft={{ direction: "a", place: "before" }} />,
    );
    const marker = () => document.querySelector('[data-marker="admin"]');
    expect(marker()).toHaveClass("text-accent");
    const admin = document.querySelector('[data-principle="admin"]');
    if (!admin) throw new Error("no admin principle");
    await user.hover(admin);
    expect(marker()).toHaveClass("text-signal");
    await user.unhover(admin);
    expect(marker()).toHaveClass("text-accent");
  });

  it("keeps its copy free of connector dashes", () => {
    const all = Object.values(ARCH_COPY).flatMap((c) => [
      c.eyebrow,
      c.title,
      c.intro,
      ...c.principles.flatMap((p) => [p.title, p.text]),
    ]);
    for (const line of all) expect(line).not.toMatch(/[\u2013\u2014]/);
  });
});
