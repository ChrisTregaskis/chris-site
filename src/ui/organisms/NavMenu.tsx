import { useId } from "react";
import { useNavMenu } from "./useNavMenu";
import { cn } from "@/lib/cn";

export interface NavMenuItem {
  href: string;
  label: string;
  /** Shown large beside the label (the case study's number); decorative. */
  numeral?: string;
  /** A sub-entry of the item above it, set smaller and indented. */
  sub?: boolean;
}

export interface NavMenuProps {
  label: string;
  items: NavMenuItem[];
}

/**
 * A top-bar disclosure: a button that shows a short list of in-page links
 * (Work: each case study, by number). It floats over the page on a surface
 * of its own, with no border or card chrome: the numerals and names carry it.
 */
export function NavMenu({ label, items }: NavMenuProps) {
  const listId = useId();
  const menu = useNavMenu();

  return (
    <div
      ref={menu.rootRef}
      onKeyDown={menu.onRootKeyDown}
      onBlur={menu.onRootBlur}
      className="relative"
    >
      <button
        ref={menu.buttonRef}
        type="button"
        aria-expanded={menu.open}
        aria-controls={listId}
        onClick={menu.onButtonClick}
        onKeyDown={menu.onButtonKeyDown}
        className={cn(
          "inline-flex cursor-pointer items-center gap-[6px] border-0 bg-transparent p-0 font-body text-[length:inherit] leading-[inherit] transition-colors duration-base hover:text-ink motion-reduce:transition-none focus-visible:rounded-badge focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-signal",
          menu.open ? "text-ink" : "text-muted",
        )}
      >
        {label}
        <svg
          viewBox="0 0 20 20"
          aria-hidden="true"
          className={cn(
            "size-[14px] transition-transform duration-base motion-reduce:transition-none",
            menu.open && "rotate-180",
          )}
        >
          <path
            d="M5 8l5 5 5-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <div
        id={listId}
        hidden={!menu.open}
        className="absolute -left-6 top-[calc(100%+18px)] z-40 w-[330px] rounded-[6px] bg-surface/95 px-6 pb-4 pt-3 shadow-popover backdrop-blur-md"
      >
        <ul ref={menu.listRef} className="m-0 list-none p-0">
          {items.map((item) => (
            <li key={`${item.href} ${item.label}`}>
              <a
                href={item.href}
                onClick={menu.onLinkClick}
                className={cn(
                  "group flex items-baseline gap-4 no-underline focus-visible:rounded-badge focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-signal",
                  item.sub
                    ? "-mt-[2px] pb-[10px] pl-[44px] text-[14px] leading-[1.5] text-muted hover:text-ink"
                    : "py-[7px] text-ink",
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
      </div>
    </div>
  );
}
