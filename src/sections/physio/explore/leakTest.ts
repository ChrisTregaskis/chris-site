import { HOME_ORG, type Org, ORGS, otherOrg } from "./organisations";

/**
 * The state behind direction C's leak test, kept pure so it can be tested
 * on its own: who is signed in, whether they're asking for every session
 * or trying to read another organisation's, and how many tries so far
 * (each try replays the bump).
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
  /** The organisation on the transaction. */
  who: Org;
  /** Whose sessions the leak test asks for. */
  target: Org;
  /** The query carries the explicit filter for `target`. */
  asking: boolean;
  /** Whose rows come back. */
  returned: Org[];
  /** One plain line for screen readers. */
  outcome: string;
}

/**
 * What the figure shows for a story stage (1 to 3) and leak-test state.
 * Before the policy (stage 3) the picker and the test don't apply: the
 * story signs in as the home organisation and every row comes back.
 */
export function leakView(stage: number, state: LeakState): LeakView {
  const live = stage >= 3;
  const who = live ? state.signedIn : HOME_ORG;
  const target = otherOrg(who);
  const asking = live && state.ask === "other";
  if (!live) {
    return {
      who,
      target,
      asking,
      returned: [...ORGS],
      outcome:
        stage === 2
          ? `Every organisation's sessions still come back. The transaction is set to ${who}.`
          : "Every organisation's sessions come back.",
    };
  }
  if (asking) {
    return {
      who,
      target,
      asking,
      returned: [],
      outcome: `No sessions come back. The policy holds back ${target}'s.`,
    };
  }
  return {
    who,
    target,
    asking,
    returned: [who],
    outcome: `Only ${who}'s sessions come back.`,
  };
}
