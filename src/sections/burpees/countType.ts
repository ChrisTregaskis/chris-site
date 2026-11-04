/**
 * The count's type: the chapter numeral's face and violet, set huge and
 * sized by the screen (a share of its width, capped by its height), never
 * by its column. Plain strings, never joined through `cn`: tailwind-merge
 * would drop the tight line height when a font size follows it.
 */
export const COUNT_TYPE =
  "whitespace-nowrap font-display font-bold tabular-nums leading-[0.8] tracking-[-0.06em] text-accent-strong [font-variation-settings:'opsz'_96]";

/** The count's size as the screen sets it: what the ruler measures. */
export const COUNT_SIZE =
  "text-[length:min(52vw,30svh)] wide:text-[length:min(24vw,46svh)]";

/** The count's size as drawn: the screen's size times the stage's fit (`--count-fit`). */
export const FITTED_COUNT_SIZE =
  "text-[length:calc(min(52vw,30svh)*var(--count-fit,1))] wide:text-[length:calc(min(24vw,46svh)*var(--count-fit,1))]";

/** A call as the app says it: display type in the signal colour. */
export const CALL_TYPE =
  "m-0 font-display text-[clamp(34px,4vw,56px)] font-semibold leading-[1.05] tracking-[-0.02em] text-signal";

/** The line of the story said with each call. */
export const LINE_TYPE = "m-0 mt-2 max-w-[24em] text-ink wide:text-body-lg";
