import { ChipList } from "./ChipList";

export interface ChapterHeadingProps {
  /** Id for the `<h2>`, so a Section can be labelled by it. */
  id: string;
  title: string;
  lede?: string;
  chips?: string[];
}

/** The b3 `.chapter-head`: title left, lede and chips right from `wide`. */
export function ChapterHeading({
  id,
  title,
  lede,
  chips,
}: ChapterHeadingProps) {
  const hasAside = Boolean(lede) || Boolean(chips?.length);
  return (
    <header className="grid items-end gap-6 pb-[10px] wide:grid-cols-2">
      <h2 id={id} className="m-0 font-display text-display-lg font-semibold">
        {title}
      </h2>
      {hasAside ? (
        <div>
          {lede ? (
            <p className="m-0 max-w-measure-narrow text-muted">{lede}</p>
          ) : null}
          {chips?.length ? (
            <div className="mt-[14px]">
              <ChipList items={chips} />
            </div>
          ) : null}
        </div>
      ) : null}
    </header>
  );
}
