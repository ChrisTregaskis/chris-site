import { ChipList } from "./ChipList";
import { ChapterNumeral } from "@/ui/atoms/ChapterNumeral";

export interface ChapterHeadingProps {
  /** Id for the `<h2>`, so a Section can be labelled by it. */
  id: string;
  /** The chapter's number, set large above the title. */
  numeral?: string;
  title: string;
  lede?: string;
  chips?: string[];
}

/**
 * A case study's opener, in one left-weighted column at every width:
 * numeral, title, overview, tags. The right side is left open on wide
 * screens; the story below takes the full width.
 */
export function ChapterHeading({
  id,
  numeral,
  title,
  lede,
  chips,
}: ChapterHeadingProps) {
  return (
    <header className="max-w-[660px] pb-3">
      {numeral ? <ChapterNumeral>{numeral}</ChapterNumeral> : null}
      <h2
        id={id}
        className="m-0 text-balance font-display text-display-lg font-semibold"
      >
        {title}
      </h2>
      {lede ? (
        <p className="m-0 mt-[22px] max-w-[31em] text-muted wide:text-body-lg">
          {lede}
        </p>
      ) : null}
      {chips?.length ? (
        <div className="mt-[18px]">
          <ChipList items={chips} />
        </div>
      ) : null}
    </header>
  );
}
