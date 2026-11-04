import { type ReactNode } from "react";
import { type ChapterTone, chapterToneStyle } from "./chapterTone";
import { Container } from "@/ui/atoms/Container";
import { cn } from "@/lib/cn";

export interface SectionProps {
  id: string;
  /** Id of the heading that names this section (a landmark region). */
  labelledBy: string;
  children: ReactNode;
  /** The chapter's full-bleed tone, fading in from the one before (no rule between chapters). */
  tone?: ChapterTone;
  /** `chapter`: chapter top spacing; `roomy`: About; `closing`: Contact (roomy top, short bottom). */
  spacing?: "chapter" | "roomy" | "closing";
}

export function Section({
  id,
  labelledBy,
  children,
  tone,
  spacing = "chapter",
}: SectionProps) {
  return (
    <Container>
      <section
        id={id}
        aria-labelledby={labelledBy}
        style={tone ? chapterToneStyle(tone) : undefined}
        className={cn(
          tone && "chapter-tone",
          spacing === "chapter" && "pt-section",
          spacing === "roomy" && "py-section-lg",
          spacing === "closing" && "pb-10 pt-section-lg",
        )}
      >
        {children}
      </section>
    </Container>
  );
}
