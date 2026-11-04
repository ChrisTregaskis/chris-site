import { HOME_ORG, type Org, ORGS, otherOrg } from "./organisations";

/**
 * The state behind direction C's story and leak test, kept pure so it can
 * be tested on its own: who is signed in, whether they're asking for every
 * session or trying to read another organisation's, and how many tries so
 * far (each try replays the bump).
 */
export type Ask = "every" | "other";

export interface LeakState {
  signedIn: Org;
  ask: Ask;
  attempt: number;
}

export const INITIAL_LEAK: LeakState = {
  signedIn: HOME_ORG,
  ask: "every",
  attempt: 0,
};

export type LeakAction =
  | { type: "pick"; org: Org }
  | { type: "try" }
  | { type: "reset" };

export function leakReducer(state: LeakState, action: LeakAction): LeakState {
  switch (action.type) {
    case "pick":
      return { ...state, signedIn: action.org, ask: "every" };
    case "try":
      return { ...state, ask: "other", attempt: state.attempt + 1 };
    case "reset":
      return { ...state, ask: "every" };
    default:
      return state;
  }
}

export interface LeakView {
  /** A request has arrived (stage 2 on): there's a query and a result. */
  asked: boolean;
  /** The leak test is open (stage 3): the picker and the buttons work. */
  testing: boolean;
  /** The organisation on the transaction. */
  who: Org;
  /** Whose sessions the leak test asks for. */
  target: Org;
  /** The query carries the explicit filter for `target`. */
  asking: boolean;
  /** Whose sessions come back: nobody's at rest (no query) or when the policy blocks the ask. */
  returned: Org | null;
  /** The visible line under the query: plain, one line, no numbers. */
  line: string;
  /** The same outcome in full, for screen readers (the empty sheet is drawn). */
  spoken: string;
}

/**
 * What the figure says for a story stage (1 to 3) and leak-test state.
 *
 * 1. The table at rest: every organisation's rows, as stored. No request,
 *    so no result for anyone.
 * 2. A request signed in as the home organisation: the policy is always on,
 *    so only its sessions come back, though the query has no filter.
 * 3. The same, with the leak test open: sign in as anyone, and ask for
 *    another organisation's sessions by name to get nothing back.
 */
export function leakView(stage: number, state: LeakState): LeakView {
  const asked = stage >= 2;
  const testing = stage >= 3;
  const who = testing ? state.signedIn : HOME_ORG;
  const target = otherOrg(who);
  const asking = testing && state.ask === "other";
  const base = { asked, testing, who, target, asking };
  if (!asked) {
    const line = "Every organisation's sessions, stored in one table.";
    return { ...base, returned: null, line, spoken: line };
  }
  if (asking) {
    const line = `The policy holds back ${target}'s, even when you ask by name.`;
    return {
      ...base,
      returned: null,
      line,
      spoken: `No sessions come back. ${line}`,
    };
  }
  const line = `Only ${who}'s sessions come back, with no filter in the query.`;
  return { ...base, returned: who, line, spoken: line };
}

/**
 * Where each organisation's sheet sits: all lying as the one table (at
 * rest), out in front as the result, or held back behind the policy, in
 * slots from the front of the pile.
 */
export type Spot =
  | { at: "table" }
  | { at: "result" }
  | { at: "held"; slot: number };

/**
 * The pile behind the policy, front first. In table order, less the
 * result; while the leak test asks, the organisation asked for sits at the
 * front (it's the one that tries to come forward) and the signed-in one
 * drops back in just behind it.
 */
export function heldOrder(view: LeakView): Org[] {
  if (view.asking) {
    return [
      view.target,
      view.who,
      ...ORGS.filter((org) => org !== view.target && org !== view.who),
    ];
  }
  return ORGS.filter((org) => org !== view.returned);
}

export function spotOf(view: LeakView, org: Org): Spot {
  if (!view.asked) return { at: "table" };
  if (org === view.returned) return { at: "result" };
  return { at: "held", slot: heldOrder(view).indexOf(org) };
}
