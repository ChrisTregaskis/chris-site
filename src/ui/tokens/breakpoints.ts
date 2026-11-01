/**
 * Min-width breakpoints in px from the b3 look: `sheet` is where the phone
 * bottom sheet becomes a side layout, `wide` where two columns begin.
 */
export const BREAKPOINT = { sheet: 621, wide: 861 } as const;

export type BreakpointToken = keyof typeof BREAKPOINT;

/** Media query for "below the wide breakpoint" (the stacked, phone layout). */
export const BELOW_WIDE = `(max-width: ${BREAKPOINT.wide - 1}px)`;
