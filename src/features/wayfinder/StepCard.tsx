import { type MouseEvent, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { ChipList } from "@/ui/molecules/ChipList";

interface StepCardProps {
  n: number;
  /** Short name beside the number, e.g. "Chat overlay". */
  kicker: string;
  heading: string;
  text: string;
  stack?: string[];
  on: boolean;
  /** The demo card: no click-to-select on the card itself, a little wider. */
  demo?: boolean;
  /** The number badge's content (the demo shows a chat bubble). */
  badge?: ReactNode;
  badgeLabel: string;
  onSelect: (n: number) => void;
  stepRef: (element: HTMLElement | null) => void;
  cardRef: (element: HTMLElement | null) => void;
  children?: ReactNode;
}

/**
 * One step of the Wayfinder story. Clicking the card (or its number) selects
 * its part; controls inside it marked `data-no-select` keep their own clicks.
 */
export function StepCard({
  n,
  kicker,
  heading,
  text,
  stack,
  on,
  demo = false,
  badge,
  badgeLabel,
  onSelect,
  stepRef,
  cardRef,
  children,
}: StepCardProps) {
  const onCardClick = (event: MouseEvent<HTMLDivElement>) => {
    if (demo) return;
    if (
      event.target instanceof Element &&
      event.target.closest("[data-no-select], a, input")
    ) {
      return;
    }
    onSelect(n);
  };

  return (
    <div
      ref={stepRef}
      className="flex min-h-[58vh] items-center wide:min-h-[62vh]"
    >
      {/* The number button is the keyboard route; the card click is a shortcut. */}
      <div
        ref={cardRef}
        onClick={onCardClick}
        className={cn(
          "tone-ease w-full rounded-card border bg-panel/[0.96] px-6 py-[22px] text-ink transition-[border-color,background-color] duration-state motion-reduce:transition-none wide:w-auto",
          demo
            ? "cursor-auto wide:max-w-[460px]"
            : "cursor-pointer wide:max-w-[430px]",
          // Side by side, the others dim: b3's 45% frame, with quieter text that still reads at 4.5:1.
          on
            ? "border-accent-strong wide:bg-panel"
            : "border-line wide:tone-dim wide:border-line/[0.45] wide:bg-panel/[0.45]",
        )}
      >
        <button
          type="button"
          aria-label={badgeLabel}
          aria-current={on ? "step" : undefined}
          onClick={(event) => {
            event.stopPropagation();
            onSelect(n);
          }}
          className={cn(
            "mb-[10px] inline-grid size-7 cursor-pointer place-items-center rounded-pill border-0 p-0 text-[14px] font-semibold leading-none transition-colors duration-state motion-reduce:transition-none [&>svg]:size-[14px]",
            on ? "bg-accent text-on-accent" : "bg-raised text-ink",
          )}
        >
          {badge ?? n}
        </button>
        <span className="ml-2 align-[4px] text-[13px] font-medium text-muted">
          {kicker}
        </span>
        <h3 className="m-0 mb-[6px] font-display text-title font-semibold">
          {heading}
        </h3>
        <p className="m-0 text-[16px] text-muted">{text}</p>
        {children}
        {stack?.length ? (
          <div className="mt-3">
            <ChipList items={stack} size="sm" label="Stack" />
          </div>
        ) : null}
      </div>
    </div>
  );
}
