import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DrawerSurface } from "./DrawerSurface";
import { SURFACE_DEFAULTS } from "./settings";
import { Surface } from "./Surface";
import { surfaceSettings } from "./surfaceSettings";

beforeEach(() => {
  // jsdom has no 2D canvas: the mesh simply doesn't draw.
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
});

afterEach(() => {
  act(() => surfaceSettings.set(SURFACE_DEFAULTS));
  window.history.replaceState(null, "", "/");
});

const root = document.documentElement;
/** The mesh arrives a moment after the page has loaded. */
const findMesh = () =>
  screen.findByTestId("surface-mesh", {}, { timeout: 3000 });

function stubMedia(matching: (query: string) => boolean) {
  vi.stubGlobal(
    "matchMedia",
    (query: string) =>
      ({
        matches: matching(query),
        media: query,
        addEventListener: () => {},
        removeEventListener: () => {},
      }) as unknown as MediaQueryList,
  );
}

describe("Surface", () => {
  it("puts the chapters on their tones at once, and lays the mesh once the page has loaded", async () => {
    stubMedia((query) => query.includes("pointer: fine"));
    render(<Surface />);
    expect(root).toHaveAttribute("data-tones");
    expect(screen.queryByTestId("surface-mesh")).toBeNull();
    const layer = await findMesh();
    expect(layer).toHaveAttribute("aria-hidden", "true");
    expect(layer).toHaveClass("pointer-events-none");
    expect(root).toHaveAttribute("data-mesh", "pointer");
  });

  it("holds the mesh still without a mouse", async () => {
    render(<Surface />);
    await findMesh();
    // The test window has no fine pointer (matchMedia matches nothing).
    expect(root).toHaveAttribute("data-mesh", "static");
  });

  it("holds the mesh still under reduced motion", async () => {
    stubMedia(
      (query) => query.includes("reduce") || query.includes("pointer: fine"),
    );
    render(<Surface />);
    await findMesh();
    expect(root).toHaveAttribute("data-mesh", "static");
  });

  it("takes the tones and the mesh away again", async () => {
    const { unmount } = render(<Surface />);
    await findMesh();
    act(() => surfaceSettings.set({ tones: false, mesh: "off" }));
    expect(root).not.toHaveAttribute("data-tones");
    expect(root).not.toHaveAttribute("data-mesh");
    expect(screen.queryByTestId("surface-mesh")).toBeNull();
    unmount();
    expect(root).not.toHaveAttribute("data-tones");
  });
});

describe("DrawerSurface", () => {
  it("lays a paper sheet with the mesh under the form by default, decorative and out of the way", async () => {
    render(<DrawerSurface />);
    const layer = await screen.findByTestId(
      "drawer-mesh",
      {},
      { timeout: 3000 },
    );
    expect(layer).toHaveAttribute("aria-hidden", "true");
    expect(layer).toHaveClass("pointer-events-none", "bg-surface");
  });

  it("leaves the drawer plain when asked", async () => {
    render(<DrawerSurface />);
    await screen.findByTestId("drawer-mesh", {}, { timeout: 3000 });
    act(() => surfaceSettings.set({ drawer: "plain" }));
    expect(screen.queryByTestId("drawer-mesh")).toBeNull();
  });
});
