import { ButtonLink } from "@/ui/atoms/ButtonLink";
import { VisuallyHidden } from "@/ui/atoms/VisuallyHidden";
import { cn } from "@/lib/cn";

interface BurpeesLinksProps {
  className?: string;
}

/** The chapter's two ways out: the app itself and its design system, each in a new tab. */
export function BurpeesLinks({ className }: BurpeesLinksProps) {
  return (
    <p className={cn("m-0 flex flex-wrap gap-x-6 gap-y-3", className)}>
      <ButtonLink
        variant="ghost"
        href="https://badass-burpees.app/"
        target="_blank"
        rel="noopener noreferrer"
      >
        Open badass-burpees.app
        <VisuallyHidden> (opens in a new tab)</VisuallyHidden>
      </ButtonLink>
      <ButtonLink
        variant="ghost"
        href="https://badass-burpees.app/design"
        target="_blank"
        rel="noopener noreferrer"
      >
        See the atomic design system
        <VisuallyHidden> (opens in a new tab)</VisuallyHidden>
      </ButtonLink>
    </p>
  );
}
