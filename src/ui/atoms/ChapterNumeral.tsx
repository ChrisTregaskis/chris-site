export interface ChapterNumeralProps {
  /** The chapter's number, e.g. "1". */
  children: string;
}

/**
 * A case study's number, set very large in the accent above its title: the
 * page's numbered journey. Decorative (the order is the page's own), so
 * hidden from assistive tech.
 */
export function ChapterNumeral({ children }: ChapterNumeralProps) {
  return (
    <span
      aria-hidden="true"
      className="mb-1 block font-display text-numeral font-bold text-accent-strong [font-variation-settings:'opsz'_96]"
    >
      {children}
    </span>
  );
}
