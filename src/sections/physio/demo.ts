import {
  INITIAL_LEAK,
  type LeakAction,
  leakReducer,
  type LeakState,
} from "./leakTest";
import { type Org, ORGS } from "./organisations";

/*
 * The leak test plays itself while nobody is using it: try to read another
 * organisation's sessions, hold on the empty result, ask for every session
 * again, sign in as the next organisation, try again, round and round. Each
 * move first "presses" its button (so it reads as the demo clicking, not
 * the page moving on its own), then acts. The moment the visitor does
 * anything, their move wins and the demo waits until they've been idle a
 * while. Pure, so the loop can be tested without a browser; the hook only
 * runs `nextDemoEvent`'s timer while the demo may play.
 */

/** Timings, ms. */
export const DEMO = {
  /** A result on screen before the next move. */
  hold: 3200,
  /** The empty result: long enough to see the attempt fail and read why. */
  empty: 4800,
  /** A button shows pressed this long before its move happens. */
  press: 450,
  /** After the visitor's last move, before the demo picks up again. */
  idle: 10_000,
} as const;

/** A move, by the button that makes it. */
export type DemoMove =
  | { kind: "try" }
  | { kind: "reset" }
  | { kind: "pick"; org: Org };

export interface DemoState {
  leak: LeakState;
  /** The button the demo is pressing, about to act. */
  pressing: DemoMove | null;
  /** The last move made (by anyone): what comes next follows from it. */
  last: DemoMove["kind"] | null;
  /** Who made it: only the visitor's moves are announced. */
  by: "visitor" | "demo";
  /** The visitor paused the demo. */
  paused: boolean;
}

export const INITIAL_DEMO: DemoState = {
  leak: INITIAL_LEAK,
  pressing: null,
  last: null,
  by: "visitor",
  paused: false,
};

export type DemoAction =
  /** The visitor used the leak test: their move wins. */
  | { type: "visitor"; action: LeakAction }
  | { type: "press"; move: DemoMove }
  | { type: "act" }
  | { type: "pause" }
  | { type: "play" };

function toLeakAction(move: DemoMove): LeakAction {
  return move.kind === "pick"
    ? { type: "pick", org: move.org }
    : { type: move.kind };
}

function kindOf(action: LeakAction): DemoMove["kind"] {
  return action.type;
}

export function demoReducer(state: DemoState, action: DemoAction): DemoState {
  switch (action.type) {
    case "visitor":
      return {
        ...state,
        leak: leakReducer(state.leak, action.action),
        pressing: null,
        last: kindOf(action.action),
        by: "visitor",
      };
    case "press":
      return { ...state, pressing: action.move };
    case "act":
      if (!state.pressing) return state;
      return {
        ...state,
        leak: leakReducer(state.leak, toLeakAction(state.pressing)),
        pressing: null,
        last: state.pressing.kind,
        by: "demo",
      };
    case "pause":
      return { ...state, paused: true, pressing: null };
    case "play":
      // Picks up at the demo's own pace, not after the idle wait.
      return { ...state, paused: false, by: "demo" };
    default:
      return state;
  }
}

/** The organisation after `org`, round in table order. */
export function nextOrg(org: Org): Org {
  return ORGS[(ORGS.indexOf(org) + 1) % ORGS.length];
}

/** What the demo does next from here: clear an empty result, move on after a reset, otherwise try. */
export function nextDemoMove(state: DemoState): DemoMove {
  if (state.leak.ask === "other") return { kind: "reset" };
  if (state.last === "reset") {
    return { kind: "pick", org: nextOrg(state.leak.signedIn) };
  }
  return { kind: "try" };
}

/** The demo's next event and how long to wait for it. */
export function nextDemoEvent(state: DemoState): {
  delay: number;
  action: DemoAction;
} {
  if (state.pressing) return { delay: DEMO.press, action: { type: "act" } };
  let delay: number = DEMO.hold;
  if (state.by === "visitor" && state.last !== null) delay = DEMO.idle;
  else if (state.leak.ask === "other") delay = DEMO.empty;
  return { delay, action: { type: "press", move: nextDemoMove(state) } };
}
