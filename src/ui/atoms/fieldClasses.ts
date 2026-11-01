import { cn } from "@/lib/cn";

/** The b3 `.cv input` look, shared by Input and Textarea. */
export function fieldClasses(invalid: boolean, className?: string): string {
  return cn(
    "w-full rounded-input border-[1.5px] border-line-field bg-surface px-[13px] py-[11px] font-body text-[16px] leading-[normal] text-ink transition-[border-color,box-shadow] duration-fast motion-reduce:transition-none hover:border-muted focus:border-accent focus:shadow-focus-glow focus:outline-none",
    invalid && "border-danger",
    className,
  );
}
