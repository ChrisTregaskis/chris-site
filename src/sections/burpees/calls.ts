/**
 * The chapter's script: a set of 100 counted out by scroll and told in the
 * app's own spoken calls (its recorded clips: "Go!", the tens, "Halfway",
 * "Five left", "Last one", "Done"), one line of the story on each. Every
 * line is checked against the app's repo: the 6am goal and sweaty hands in
 * its spec; reps spread through the window and the count called out loud;
 * no backend, no accounts, nothing kept; a decision record for each change;
 * and no analytics, so nobody can tell from inside the app who uses it. The
 * build is told as a low-stakes experiment, never as how Chris builds
 * software for clients.
 */
export const SET_REPS = 100;

export interface Call {
  /** Reps done when it's called. */
  at: number;
  call: string;
  line: string;
}

/** As approved by Chris (4 Nov 2026). */
export const CALLS: readonly Call[] = [
  {
    at: 0,
    call: "Go!",
    line: "I built it for an audience of one: me, at six in the morning, with sweaty hands.",
  },
  {
    at: 10,
    call: "Ten.",
    line: "It works out where every rep should land and calls the count out loud. Nothing to think about: just get on and do them, hands-free.",
  },
  {
    at: 50,
    call: "Halfway",
    line: "Nothing at stake: no users to lose, no data to leak. A good place to see how far direction alone gets you.",
  },
  {
    at: 95,
    call: "Five left",
    line: "It has changed with my training ever since, and every decision is written down.",
  },
  {
    at: 99,
    call: "Last one",
    line: "No tracking either, by choice. I can't even tell who else uses it.",
  },
  {
    at: 100,
    call: "Done",
    line: "Built for one, and shared with everyone for free.",
  },
];

/** The last call, which comes in under the count once the set is done. */
export const DONE = CALLS[CALLS.length - 1];

/**
 * Where through the scroll (0 to 1) each call lands. The count runs fast
 * through the middle of the set and slows for the last few, as a set does.
 */
export const CALL_AT: readonly number[] = [0, 0.16, 0.38, 0.6, 0.76, 0.9];

/** Reps done at a 0 to 1 scroll progress: straight lines between the calls. */
export function repsAt(progress: number): number {
  if (progress <= CALL_AT[0]) return CALLS[0].at;
  for (let i = 1; i < CALL_AT.length; i++) {
    if (progress < CALL_AT[i]) {
      const t = (progress - CALL_AT[i - 1]) / (CALL_AT[i] - CALL_AT[i - 1]);
      return Math.floor(CALLS[i - 1].at + (CALLS[i].at - CALLS[i - 1].at) * t);
    }
  }
  return SET_REPS;
}

/** The call last made at a 0 to 1 scroll progress (its index in CALLS). */
export function callAt(progress: number): number {
  let last = 0;
  CALL_AT.forEach((at, index) => {
    if (progress >= at) last = index;
  });
  return last;
}
