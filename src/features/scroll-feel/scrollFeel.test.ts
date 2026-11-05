import { describe, expect, it } from "vitest";
import {
  DEFAULT_RAIL_NUMERAL,
  railNumeralFrom,
  scrollFeelFrom,
  showsChapterRails,
  showsDeadZoneCues,
} from "./scrollFeel";

describe("scrollFeelFrom", () => {
  it("picks a prototype from ?scroll=", () => {
    expect(scrollFeelFrom("?scroll=b")).toBe("b");
    expect(scrollFeelFrom("?scroll=c")).toBe("c");
    expect(scrollFeelFrom("?utm_source=x&scroll=bc")).toBe("bc");
  });

  it("is the live site without it, or with anything it doesn't know", () => {
    expect(scrollFeelFrom("")).toBeNull();
    expect(scrollFeelFrom("?scroll=")).toBeNull();
    expect(scrollFeelFrom("?scroll=a")).toBeNull();
    expect(scrollFeelFrom("?scroll=cb")).toBeNull();
    expect(scrollFeelFrom("?scroll=B")).toBeNull();
    expect(scrollFeelFrom("?other=b")).toBeNull();
  });
});

describe("what each prototype shows", () => {
  it("draws the rails under b and bc, the cues under c and bc", () => {
    expect(showsChapterRails("b")).toBe(true);
    expect(showsChapterRails("bc")).toBe(true);
    expect(showsChapterRails("c")).toBe(false);
    expect(showsDeadZoneCues("c")).toBe(true);
    expect(showsDeadZoneCues("bc")).toBe(true);
    expect(showsDeadZoneCues("b")).toBe(false);
  });

  it("draws neither on the live site", () => {
    expect(showsChapterRails(null)).toBe(false);
    expect(showsDeadZoneCues(null)).toBe(false);
  });
});

describe("railNumeralFrom", () => {
  it("picks a numeral treatment from &num=", () => {
    expect(railNumeralFrom("?scroll=bc&num=a")).toBe("a");
    expect(railNumeralFrom("?scroll=bc&num=b")).toBe("b");
    expect(railNumeralFrom("?num=c&scroll=b")).toBe("c");
  });

  it("falls back to the recommended one without it, or with anything else", () => {
    expect(DEFAULT_RAIL_NUMERAL).toBe("a");
    expect(railNumeralFrom("?scroll=bc")).toBe("a");
    expect(railNumeralFrom("?scroll=bc&num=")).toBe("a");
    expect(railNumeralFrom("?scroll=bc&num=d")).toBe("a");
    expect(railNumeralFrom("?scroll=bc&num=B")).toBe("a");
  });
});
