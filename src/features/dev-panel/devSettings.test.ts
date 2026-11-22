import { afterEach, describe, expect, it } from "vitest";
import {
  type DevControl,
  defineDevSettings,
  devGroups,
  parseDevParams,
  writeDevParams,
} from "./devSettings";

type Trial = { shade: boolean; size: "small" | "large" };
const DEFAULTS: Trial = { shade: false, size: "small" };
const CONTROLS: DevControl<Trial>[] = [
  { kind: "flag", key: "shade", label: "Shade" },
  {
    kind: "choice",
    key: "size",
    label: "Size",
    options: [
      { value: "small", label: "Small" },
      { value: "large", label: "Large" },
    ],
  },
];

afterEach(() => {
  window.history.replaceState(null, "", "/");
});

describe("dev settings in the URL", () => {
  it("reads flags (1, on, 0, off) and choices", () => {
    expect(parseDevParams("?shade=1&size=large", CONTROLS, DEFAULTS)).toEqual({
      shade: true,
      size: "large",
    });
    expect(parseDevParams("?shade=on", CONTROLS, DEFAULTS).shade).toBe(true);
    expect(
      parseDevParams("?shade=0", CONTROLS, { ...DEFAULTS, shade: true }).shade,
    ).toBe(false);
  });

  it("keeps the default for anything missing or unreadable", () => {
    expect(parseDevParams("", CONTROLS, DEFAULTS)).toEqual(DEFAULTS);
    expect(
      parseDevParams("?shade=maybe&size=huge", CONTROLS, DEFAULTS),
    ).toEqual(DEFAULTS);
  });

  it("writes them back, keeping other parameters, and reads back the same", () => {
    const values: Trial = { shade: true, size: "large" };
    const search = writeDevParams("?utm=x", CONTROLS, values);
    expect(search).toContain("utm=x");
    expect(search).toContain("shade=1");
    expect(parseDevParams(search, CONTROLS, DEFAULTS)).toEqual(values);
  });
});

describe("an experiment's dev settings", () => {
  it("start from the URL under pnpm dev, join the panel, and write each change back", () => {
    window.history.replaceState(null, "", "/?size=large#about");
    const before = devGroups.length;
    const settings = defineDevSettings<Trial>(DEFAULTS, {
      title: "Trial",
      controls: CONTROLS,
    });
    expect(devGroups).toHaveLength(before + 1);
    expect(settings.get()).toEqual({ shade: false, size: "large" });

    let heard = 0;
    const stop = settings.subscribe(() => {
      heard += 1;
    });
    settings.set({ shade: true });
    expect(settings.get()).toEqual({ shade: true, size: "large" });
    expect(heard).toBe(1);
    expect(window.location.search).toContain("shade=1");
    expect(window.location.hash).toBe("#about");
    stop();
    devGroups.splice(before);
  });

  it("without a group (production's case) keep to the defaults and stay out of the panel", () => {
    window.history.replaceState(null, "", "/?size=large");
    const before = devGroups.length;
    const settings = defineDevSettings<Trial>(DEFAULTS, null);
    expect(settings.get()).toEqual(DEFAULTS);
    settings.set({ shade: true });
    expect(window.location.search).toBe("?size=large");
    expect(devGroups).toHaveLength(before);
  });
});
