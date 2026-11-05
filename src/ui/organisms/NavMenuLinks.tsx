import { type Ref } from "react";
import { cn } from "@/lib/cn";

export interface NavMenuItem {
  href: string;
  label: string;
  /** Shown large beside the label (the case study's number); decorative. */
  numeral?: string;
  /** A sub-entry of the item above it, set smaller and indented. */
  sub?: boolean;
}

export interface NavMenuLinksProps {
  items: NavMenuItem[];
  listRef?: Ref<HTMLUListElement>;
  onLinkClick?: () => void;
  /** Id of the text that names the list (the phone menu's "Work"). */
  labelledBy?: string;
  /** Taller rows, for a finger (the phone menu). */
  roomy?: boolean;
}

/**
 * The numbered in-page links behind the top bar's Work menu (and the phone
 * menu): each case study's number set large in violet beside its name, a
 * sub-entry smaller and indented under its parent. No rules or boxes.
 */
export function NavMenuLinks({
  items,
  listRef,
  onLinkClick,
  labelledBy,
  roomy = false,
}: NavMenuLinksProps) {
  return (
    <ul
      ref={listRef}
      aria-labelledby={labelledBy}
      className="m-0 list-none p-0"
    >
      {items.map((item) => (
        <li key={`${item.href} ${item.label}`}>
          <a
            href={item.href}
            onClick={onLinkClick}
            className={cn(
              "group flex items-baseline gap-4 no-underline focus-visible:rounded-badge focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-signal",
              item.sub
                ? "-mt-[2px] pb-[10px] pl-[44px] text-[14px] leading-[1.5] text-muted hover:text-ink"
                : "py-[7px] text-ink",
              roomy && (item.sub ? "pb-[12px]" : "py-[10px]"),
            )}
          >
            {item.sub ? null : (
              <span
                aria-hidden="true"
                className="w-7 flex-none font-display text-[28px] font-bold leading-none tracking-[-0.04em] text-accent-strong transition-colors duration-base group-hover:text-accent group-focus-visible:text-accent motion-reduce:transition-none"
              >
                {item.numeral}
              </span>
            )}
            <span
              className={cn(
                "underline decoration-transparent decoration-[1.5px] underline-offset-[6px] transition-[text-decoration-color] duration-base group-hover:decoration-accent group-focus-visible:decoration-accent motion-reduce:transition-none",
                !item.sub &&
                  "font-display text-[19px] font-semibold leading-[1.3] tracking-[-0.01em]",
              )}
            >
              {item.label}
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}
