/**
 * Motion tokens in seconds, for Framer Motion. Mirrors the `--duration-*`,
 * `--ease-*` and `--stagger-*` variables in tokens.css; a test keeps the two
 * in step.
 */
export const DURATION = {
  fast: 0.2,
  base: 0.25,
  enter: 0.32,
  state: 0.45,
  slow: 0.55,
  flash: 0.75,
} as const;

export const EASE = {
  enter: [0.2, 0.8, 0.2, 1],
  lift: [0.3, 0.7, 0.2, 1],
  tick: [0.3, 0.6, 0.3, 1],
} as const;

export const STAGGER = {
  tight: 0.05,
  base: 0.15,
  loose: 0.3,
} as const;

export type DurationToken = keyof typeof DURATION;
export type EaseToken = keyof typeof EASE;
export type StaggerToken = keyof typeof STAGGER;
