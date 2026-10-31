export interface TopNavLink {
  href: string;
  label: string;
}

export interface TopNavProps {
  name: string;
  links: TopNavLink[];
}

/** The b3 `.top` bar. Static: sticky and scroll behaviour belong to 3c. */
export function TopNav({ name, links }: TopNavProps) {
  return (
    <header className="flex items-center justify-between py-[22px] text-body-sm">
      <strong className="font-semibold">{name}</strong>
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
    </header>
  );
}
