/** How a button looks while the example loop presses it: a brief tap, no layout change. */
export const LOOP_PRESSED =
  "scale-[0.97] rounded-[3px] bg-accent/15 shadow-[0_0_0_6px_rgb(var(--color-accent)/0.15)]";

/** Every leak-test button's transition, so the loop's press shows. */
export const PRESSABLE =
  "transition-[color,background-color,box-shadow,transform,opacity] duration-fast motion-reduce:transition-none";
