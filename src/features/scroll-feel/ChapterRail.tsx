import { useChapterRails } from "./ScrollFeelContext";

interface ChapterRailProps {
  /** The chapter's number, as its heading shows it. */
  numeral: string;
}

/**
 * Prototype b's gauge for one case study (see `.chapter-rail` in
 * styles/index.css): its numeral at the window's edge over a rail that
 * fills as the chapter is read, and settles once it's finished. Place it
 * directly inside the chapter's Section, which it spans. Decorative: the
 * chapter's own heading carries its number. Nothing outside `?scroll=b`
 * and `?scroll=bc`.
 */
export function ChapterRail({ numeral }: ChapterRailProps) {
  if (!useChapterRails()) return null;
  return (
    <div aria-hidden="true" className="chapter-rail">
      <div className="chapter-rail__pin">
        <div className="chapter-rail__gauge">
          <span className="chapter-rail__numeral" data-numeral={numeral}>
            {numeral}
          </span>
          <span className="chapter-rail__track">
            <span className="chapter-rail__fill" />
            <span className="chapter-rail__done" />
          </span>
        </div>
      </div>
    </div>
  );
}
