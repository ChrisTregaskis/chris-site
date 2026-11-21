export interface ChapterNumeralProps {
  /** The chapter's number, e.g. "1". */
  children: string;
}

/**
 * A case study's number, set large and light in the mono above its title,
 * like a drawing's sheet number: the page's numbered journey. Decorative
 * (the order is the page's own), so hidden from assistive tech.
 */
export function ChapterNumeral({ children }: ChapterNumeralProps) {
  return (
    <span
      aria-hidden="true"
      className="mb-4 block font-code text-numeral font-light text-ink"
    >
      {children}
    </span>
  );
}
