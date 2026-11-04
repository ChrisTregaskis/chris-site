import { ContactCopyA } from "./explore/ContactCopyA";
import { ContactCopyB } from "./explore/ContactCopyB";
import { ElsewhereLinks } from "./ElsewhereLinks";
import { CVRequestButton } from "@/features/cv-request";
import { EnquiryButton } from "@/features/enquiry";
import { ABOUT_VARIANT } from "@/sections/about/explore/variant";
import { Section } from "@/ui/molecules/Section";

/** The close: what Chris can do for a business, the way to ask, the CV, and where else to find him. */
export function Contact() {
  return (
    <Section
      id="contact"
      labelledBy="contact-title"
      spacing="closing"
      tone={{ from: "about", to: "base", feather: "100%" }}
    >
      <h2
        id="contact-title"
        className="m-0 mb-[18px] max-w-[16ch] font-display text-display-md font-semibold"
      >
        Let&apos;s work together.
      </h2>
      {ABOUT_VARIANT === "a" ? (
        <ContactCopyA />
      ) : ABOUT_VARIANT === "b" ? (
        <ContactCopyB />
      ) : (
        <ContactCopy />
      )}
    </Section>
  );
}

/** The live copy. */
function ContactCopy() {
  return (
    <>
      <p className="m-0 mb-[26px] max-w-measure text-lede text-muted">
        I help small and medium businesses get more from the software they
        already have: adding AI where it earns its place, improving what&apos;s
        there, or proving an idea with a focused prototype. Tell me what
        you&apos;re trying to do and I&apos;ll tell you how I&apos;d approach
        it.
      </p>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <EnquiryButton />
        <CVRequestButton variant="ghost" />
        <ElsewhereLinks />
      </div>
    </>
  );
}
