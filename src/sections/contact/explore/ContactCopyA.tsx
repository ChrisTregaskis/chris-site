import { ElsewhereLinks } from "../ElsewhereLinks";
import { CVRequestButton } from "@/features/cv-request";
import { EnquiryButton } from "@/features/enquiry";

/**
 * Contact, take A (conservative): the live copy tightened, its three offers
 * in the enquiry form's order. The one touch: the ways to ask on one line,
 * and where else to find Chris on a quieter line under it, named Elsewhere.
 */
export function ContactCopyA() {
  return (
    <>
      <p className="m-0 mb-[26px] max-w-measure text-pretty text-lede text-muted">
        I help small and medium businesses get more from their software:
        improving what&apos;s already there, adding AI where it earns its place,
        or proving a new idea with a focused prototype. Tell me what you&apos;re
        trying to do and I&apos;ll tell you how I&apos;d approach it.
      </p>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <EnquiryButton />
        <CVRequestButton variant="ghost" />
      </div>
      <div
        role="group"
        aria-labelledby="contact-elsewhere"
        className="mt-9 flex flex-wrap items-baseline gap-x-6 gap-y-1"
      >
        <span
          id="contact-elsewhere"
          className="w-full text-eyebrow font-semibold uppercase text-muted min-[400px]:w-auto"
        >
          Elsewhere
        </span>
        <ElsewhereLinks />
      </div>
    </>
  );
}
