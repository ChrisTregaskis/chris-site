import { cn } from "@/lib/cn";

/**
 * A form field as an open line: no box or fill, just a 3:1 underline
 * (line-field) that turns lilac and thickens on focus. Shared by Input,
 * Textarea and Select.
 */
export function fieldClasses(invalid: boolean, className?: string): string {
  return cn(
    "w-full rounded-none border-0 border-b-[1.5px] border-line-field bg-transparent px-0 py-[11px] font-body text-[16px] leading-[normal] text-ink transition-[border-color,box-shadow] duration-fast motion-reduce:transition-none hover:border-muted focus:border-accent focus:shadow-[inset_0_-1px_0_rgb(var(--color-accent))] focus:outline-none",
    invalid && "border-danger",
    className,
  );
}
