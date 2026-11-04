import { useScrollFeel } from "./ScrollFeelContext";

interface ChapterRailProps {
  /** The chapter's number, as its heading shows it. */
  numeral: string;
}

/**
 * Prototype b's reading progress for one case study (see `.chapter-rail` in
 * styles/index.css): its numeral in the margin over a rail that fills as the
 * chapter is read. Place it directly inside the chapter's Section, which it
 * spans. Decorative: the chapter's own heading carries its number. Nothing
 * outside `?scroll=b`.
 */
export function ChapterRail({ numeral }: ChapterRailProps) {
  if (useScrollFeel() !== "b") return null;
  return (
    <div aria-hidden="true" className="chapter-rail">
      <div className="chapter-rail__pin">
        <span className="chapter-rail__numeral">{numeral}</span>
        <span className="chapter-rail__track">
          <span className="chapter-rail__fill" />
        </span>
      </div>
    </div>
  );
}
