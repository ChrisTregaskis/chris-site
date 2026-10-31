import { type ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface ChipProps {
  children: ReactNode;
  /** `md`: b3 chapter chips; `sm`: b3 step-card stack chips. */
  size?: "md" | "sm";
}

/** One tag in a ChipList; renders an `<li>`. */
export function Chip({ children, size = "md" }: ChipProps) {
  return (
    <li
      className={cn(
        "rounded-pill bg-raised text-ink",
        size === "md"
          ? "px-[10px] py-[3px] text-caption"
          : "px-[9px] py-[2px] text-[12.5px] leading-[1.4]",
      )}
    >
      {children}
    </li>
  );
}
