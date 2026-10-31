import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Icon } from "./Icon";
import { renderWithProviders } from "@/test/renderWithProviders";

const Dot = () => (
  <svg viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="6" />
  </svg>
);

describe("Icon", () => {
  it("hides a decorative icon from assistive tech", () => {
    const { container } = renderWithProviders(
      <Icon>
        <Dot />
      </Icon>,
    );
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(container.querySelector("[aria-hidden='true']")).not.toBeNull();
  });

  it("names a meaningful icon", () => {
    renderWithProviders(
      <Icon label="Download">
        <Dot />
      </Icon>,
    );
    expect(screen.getByRole("img", { name: "Download" })).toBeInTheDocument();
  });
});
