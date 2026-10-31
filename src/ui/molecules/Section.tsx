import { type ReactNode } from "react";
import { Container } from "@/ui/atoms/Container";
import { cn } from "@/lib/cn";

export interface SectionProps {
  id: string;
  /** Id of the heading that names this section (a landmark region). */
  labelledBy: string;
  children: ReactNode;
  /** Top rule in `line`, as between b3 chapters. */
  divided?: boolean;
  /** `chapter`: b3 chapter top spacing; `roomy`: About and Contact. */
  spacing?: "chapter" | "roomy";
}

export function Section({
  id,
  labelledBy,
  children,
  divided = true,
  spacing = "chapter",
}: SectionProps) {
  return (
    <Container>
      <section
        id={id}
        aria-labelledby={labelledBy}
        className={cn(
          divided && "border-t border-line",
          spacing === "chapter" ? "pt-section" : "py-section-lg",
        )}
      >
        {children}
      </section>
    </Container>
  );
}
