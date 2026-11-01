import { CVRequestButton } from "@/features/cv-request";
import { EnquiryButton, LINKEDIN_URL } from "@/features/enquiry";
import { ButtonLink } from "@/ui/atoms/ButtonLink";
import { VisuallyHidden } from "@/ui/atoms/VisuallyHidden";
import { Section } from "@/ui/molecules/Section";

const LINKS = [
  { label: "LinkedIn", href: LINKEDIN_URL },
  { label: "GitHub", href: "https://github.com/ChrisTregaskis" },
  { label: "Articles", href: "https://medium.com/@c.tregaskis" },
] as const;

/** The close: what Chris can do for a business, the way to ask, the CV, and where else to find him. */
export function Contact() {
  return (
    <Section id="contact" labelledBy="contact-title" spacing="closing">
      <h2
        id="contact-title"
        className="m-0 mb-[18px] max-w-[16ch] font-display text-display-md font-semibold"
      >
        Let&apos;s work together.
      </h2>
      <p className="m-0 mb-[26px] max-w-measure text-lede text-muted">
        I help small and medium businesses get more from the software they
        already have: adding AI where it earns its place, improving what&apos;s
        there, or proving an idea with a focused prototype. Tell me what
        you&apos;re trying to do and I&apos;ll tell you how I&apos;d approach
        it.
      </p>
      <div className="flex flex-wrap gap-3">
        <EnquiryButton />
        <CVRequestButton variant="ghost" />
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
