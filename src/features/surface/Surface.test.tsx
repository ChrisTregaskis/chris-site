import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SURFACE_DEFAULTS } from "./settings";
import { Surface } from "./Surface";
import { setSurface } from "./surfaceStore";

beforeEach(() => {
  // jsdom has no 2D canvas: the mesh simply doesn't draw.
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
});

afterEach(() => {
  act(() => setSurface(SURFACE_DEFAULTS));
  window.history.replaceState(null, "", "/");
});

const root = document.documentElement;

describe("Surface", () => {
  it("puts the chapters on their tones by default, with no mesh", () => {
    render(<Surface />);
    expect(root).toHaveAttribute("data-tones");
    expect(root).not.toHaveAttribute("data-mesh");
    expect(screen.queryByTestId("surface-mesh")).toBeNull();
  });

  it("lays the mesh behind the page, decorative and out of the pointer's way", async () => {
    render(<Surface />);
    act(() => setSurface({ ...SURFACE_DEFAULTS, mesh: "static" }));
    const layer = await screen.findByTestId("surface-mesh");
    expect(layer).toHaveAttribute("aria-hidden", "true");
    expect(layer).toHaveClass("pointer-events-none");
    expect(root).toHaveAttribute("data-mesh", "static");
  });

  it("takes the tones and the mesh away again", async () => {
    const { unmount } = render(<Surface />);
    act(() => setSurface({ tones: false, mesh: "static", lines: false }));
    expect(root).not.toHaveAttribute("data-tones");
    await screen.findByTestId("surface-mesh");
    expect(root).toHaveAttribute("data-mesh");
    act(() => setSurface({ tones: false, mesh: "off", lines: false }));
    expect(root).not.toHaveAttribute("data-mesh");
    unmount();
    expect(root).not.toHaveAttribute("data-tones");
  });

  it("offers the dev panel under pnpm dev, writing each choice to the URL", async () => {
    const user = userEvent.setup();
    render(<Surface />);
    const tones = await screen.findByRole("checkbox", {
      name: "Chapter tones",
    });
    expect(tones).toBeChecked();
    await user.click(screen.getByRole("radio", { name: "Static" }));
    expect(await screen.findByTestId("surface-mesh")).toBeInTheDocument();
    expect(window.location.search).toContain("mesh=static");
    await user.click(tones);
    expect(root).not.toHaveAttribute("data-tones");
    expect(window.location.search).toContain("tones=0");
  });

  it("holds the mesh still without a mouse, and says so in the panel", async () => {
    const user = userEvent.setup();
    render(<Surface />);
    await user.click(await screen.findByRole("radio", { name: "Pointer" }));
    // The test window has no fine pointer (matchMedia matches nothing).
    await screen.findByTestId("surface-mesh");
    expect(root).toHaveAttribute("data-mesh", "static");
    expect(screen.getByText(/no mouse/)).toBeInTheDocument();
  });

  it("holds the mesh still under reduced motion", async () => {
    vi.stubGlobal(
      "matchMedia",
      (query: string) =>
        ({
          matches: query.includes("reduce") || query.includes("pointer: fine"),
          media: query,
          addEventListener: () => {},
          removeEventListener: () => {},
        }) as unknown as MediaQueryList,
    );
    render(<Surface />);
    act(() => setSurface({ ...SURFACE_DEFAULTS, mesh: "pointer" }));
    await screen.findByTestId("surface-mesh");
    expect(root).toHaveAttribute("data-mesh", "static");
    expect(await screen.findByText(/reduced motion/)).toBeInTheDocument();
  });

  it("follows the pointer with a mouse and motion allowed", async () => {
    vi.stubGlobal(
      "matchMedia",
      (query: string) =>
        ({
          matches: query.includes("pointer: fine"),
          media: query,
          addEventListener: () => {},
          removeEventListener: () => {},
        }) as unknown as MediaQueryList,
    );
    render(<Surface />);
    act(() => setSurface({ ...SURFACE_DEFAULTS, mesh: "pointer" }));
    await screen.findByTestId("surface-mesh");
    expect(root).toHaveAttribute("data-mesh", "pointer");
  });
});
