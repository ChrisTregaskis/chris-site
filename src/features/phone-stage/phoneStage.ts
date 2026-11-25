/**
 * How the two diagram chapters (Wayfinder and the physio rings) pin their
 * drawing when stacked, below `wide`, where it pins above the words:
 *
 * - `current`: the drawing with the step picker under it (a dropdown naming
 *   the step, and Try it beside it).
 * - `compact`: the drawing alone, smaller where it can be (the physio rings
 *   cropped to what's drawn), with a compact Try it on its bottom-right
 *   corner, so the words get at least half a phone's height. Scrolling
 *   already moves through the steps, so the picker goes; each step's words
 *   open with its name (the physio rings' with the picker's icon too).
 *
 * Side by side, nothing changes: the picker stays as it is.
 */
export type PhoneStage = "compact" | "current";

/**
 * What the page uses: `compact`, approved on a phone and shipped 25 Nov 2026.
 * `current` stays as the layout's other branch (tests, and the physio
 * chapter under reduced motion keeps its picker regardless).
 */
export const PHONE_STAGE_LIVE: PhoneStage = "compact";

// A type, not an interface, so it fits the dev panel's DevValues.
export type PhoneStageSettings = { phoneStage: PhoneStage };
