import { type MouseEvent, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { stepNumeralClasses } from "@/ui/atoms/stepNumeralClasses";
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
          "group tone-ease w-full max-w-[34em] py-[22px] text-ink wide:w-auto",
          demo
            ? "cursor-auto wide:max-w-[460px]"
            : "cursor-pointer wide:max-w-[430px]",
          // Side by side, the others step back a tone (still 4.5:1), and come
          // back up while hovered, so they read as something to press.
          !on && "wide:[&:not(:hover)]:tone-dim",
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
          className={stepNumeralClasses(
            on,
            cn(
              "cursor-pointer",
              !on &&
                "group-hover:scale-100 group-hover:text-ink group-hover:opacity-100 group-hover:blur-0",
            ),
          )}
        >
          {badge ?? n}
        </button>
        <span className="mb-[6px] block text-[14px] font-medium text-muted">
          {kicker}
        </span>
        <h3
          className={cn(
            "m-0 mb-[10px] font-display text-[28px] font-semibold leading-[1.12] tracking-[-0.02em] underline decoration-transparent decoration-[1.5px] underline-offset-[6px] transition-[text-decoration-color] duration-base motion-reduce:transition-none",
            !on && "group-hover:decoration-accent",
          )}
        >
          {heading}
        </h3>
        <p className="m-0 text-[17px] text-muted">{text}</p>
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
