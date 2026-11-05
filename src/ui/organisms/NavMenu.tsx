import { useId } from "react";
import { type NavMenuItem, NavMenuLinks } from "./NavMenuLinks";
import { useNavMenu } from "./useNavMenu";
import { cn } from "@/lib/cn";

export type { NavMenuItem };

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
        <NavMenuLinks
          items={items}
          listRef={menu.listRef}
          onLinkClick={menu.onLinkClick}
        />
      </div>
    </div>
  );
}
