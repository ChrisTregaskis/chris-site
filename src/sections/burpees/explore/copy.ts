/**
 * Draft copy for the three exploration directions, every claim checked
 * against the app's repo (its spec, ADRs and deployment log). Shared opening
 * line: the live section's, with the build alluded to.
 */
export const BURPEES_TITLE = "Badass Burpees";

/** Direction A: the motion study. */
export const PLATE_LEDE =
  "A fitness app I built for myself, quickly and with an AI-assisted workflow, then shared with everyone for free. Pick a burpee, the reps and the time you have, and it paces you through every one, calling the count while a drawn figure moves with it.";

export const PLATE_STEPS = [
  {
    title: "Positions, not counts",
    text: "A Navy SEAL burpee is twelve positions and ten counts: the set on your hips and the stand at the end are silent. Each position is one beat of the clock and one frame of the drawing, so the voice, the figure and the timing are one system rather than three kept in step.",
  },
  {
    title: "Seven drawings, two burpees",
    text: "Take out the knee drives, and the chest-to-floor beats between them, and the same drawings make a six-count. A burpee is just a list of positions, so another variant is a new list, not new artwork.",
  },
  {
    title: "Cut on the beat",
    text: "No in-betweens. The figure cuts hard from one position to the next, so you see the count land: the set held for a second, then 0.8 seconds a move.",
  },
] as const;

/** Direction C: the set, called out. */
/** Direction C, chosen: A's lede, which Chris likes. */
export const CALLS_LEDE = PLATE_LEDE;
