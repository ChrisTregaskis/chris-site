import { type CSSProperties } from "react";
import { cn } from "@/lib/cn";

interface EmptyResultProps {
  shown: boolean;
  className?: string;
  style?: CSSProperties;
}

/**
 * Nothing comes back: an empty, dashed sheet where the result would be. In
 * once the attempt has hit the policy; out at once.
 */
export function EmptyResult({ shown, className, style }: EmptyResultProps) {
  return (
    <div
      data-testid="empty-result"
      data-shown={shown}
      className={cn(
        "absolute flex items-center justify-center border-2 border-dashed border-muted/80 bg-surface transition-opacity motion-reduce:transition-none",
        shown ? "opacity-100" : "opacity-0",
        className,
      )}
      style={{
        transitionDuration: shown
          ? "var(--duration-slow)"
          : "var(--duration-fast)",
        transitionDelay: shown
          ? "calc(var(--duration-state) + var(--duration-state))"
          : undefined,
        ...style,
      }}
    >
      <p className="m-0 font-medium text-muted">No sessions</p>
    </div>
  );
}
