/**
 * Min-width breakpoints in px from the b3 look: `sheet` is where the phone
 * bottom sheet becomes a side layout, `wide` where two columns begin.
 */
export const BREAKPOINT = { sheet: 621, wide: 861 } as const;

export type BreakpointToken = keyof typeof BREAKPOINT;
