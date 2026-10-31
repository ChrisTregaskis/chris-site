import { type ReactNode, useId } from "react";

interface ShowcaseSectionProps {
  title: string;
  children: ReactNode;
}

/** One labelled block of the showcase page. */
export function ShowcaseSection({ title, children }: ShowcaseSectionProps) {
  const headingId = useId();
  return (
    <section aria-labelledby={headingId} className="border-t border-line py-10">
      <h2
        id={headingId}
        className="mb-6 font-display text-display-md font-semibold"
      >
        {title}
      </h2>
      {children}
    </section>
  );
}
