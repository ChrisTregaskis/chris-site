import { type ReactNode } from "react";

interface VisuallyHiddenProps {
  children: ReactNode;
}

/** Text for assistive tech only (b3 `.sr`). */
export function VisuallyHidden({ children }: VisuallyHiddenProps) {
  return <span className="sr-only">{children}</span>;
}
