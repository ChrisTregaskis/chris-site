import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ChapterHeading } from "./ChapterHeading";
import { Section } from "./Section";
import { renderWithProviders } from "@/test/renderWithProviders";

describe("ChapterHeading", () => {
  it("gives the section a level-two heading the section can be labelled by", () => {
    renderWithProviders(
      <Section id="work" labelledBy="work-title">
        <ChapterHeading
          id="work-title"
          title="Selected work"
          lede="A few things built end to end."
          chips={["TypeScript", "React"]}
        />
      </Section>,
    );
    expect(
      screen.getByRole("heading", { level: 2, name: "Selected work" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: "Selected work" }),
    ).toHaveAttribute("id", "work");
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });

  it("sets the chapter's number above the title, hidden from assistive tech", () => {
    renderWithProviders(
      <Section id="work" labelledBy="work-title">
        <ChapterHeading id="work-title" numeral="1" title="Selected work" />
      </Section>,
    );
    const numeral = screen.getByText("1");
    expect(numeral).toHaveAttribute("aria-hidden", "true");
    expect(
      screen.getByRole("heading", { level: 2, name: "Selected work" }),
    ).toBeInTheDocument();
  });
});
