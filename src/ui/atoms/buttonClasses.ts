import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "ghost";
/** `md`: the page's buttons; `sm`: the compact one in the sticky top bar. */
export type ButtonSize = "md" | "sm";

const BASE =
  "inline-flex items-center justify-center gap-[10px] rounded-control font-body font-medium leading-[normal] no-underline cursor-pointer transition-[background-color,box-shadow,opacity] duration-base ease-enter motion-reduce:transition-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-signal aria-disabled:cursor-progress aria-disabled:opacity-[0.85]";

const SIZES: Record<ButtonSize, string> = {
  md: "px-5 py-3 text-body-sm",
  sm: "px-4 py-2 text-label",
};

const VARIANTS: Record<ButtonVariant, string> = {
  // The red pen: the one filled control. Pressed (a toggle that's on, the
  // demo running), it's inked in, graphite with white text.
  primary:
    "bg-accent text-on-accent hover:bg-accent-strong aria-pressed:bg-ink",
  // Secondary actions are links in look: a pencil underline that the red pen
  // goes over on hover, no outline or fill. Only primary actions are filled.
  ghost:
    "rounded-badge bg-transparent px-0 text-ink underline decoration-line-strong decoration-[1.5px] underline-offset-[7px] transition-[color,text-decoration-color,text-decoration-thickness] hover:decoration-accent hover:decoration-2 aria-pressed:decoration-accent aria-pressed:decoration-2",
};

/** The button look, shared by Button and ButtonLink. */
export function buttonClasses(
  variant: ButtonVariant,
  size: ButtonSize = "md",
): string {
  return cn(BASE, SIZES[size], VARIANTS[variant]);
}
