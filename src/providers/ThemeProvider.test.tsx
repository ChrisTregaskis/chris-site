import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ThemeProvider } from "./ThemeProvider";
import { ThemeMode } from "@/context/ThemeContext";
import { useTheme } from "@/hooks/useTheme";

function Probe() {
  const { themeMode, setThemeMode } = useTheme();
  return (
    <button
      onClick={() =>
        setThemeMode((mode) =>
          mode === ThemeMode.DARK ? ThemeMode.LIGHT : ThemeMode.DARK,
        )
      }
    >
      {themeMode}
    </button>
  );
}

describe("ThemeProvider", () => {
  it("applies dark mode to the document by default", () => {
    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    );
    expect(document.documentElement.className).toBe("dark");
    expect(screen.getByRole("button")).toHaveTextContent(ThemeMode.DARK);
  });

  it("switches the document class when the theme mode changes", async () => {
    const user = userEvent.setup();
    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    );
    await user.click(screen.getByRole("button"));
    expect(document.documentElement.className).toBe("light");
    await user.click(screen.getByRole("button"));
    expect(document.documentElement.className).toBe("dark");
  });

  it("useTheme throws outside a ThemeProvider", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<Probe />)).toThrow(
      "useTheme must be used within a ThemeProvider",
    );
  });
});
