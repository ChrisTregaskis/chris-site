import { Fragment, type ReactNode } from "react";
import { TOP_NAV_BAR_CLASSES, TOP_NAV_NAME_CLASSES } from "./topNavClasses";

export type TopNavLink =
  | { href: string; label: string }
  /** An entry that is its own control (the Work menu), passed in whole. */
  | { label: string; control: ReactNode };

export interface TopNavProps {
  name: string;
  links: TopNavLink[];
  /**
   * A control at the far right (Get in touch). Visible at every width, unless
   * there is a `menu`: then only from `wide`, and the menu takes its place.
   */
  action?: ReactNode;
  /** The phone menu's button, shown below `wide` in place of the links and action. */
  menu?: ReactNode;
  /** Where the name links to: the top of the page (`#top`). */
  homeHref?: string;
}

/**
 * The b3 `.top` bar: name left, links right (hidden below `wide`), then an
 * optional action, or below `wide` the phone menu. It doesn't position
 * itself; the page makes it sticky.
 */
export function TopNav({ name, links, action, menu, homeHref }: TopNavProps) {
  return (
    <header className={TOP_NAV_BAR_CLASSES}>
      {homeHref ? (
        <a href={homeHref} className={TOP_NAV_NAME_CLASSES}>
          {name}
        </a>
      ) : (
        <strong className="font-display text-[18px] font-semibold tracking-[-0.01em]">
          {name}
        </strong>
      )}
      <div className="flex items-center gap-[22px]">
        <nav
          aria-label="Primary"
          className="hidden items-center gap-[22px] wide:flex"
        >
          {links.map((link) =>
            "control" in link ? (
              <Fragment key={`control ${link.label}`}>{link.control}</Fragment>
            ) : (
              <a
                key={`${link.href} ${link.label}`}
                href={link.href}
                className="text-muted no-underline transition-colors duration-base hover:text-ink motion-reduce:transition-none focus-visible:rounded-badge focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-signal"
              >
                {link.label}
              </a>
            ),
          )}
        </nav>
        {menu ? (
          <>
            <div className="contents wide:hidden">{menu}</div>
            {action ? (
              <div className="hidden wide:contents">{action}</div>
            ) : null}
          </>
        ) : (
          action
        )}
      </div>
    </header>
  );
}
