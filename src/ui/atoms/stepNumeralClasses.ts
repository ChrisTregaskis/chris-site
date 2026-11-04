import { cn } from "@/lib/cn";

/**
 * A scroll story step's number, set large and light in the accent. It is
 * hidden until its step is the selected one, then comes into focus (from
 * soft and a touch small to sharp) and fades back out as the step passes;
 * keyboard focus shows it too, so a focused number is never invisible.
 * Reduced motion: shown and hidden at once. Shared by the Wayfinder steps
 * (a button) and the physio steps (a span); the Wayfinder steps also show
 * it on hover (`group-hover`).
 */
export function stepNumeralClasses(on: boolean, className?: string): string {
  return cn(
    "mb-2 block origin-[left_70%] border-0 bg-transparent p-0 text-left font-display text-[56px] font-light leading-none tracking-[-0.04em] text-accent transition-[opacity,filter,transform,color] duration-slow ease-enter motion-reduce:transition-none focus-visible:scale-100 focus-visible:opacity-100 focus-visible:blur-0 [&>svg]:size-[30px]",
    on ? "scale-100 opacity-100 blur-0" : "scale-[0.94] opacity-0 blur-[3px]",
    className,
  );
}
