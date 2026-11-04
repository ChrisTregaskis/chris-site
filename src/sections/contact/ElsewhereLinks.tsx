import { CONTACT_LINKS } from "./contactLinks";
import { ButtonLink } from "@/ui/atoms/ButtonLink";
import { VisuallyHidden } from "@/ui/atoms/VisuallyHidden";

/** Contact's outbound links, each a lilac-underlined link opening a new tab. */
export function ElsewhereLinks() {
  return (
    <>
      {CONTACT_LINKS.map((link) => (
        <ButtonLink
          key={link.label}
          variant="ghost"
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
        >
          {link.label}
          <VisuallyHidden> (opens in a new tab)</VisuallyHidden>
        </ButtonLink>
      ))}
    </>
  );
}
