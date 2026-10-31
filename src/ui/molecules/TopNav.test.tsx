import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TopNav } from "./TopNav";
import { renderWithProviders } from "@/test/renderWithProviders";

describe("TopNav", () => {
  it("labels the primary navigation and lists its links", () => {
    renderWithProviders(
      <TopNav
        name="Ada Lovelace"
        links={[
          { href: "#work", label: "Work" },
          { href: "#contact", label: "Contact" },
        ]}
      />,
    );
    const nav = screen.getByRole("navigation", { name: "Primary" });
    expect(within(nav).getByRole("link", { name: "Work" })).toHaveAttribute(
      "href",
      "#work",
    );
    expect(within(nav).getByRole("link", { name: "Contact" })).toHaveAttribute(
      "href",
      "#contact",
    );
    expect(screen.getByText("Ada Lovelace")).toBeInTheDocument();
  });
});
