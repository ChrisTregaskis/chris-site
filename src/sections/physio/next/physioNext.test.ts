import { describe, expect, it } from "vitest";
import { PHYSIO_NEXT, parsePhysioNext } from "./physioNext";

describe("the physio next-draft switch", () => {
  it("is on only for ?physio=next", () => {
    expect(parsePhysioNext("?physio=next")).toBe(true);
    expect(parsePhysioNext("?x=1&physio=next")).toBe(true);
    expect(parsePhysioNext("?physio=Next")).toBe(false);
    expect(parsePhysioNext("?physio=a")).toBe(false);
    expect(parsePhysioNext("?physioarch=c")).toBe(false);
    expect(parsePhysioNext("")).toBe(false);
    // The test page has no query: the live chapter.
    expect(PHYSIO_NEXT).toBe(false);
  });
});
