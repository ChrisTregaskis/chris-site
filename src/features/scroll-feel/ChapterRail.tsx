import { useChapterRails, useRailNumeral } from "./ScrollFeelContext";

/** How many case studies there are, for the count treatment's "/3". */
const CHAPTERS = 3;

interface ChapterRailProps {
  /** The chapter's number, as its heading shows it. */
  numeral: string;
}

/**
 * Prototype b's gauge for one case study (see `.chapter-rail` in
 * styles/index.css): its numeral at the window's edge, centred on its
 * height, over a dot and a rail that fills as the chapter is read; the dot
 * fills and the chapter settles once it's finished. The numeral's
 * treatment is `&num=` (`data-num`). Place it directly inside the
 * chapter's Section, which it spans. Decorative: the chapter's own heading
 * carries its number. Nothing outside `?scroll=b` and `?scroll=bc`, and
 * nothing drawn on phones.
 */
export function ChapterRail({ numeral }: ChapterRailProps) {
  const rails = useChapterRails();
  const num = useRailNumeral();
  if (!rails) return null;
  return (
    <div aria-hidden="true" className="chapter-rail" data-num={num}>
      <div className="chapter-rail__pin">
        <div className="chapter-rail__gauge">
          <span className="chapter-rail__label">
            <span className="chapter-rail__numeral" data-numeral={numeral}>
              {numeral}
            </span>
            {num === "c" ? (
              <span className="chapter-rail__of">/{CHAPTERS}</span>
            ) : null}
          </span>
          <span className="chapter-rail__dot" />
          <span className="chapter-rail__track">
            <span className="chapter-rail__fill" />
            <span className="chapter-rail__done" />
          </span>
        </div>
      </div>
    </div>
  );
}
