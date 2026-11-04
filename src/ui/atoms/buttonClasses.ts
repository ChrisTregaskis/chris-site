import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "ghost";
/** `md`: the page's buttons; `sm`: the compact one in the sticky top bar. */
export type ButtonSize = "md" | "sm";

const BASE =
  "inline-flex items-center justify-center gap-[10px] rounded-pill font-body font-semibold leading-[normal] no-underline cursor-pointer transition-[background-color,box-shadow,opacity] duration-base ease-enter motion-reduce:transition-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-signal aria-disabled:cursor-progress aria-disabled:opacity-[0.85]";

const SIZES: Record<ButtonSize, string> = {
  md: "px-[22px] py-[13px] text-body-sm",
  sm: "px-4 py-2 text-label",
};

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-accent text-on-accent aria-pressed:bg-signal",
  // Secondary actions are links in look: a lilac underline that thickens on
  // hover, no outline or fill. Only primary actions are filled.
  ghost:
    "rounded-[2px] bg-transparent px-0 text-ink underline decoration-accent decoration-[1.5px] underline-offset-[7px] transition-[color,text-decoration-thickness] hover:text-accent hover:decoration-[3px] aria-pressed:decoration-[3px]",
};

/** The button look, shared by Button and ButtonLink. */
export function buttonClasses(
  variant: ButtonVariant,
  size: ButtonSize = "md",
): string {
  return cn(BASE, SIZES[size], VARIANTS[variant]);
}
