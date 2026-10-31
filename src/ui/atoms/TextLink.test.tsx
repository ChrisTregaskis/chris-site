import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TextLink } from "./TextLink";
import { renderWithProviders } from "@/test/renderWithProviders";

describe("TextLink", () => {
  it("opens external links safely in a new tab", () => {
    renderWithProviders(
      <TextLink href="https://example.com" external>
        Articles
      </TextLink>,
    );
    const link = screen.getByRole("link", {
      name: /^Articles.*\(opens in a new tab\)$/,
    });
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("leaves internal links alone", () => {
    renderWithProviders(<TextLink href="#contact">Contact</TextLink>);
    const link = screen.getByRole("link", { name: "Contact" });
    expect(link).not.toHaveAttribute("target");
    expect(link).not.toHaveAttribute("rel");
  });
});
