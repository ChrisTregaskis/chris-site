import { describe, expect, it } from "vitest";
import { blobPath } from "./blob";

describe("blobPath", () => {
  it("draws a closed path of six curves from the first blob at 0", () => {
    const d = blobPath(0);
    expect(d.startsWith("M0.5000,0.0200 C0.7000,0.0000")).toBe(true);
    expect(d.endsWith("Z")).toBe(true);
    expect(d.match(/C/g)).toHaveLength(6);
  });

  it("morphs to the second blob at 1, and halfway between at 0.5", () => {
    expect(blobPath(1).startsWith("M0.5400,0.0400")).toBe(true);
    expect(blobPath(0.5).startsWith("M0.5200,0.0300")).toBe(true);
  });
});
