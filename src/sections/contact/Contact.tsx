import { CVRequestButton } from "@/features/cv-request";
import { ButtonLink } from "@/ui/atoms/ButtonLink";
import { VisuallyHidden } from "@/ui/atoms/VisuallyHidden";
import { Section } from "@/ui/molecules/Section";

const LINKS = [
  { label: "GitHub", href: "https://github.com/ChrisTregaskis" },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/christophertregaskis",
  },
  { label: "Articles", href: "https://medium.com/@c.tregaskis" },
] as const;

/** The close: one quiet line about side projects, the CV and where else to find me. */
export function Contact() {
  return (
    <Section id="contact" labelledBy="contact-title" spacing="closing">
      <h2
        id="contact-title"
        className="m-0 mb-[26px] max-w-[16ch] font-display text-display-md font-semibold"
      >
        Always up for an interesting side project. Get in touch.
      </h2>
      <div className="flex flex-wrap gap-3">
        <CVRequestButton />
        {LINKS.map((link) => (
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
      </div>
    </Section>
  );
}
