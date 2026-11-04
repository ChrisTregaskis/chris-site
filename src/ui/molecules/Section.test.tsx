import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Section } from "./Section";
import { renderWithProviders } from "@/test/renderWithProviders";

describe("Section", () => {
  it("lays a chapter on its tone, fading in from the one before, its surface the tone", () => {
    renderWithProviders(
      <Section
        id="physio"
        labelledBy="physio-title"
        tone={{ from: "wayfinder", to: "physio" }}
      >
        <h2 id="physio-title">Physio</h2>
      </Section>,
    );
    const region = screen.getByRole("region", { name: "Physio" });
    expect(region).toHaveClass("chapter-tone");
    expect(region.style.getPropertyValue("--tone-from")).toBe(
      "var(--color-tone-wayfinder)",
    );
    expect(region.style.getPropertyValue("--tone-to")).toBe(
      "var(--color-tone-physio)",
    );
    expect(region.style.getPropertyValue("--color-surface")).toBe(
      "var(--color-tone-physio)",
    );
  });

  it("closes on surface itself, and draws no tone without one", () => {
    renderWithProviders(
      <>
        <Section
          id="contact"
          labelledBy="contact-title"
          tone={{ from: "about", to: "base", feather: "100%" }}
        >
          <h2 id="contact-title">Contact</h2>
        </Section>
        <Section id="plain" labelledBy="plain-title">
          <h2 id="plain-title">Plain</h2>
        </Section>
      </>,
    );
    const contact = screen.getByRole("region", { name: "Contact" });
    expect(contact.style.getPropertyValue("--color-surface")).toBe("");
    expect(contact.style.getPropertyValue("--tone-feather")).toBe("100%");
    expect(screen.getByRole("region", { name: "Plain" })).not.toHaveClass(
      "chapter-tone",
    );
  });
});
