import { describe, expect, it } from "vitest";
import { INITIAL_LEAK, leakReducer, leakView } from "./leakTest";

describe("leakReducer", () => {
  it("trying to read another organisation's sessions asks for them and counts the try", () => {
    const once = leakReducer(INITIAL_LEAK, { type: "try" });
    expect(once).toEqual({ signedIn: "Alder", ask: "other", attempt: 1 });
    expect(leakReducer(once, { type: "try" }).attempt).toBe(2);
  });

  it("reset asks for every session again", () => {
    const tried = leakReducer(INITIAL_LEAK, { type: "try" });
    expect(leakReducer(tried, { type: "reset" }).ask).toBe("every");
  });

  it("picking an organisation signs in as it and drops any try in progress", () => {
    const tried = leakReducer(INITIAL_LEAK, { type: "try" });
    const picked = leakReducer(tried, { type: "pick", org: "Cedar" });
    expect(picked.signedIn).toBe("Cedar");
    expect(picked.ask).toBe("every");
  });
});

describe("leakView", () => {
  it("before the policy, every organisation's rows come back, whatever was tried", () => {
    const tried = leakReducer(INITIAL_LEAK, { type: "try" });
    for (const stage of [1, 2]) {
      const view = leakView(stage, tried);
      expect(view.asking).toBe(false);
      expect(view.returned).toEqual(["Alder", "Birch", "Cedar"]);
    }
  });

  it("with the policy, only the signed-in organisation's rows come back", () => {
    const picked = leakReducer(INITIAL_LEAK, { type: "pick", org: "Birch" });
    const view = leakView(3, picked);
    expect(view.who).toBe("Birch");
    expect(view.returned).toEqual(["Birch"]);
    expect(view.outcome).toBe("Only Birch's sessions come back.");
  });

  it("asking for another organisation's rows gets nothing back", () => {
    const view = leakView(3, leakReducer(INITIAL_LEAK, { type: "try" }));
    expect(view.asking).toBe(true);
    expect(view.target).toBe("Birch");
    expect(view.returned).toEqual([]);
    expect(view.outcome).toBe(
      "No sessions come back. The policy holds back Birch's.",
    );
  });
});
