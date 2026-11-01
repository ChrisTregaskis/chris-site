import { describe, expect, it, vi } from "vitest";
import { readRememberedFlag, writeRememberedFlag } from "./rememberedFlag";

const KEY = "ct:test-flag:v1";

describe("rememberedFlag", () => {
  it("stores only a timestamp under the key, and reads it back", () => {
    expect(readRememberedFlag(KEY)).toBe(false);
    writeRememberedFlag(KEY, new Date("2026-11-01T09:30:00.000Z"));

    expect(localStorage.getItem(KEY)).toBe('{"at":"2026-11-01T09:30:00.000Z"}');
    expect(readRememberedFlag(KEY)).toBe(true);
  });

  it("treats anything malformed as not set", () => {
    for (const raw of ["true", "not json", "null", '{"at":1}', "{}"]) {
      localStorage.setItem(KEY, raw);
      expect(readRememberedFlag(KEY)).toBe(false);
    }
  });

  it("carries on when storage throws", () => {
    const blocked = () => {
      throw new DOMException("The operation is insecure.", "SecurityError");
    };
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(blocked);
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(blocked);

    expect(() => writeRememberedFlag(KEY)).not.toThrow();
    expect(readRememberedFlag(KEY)).toBe(false);
  });
});
