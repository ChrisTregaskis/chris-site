import { Fragment, type ReactNode } from "react";

export type TopNavLink =
  | { href: string; label: string }
  /** An entry that is its own control (the Work menu), passed in whole. */
  | { label: string; control: ReactNode };

export interface TopNavProps {
  name: string;
  links: TopNavLink[];
  /** A control at the far right that stays visible at every width (the CV button). */
  action?: ReactNode;
}

/**
 * The b3 `.top` bar: name left, links right (hidden below `wide`), then an
 * optional action. It doesn't position itself; the page makes it sticky.
 */
export function TopNav({ name, links, action }: TopNavProps) {
  return (
    <header className="lk-topnav flex h-nav items-center justify-between gap-4 text-body-sm leading-[1.6]">
      <strong className="lk-name font-semibold">{name}</strong>
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
        {action}
      </div>
    </header>
  );
}
