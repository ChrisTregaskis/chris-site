import { type ReactNode } from "react";

export interface TopNavLink {
  href: string;
  label: string;
}

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
    <header className="flex h-nav items-center justify-between gap-4 text-body-sm leading-[1.6]">
      <strong className="font-semibold">{name}</strong>
      <div className="flex items-center gap-[22px]">
        <nav aria-label="Primary" className="hidden gap-[22px] wide:flex">
          {links.map((link) => (
            <a
              key={`${link.href} ${link.label}`}
              href={link.href}
              className="text-muted no-underline transition-colors duration-base hover:text-ink motion-reduce:transition-none focus-visible:rounded-badge focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-signal"
            >
              {link.label}
            </a>
          ))}
        </nav>
        {action}
      </div>
    </header>
  );
}
