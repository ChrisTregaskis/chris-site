/**
 * Direction C's script: a set of 100 counted out by scroll, carried by the
 * app's own spoken calls (its recorded clips: "Go!", the tens, "Halfway",
 * "Five left", "Last one", "Done"), one line of the story on each. The
 * lines are checked against the app's repo: the spec's 6am goal and sweaty
 * hands, the first deploy the day after the repo was stood up (21 and 22
 * Aug 2026), 37 ADRs, and ADR 0034 (no analytics: nobody can tell from
 * inside the app how many use it).
 */
export const SET_REPS = 100;

export interface Call {
  /** Reps done when it's called. */
  at: number;
  call: string;
  line: string;
}

export const CALLS: readonly Call[] = [
  {
    at: 0,
    call: "Go!",
    line: "I built it for an audience of one: me, at six in the morning, with sweaty hands.",
  },
  {
    at: 10,
    call: "Ten.",
    line: "Pick a burpee, the reps and the time you have. It spreads the reps through the window and counts you through every one, a drawn figure moving with the count.",
  },
  {
    at: 50,
    call: "Halfway",
    line: "I built it quickly, with an AI-assisted workflow. It was on the web the day after I started.",
  },
  {
    at: 95,
    call: "Five left",
    line: "It has changed with my training ever since, and each decision is written down: 37 so far.",
  },
  {
    at: 99,
    call: "Last one",
    line: "No accounts and no tracking, by choice. I can't even tell who else uses it.",
  },
  {
    at: 100,
    call: "Done",
    line: "Built for one, and shared with everyone for free.",
  },
];

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
