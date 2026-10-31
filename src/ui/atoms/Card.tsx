import { type ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface CardProps {
  children: ReactNode;
  /** The b3 active step: accent-strong border. */
  active?: boolean;
  as?: "div" | "article" | "li";
}

/** The b3 step card surface. */
export function Card({ children, active = false, as = "div" }: CardProps) {
  const Element = as;
  return (
    <Element
      className={cn(
        "rounded-card border border-line bg-panel px-6 py-[22px] transition-colors duration-state motion-reduce:transition-none",
        active && "border-accent-strong",
      )}
    >
      {children}
    </Element>
  );
}
