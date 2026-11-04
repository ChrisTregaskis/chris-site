import { CONTACT_LINKS } from "../contactLinks";
import { CVRequestButton } from "@/features/cv-request";
import { EnquiryButton } from "@/features/enquiry";
import { TextLink } from "@/ui/atoms/TextLink";

const OFFERS = [
  "Improving what's already there",
  "Adding AI where it earns its place",
  "Proving an idea with a focused prototype",
] as const;

const [linkedIn, gitHub, articles] = CONTACT_LINKS;

/**
 * Contact, take B (bolder): the three offers set as a short list in the
 * display face, borderless, then the ask, then where else to find Chris
 * folded into one plain sentence.
 */
export function ContactCopyB() {
  return (
    <>
      <p className="m-0 mb-3 max-w-measure text-balance text-lede text-muted">
        For small and medium businesses, that usually means:
      </p>
      <ul className="m-0 mb-6 list-none p-0">
        {OFFERS.map((offer) => (
          <li
            key={offer}
            className="m-0 text-balance py-[7px] font-display text-title font-medium wide:text-title-lg"
          >
            {offer}
          </li>
        ))}
      </ul>
      <p className="m-0 mb-[26px] max-w-measure text-balance text-lede text-muted">
        Tell me what you&apos;re after and I&apos;ll tell you how I&apos;d go
        about it.
      </p>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <EnquiryButton />
        <CVRequestButton variant="ghost" />
      </div>
      <p className="m-0 mt-9 text-balance text-body-sm text-muted">
        {/* Each link's hidden "(opens in a new tab)" holds spaces, so the
            punctuation after it is kept on its line. */}
        Or find me on{" "}
        <TextLink href={linkedIn.href} external>
          LinkedIn
        </TextLink>{" "}
        and{" "}
        <span className="whitespace-nowrap">
          <TextLink href={gitHub.href} external>
            GitHub
          </TextLink>
          ,
        </span>{" "}
        or read my{" "}
        <span className="whitespace-nowrap">
          <TextLink href={articles.href} external>
            articles on Medium
          </TextLink>
          .
        </span>
      </p>
    </>
  );
}
