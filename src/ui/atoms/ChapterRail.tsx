export interface ChapterRailProps {
  /** The chapter's number, as its heading shows it. */
  numeral: string;
  /** How many chapters there are, shown after it ("1/3"). */
  total: string;
}

/**
 * A case study's progress (see `.chapter-rail` in styles/index.css): its
 * number out of the total at the window's left edge, centred on its
 * height, over a ring and a rail that fills as the chapter is read; the
 * ring fills and the rail lights once it's finished. Place it directly
 * inside the chapter's Section, which it spans. Wide screens only (from
 * 1280px); decorative, as the chapter's own heading carries its number.
 */
export function ChapterRail({ numeral, total }: ChapterRailProps) {
  return (
    <div aria-hidden="true" className="chapter-rail">
      <div className="chapter-rail__pin">
        <div className="chapter-rail__gauge">
          <span className="chapter-rail__label">
            <span className="chapter-rail__numeral">{numeral}</span>
            <span className="chapter-rail__total">/{total}</span>
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
