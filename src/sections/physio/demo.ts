import {
  INITIAL_LEAK,
  type LeakAction,
  leakReducer,
  type LeakState,
} from "./leakTest";
import { type Org, ORGS } from "./organisations";

/*
 * The leak test's example loop, which plays only when the visitor turns it
 * on: try to read another organisation's sessions, hold on the empty
 * result, ask for every session again, sign in as the next organisation,
 * try again, round and round. Each move first "presses" its button (so it
 * reads as the loop clicking, not the page moving on its own), then acts.
 * The moment the visitor uses a button themselves, their move wins and the
 * loop stops; it never starts again by itself. Pure, so the loop can be
 * tested without a browser; the hook only runs `nextLoopEvent`'s timer
 * while it plays.
 */

/** Timings, ms. */
export const LOOP = {
  /** A result on screen before the next move. */
  hold: 3200,
  /** The empty result: long enough to see the attempt fail and read why. */
  empty: 4800,
  /** A button shows pressed this long before its move happens. */
  press: 450,
} as const;

/** A move, by the button that makes it. */
export type LoopMove =
  | { kind: "try" }
  | { kind: "reset" }
  | { kind: "pick"; org: Org };

export interface LoopState {
  leak: LeakState;
  /** The visitor has turned the loop on (and nothing has stopped it since). */
  looping: boolean;
  /** The button the loop is pressing, about to act. */
  pressing: LoopMove | null;
  /** The last move made (by anyone): what comes next follows from it. */
  last: LoopMove["kind"] | null;
  /** Who made it: only the visitor's moves are announced. */
  by: "visitor" | "loop";
}

export const INITIAL_LOOP: LoopState = {
  leak: INITIAL_LEAK,
  looping: false,
  pressing: null,
  last: null,
  by: "visitor",
};

export type LoopAction =
  /** The visitor used the leak test: their move wins, and the loop stops. */
  | { type: "visitor"; action: LeakAction }
  /** The visitor turned the loop on: its first move is pressed at once. */
  | { type: "start" }
  /** Turned off, or stopped by scrolling away. */
  | { type: "stop" }
  | { type: "press"; move: LoopMove }
  | { type: "act" };

function toLeakAction(move: LoopMove): LeakAction {
  return move.kind === "pick"
    ? { type: "pick", org: move.org }
    : { type: move.kind };
}

export function loopReducer(state: LoopState, action: LoopAction): LoopState {
  switch (action.type) {
    case "visitor":
      return {
        ...state,
        leak: leakReducer(state.leak, action.action),
        looping: false,
        pressing: null,
        last: action.action.type,
        by: "visitor",
      };
    case "start":
      if (state.looping) return state;
      return {
        ...state,
        looping: true,
        pressing: nextLoopMove(state),
        by: "loop",
      };
    case "stop":
      if (!state.looping && !state.pressing) return state;
      return { ...state, looping: false, pressing: null };
    case "press":
      if (!state.looping) return state;
      return { ...state, pressing: action.move };
    case "act":
      if (!state.looping || !state.pressing) return state;
      return {
        ...state,
        leak: leakReducer(state.leak, toLeakAction(state.pressing)),
        pressing: null,
        last: state.pressing.kind,
        by: "loop",
      };
    default:
      return state;
  }
}

/** The organisation after `org`, round in table order. */
export function nextOrg(org: Org): Org {
  return ORGS[(ORGS.indexOf(org) + 1) % ORGS.length];
}

/** What the loop does next from here: clear an empty result, move on after a reset, otherwise try. */
export function nextLoopMove(state: LoopState): LoopMove {
  if (state.leak.ask === "other") return { kind: "reset" };
  if (state.last === "reset") {
    return { kind: "pick", org: nextOrg(state.leak.signedIn) };
  }
  return { kind: "try" };
}

/** The loop's next event and how long to wait for it (only asked while it's looping). */
export function nextLoopEvent(state: LoopState): {
  delay: number;
  action: LoopAction;
} {
  if (state.pressing) return { delay: LOOP.press, action: { type: "act" } };
  const delay = state.leak.ask === "other" ? LOOP.empty : LOOP.hold;
  return { delay, action: { type: "press", move: nextLoopMove(state) } };
}
