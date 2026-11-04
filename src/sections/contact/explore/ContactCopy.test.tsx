import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ContactCopyA } from "./ContactCopyA";
import { ContactCopyB } from "./ContactCopyB";
import { renderWithProviders } from "@/test/renderWithProviders";

describe("Contact explorations", () => {
  it.each([
    ["A", ContactCopyA],
    ["B", ContactCopyB],
  ])("take %s keeps both asks and every outbound link", (_, Copy) => {
    renderWithProviders(<Copy />);
    expect(screen.getAllByRole("button").map((b) => b.textContent)).toEqual([
      "Get in touch",
      "Request my CV",
    ]);
    const hrefs = screen
      .getAllByRole("link")
      .map((link) => link.getAttribute("href"));
    expect(hrefs).toEqual([
      "https://www.linkedin.com/in/christophertregaskis",
      "https://github.com/ChrisTregaskis",
      "https://medium.com/@c.tregaskis",
    ]);
    for (const link of screen.getAllByRole("link")) {
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveTextContent("(opens in a new tab)");
    }
  });
});
