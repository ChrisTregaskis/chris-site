import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "ghost";

const BASE =
  "inline-flex items-center justify-center gap-[10px] rounded-pill px-[22px] py-[13px] font-body text-body-sm font-semibold leading-[normal] no-underline cursor-pointer transition-[background-color,box-shadow,opacity] duration-base ease-enter motion-reduce:transition-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-signal aria-disabled:cursor-progress aria-disabled:opacity-[0.85]";

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-accent text-on-accent aria-pressed:bg-signal",
  ghost:
    "bg-transparent text-ink shadow-ring-line hover:shadow-ring-accent aria-pressed:shadow-ring-accent",
};

/** The b3 `.btn` look, shared by Button and ButtonLink. */
export function buttonClasses(variant: ButtonVariant): string {
  return cn(BASE, VARIANTS[variant]);
}
