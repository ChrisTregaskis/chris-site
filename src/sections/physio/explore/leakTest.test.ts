import { describe, expect, it } from "vitest";
import {
  heldOrder,
  INITIAL_LEAK,
  leakReducer,
  leakView,
  spotOf,
} from "./leakTest";
import { ORGS } from "./organisations";

const tried = leakReducer(INITIAL_LEAK, { type: "try" });

describe("leakReducer", () => {
  it("trying to read another organisation's sessions asks for them and counts the try", () => {
    expect(tried).toEqual({ signedIn: "Alder", ask: "other", attempt: 1 });
    expect(leakReducer(tried, { type: "try" }).attempt).toBe(2);
  });

  it("reset asks for every session again", () => {
    expect(leakReducer(tried, { type: "reset" }).ask).toBe("every");
  });

  it("picking an organisation signs in as it and drops any try in progress", () => {
    const picked = leakReducer(tried, { type: "pick", org: "Cedar" });
    expect(picked.signedIn).toBe("Cedar");
    expect(picked.ask).toBe("every");
  });
});

describe("leakView", () => {
  it("at rest, the table is as stored: no request, no result for anyone", () => {
    const view = leakView(1, tried);
    expect(view.asked).toBe(false);
    expect(view.asking).toBe(false);
    expect(view.returned).toBeNull();
    expect(view.line).toBe(
      "Every organisation's sessions, stored in one table.",
    );
    expect(view.line).not.toMatch(/come back/);
  });

  it("the first request already gets only its own organisation's sessions, whatever the leak test did", () => {
    const picked = leakReducer(tried, { type: "pick", org: "Birch" });
    for (const state of [INITIAL_LEAK, tried, picked]) {
      const view = leakView(2, state);
      expect(view.asked).toBe(true);
      expect(view.testing).toBe(false);
      expect(view.who).toBe("Alder");
      expect(view.asking).toBe(false);
      expect(view.returned).toBe("Alder");
      expect(view.line).toBe(
        "Only Alder's sessions come back, with no filter in the query.",
      );
    }
  });

  it("in the leak test, only the signed-in organisation's sessions come back", () => {
    const picked = leakReducer(INITIAL_LEAK, { type: "pick", org: "Birch" });
    const view = leakView(3, picked);
    expect(view.testing).toBe(true);
    expect(view.who).toBe("Birch");
    expect(view.target).toBe("Alder");
    expect(view.returned).toBe("Birch");
    expect(view.spoken).toBe(view.line);
  });

  it("asking for another organisation's sessions by name gets nothing back, and says why", () => {
    const view = leakView(3, tried);
    expect(view.asking).toBe(true);
    expect(view.target).toBe("Birch");
    expect(view.returned).toBeNull();
    expect(view.line).toBe(
      "The policy holds back Birch's, even when you ask by name.",
    );
    expect(view.spoken).toBe(
      "No sessions come back. The policy holds back Birch's, even when you ask by name.",
    );
  });

  it("never puts a number in the line", () => {
    for (const stage of [1, 2, 3]) {
      for (const state of [INITIAL_LEAK, tried]) {
        expect(leakView(stage, state).spoken).not.toMatch(/\d/);
      }
    }
  });
});

describe("where the sheets sit", () => {
  it("at rest, every sheet lies in the one table", () => {
    const view = leakView(1, INITIAL_LEAK);
    for (const org of ORGS) expect(spotOf(view, org)).toEqual({ at: "table" });
  });

  it("the result comes out in front; the rest stay held back, in table order", () => {
    const view = leakView(2, INITIAL_LEAK);
    expect(spotOf(view, "Alder")).toEqual({ at: "result" });
    expect(heldOrder(view)).toEqual(["Birch", "Cedar"]);
    expect(spotOf(view, "Cedar")).toEqual({ at: "held", slot: 1 });
  });

  it("switching organisation brings that one forward and sends the last one back", () => {
    const view = leakView(
      3,
      leakReducer(INITIAL_LEAK, { type: "pick", org: "Cedar" }),
    );
    expect(spotOf(view, "Cedar")).toEqual({ at: "result" });
    expect(heldOrder(view)).toEqual(["Alder", "Birch"]);
  });

  it("when nothing comes back, nobody is out in front: the one asked for is at the front of the pile, the signed-in one just behind", () => {
    const view = leakView(3, tried);
    for (const org of ORGS) expect(spotOf(view, org).at).toBe("held");
    expect(heldOrder(view)).toEqual(["Birch", "Alder", "Cedar"]);
  });
});
