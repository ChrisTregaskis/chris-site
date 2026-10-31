import { type ReactNode } from "react";

export interface ContainerProps {
  children: ReactNode;
  as?: "div" | "main" | "header" | "footer";
}

/** The b3 `.wrap`: centred, max 1200px, fluid gutter. */
export function Container({ children, as = "div" }: ContainerProps) {
  const Element = as;
  return (
    <Element className="mx-auto max-w-container px-gutter">{children}</Element>
  );
}
