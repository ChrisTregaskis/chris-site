import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "ghost";
/** `md`: the b3 `.btn`; `sm`: the compact button in the sticky top bar. */
export type ButtonSize = "md" | "sm";

const BASE =
  "inline-flex items-center justify-center gap-[10px] rounded-pill font-body font-semibold leading-[normal] no-underline cursor-pointer transition-[background-color,box-shadow,opacity] duration-base ease-enter motion-reduce:transition-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-signal aria-disabled:cursor-progress aria-disabled:opacity-[0.85]";

const SIZES: Record<ButtonSize, string> = {
  md: "px-[22px] py-[13px] text-body-sm",
  sm: "px-4 py-2 text-label",
};

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-accent text-on-accent aria-pressed:bg-signal",
  ghost:
    "bg-transparent text-ink shadow-ring-line hover:shadow-ring-accent aria-pressed:shadow-ring-accent",
};

/** The b3 `.btn` look, shared by Button and ButtonLink. */
export function buttonClasses(
  variant: ButtonVariant,
  size: ButtonSize = "md",
): string {
  return cn(BASE, SIZES[size], VARIANTS[variant]);
}
