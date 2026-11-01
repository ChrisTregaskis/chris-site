import { CVRequestButton } from "@/features/cv-request";
import { EnquiryButton } from "@/features/enquiry";
import { Container } from "@/ui/atoms/Container";

/**
 * The first screen: who, what, and the two ways in (get in touch, or take
 * the CV; the lede and the nav's Work link point on to the work). Fills the
 * viewport under the sticky bar, so the work is found by scrolling, and fits
 * it whole down to about 600px tall: b3's padding and spacing from about
 * 900px, easing down with the viewport's height below that (the headline's
 * size does too, in the display-xl token).
 */
export function Hero() {
  return (
    <Container>
      <section
        aria-labelledby="hero-title"
        className="box-border flex min-h-[calc(100vh-var(--size-nav))] flex-col justify-center pb-[clamp(16px,min(9vw,32svh_-_178px),110px)] pt-[clamp(16px,min(12vw,45svh_-_255px),150px)] supports-[min-height:100svh]:min-h-[calc(100svh-var(--size-nav))]"
      >
        <p className="m-0 mb-[clamp(10px,2.6svh,18px)] text-body-sm leading-[1.6] text-muted">
          Chris Tregaskis, senior full-stack TypeScript developer
        </p>
        <h1
          id="hero-title"
          className="m-0 mb-[clamp(14px,4svh,28px)] max-w-[15ch] font-display text-display-xl font-semibold"
        >
          I build whole products, end to end, built properly and shipped quickly
          with AI in the workflow.
        </h1>
        <p className="m-0 mb-[clamp(18px,4.3svh,30px)] max-w-measure text-lede text-muted">
          Front end, back end, agents and the cloud underneath. Scroll down and
          watch one of them assemble.
        </p>
        <div className="flex flex-wrap gap-3">
          <EnquiryButton />
          <CVRequestButton variant="ghost" />
        </div>
      </section>
    </Container>
  );
}
