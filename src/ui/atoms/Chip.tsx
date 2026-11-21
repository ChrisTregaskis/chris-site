import { type ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface ChipProps {
  children: ReactNode;
  /** `md`: a chapter's tags; `sm`: a step's stack. */
  size?: "md" | "sm";
}

/** One tag in a ChipList: a quiet word in the mono, muted, no pill; renders an `<li>`. */
export function Chip({ children, size = "md" }: ChipProps) {
  return (
    <li
      className={cn(
        "font-code leading-[1.4] text-muted",
        size === "md" ? "text-[13px]" : "text-[12px]",
      )}
    >
      {children}
    </li>
  );
}
