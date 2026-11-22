import { CVRequestButton } from "@/features/cv-request";
import { EnquiryButton } from "@/features/enquiry";
import { Container } from "@/ui/atoms/Container";

/**
 * The first screen, set like a feature's opening page: the headline across
 * the full measure in the display serif, then a rule, and under it the
 * byline (who) on the left and the standfirst (what, and the way on to the
 * work) with the two ways in (get in touch, or take the CV) on the right.
 * The byline comes first in the source, so it is read first; the grid only
 * places it under the rule. Fills the viewport under the sticky bar, and
 * fits it whole down to about 600px tall: the padding and the headline's
 * size (the display-xl token) ease down with its height.
 */
export function Hero() {
  return (
    <Container>
      <section
        id="top"
        aria-labelledby="hero-title"
        className="box-border flex min-h-[calc(100vh-var(--size-nav))] flex-col justify-center pb-[clamp(16px,min(8vw,28svh_-_160px),96px)] pt-[clamp(24px,min(8vw,28svh_-_160px),96px)] supports-[min-height:100svh]:min-h-[calc(100svh-var(--size-nav))]"
      >
        <div className="grid grid-cols-1 gap-x-8 wide:grid-cols-12">
          <p className="col-span-full row-start-3 m-0 mb-4 text-body-sm leading-[1.5] text-muted wide:col-span-4 wide:mb-0 wide:max-w-[18em]">
            Chris Tregaskis, senior full-stack TypeScript developer
          </p>
          <h1
            id="hero-title"
            className="col-span-full row-start-1 m-0 text-balance font-display text-display-xl font-normal [font-feature-settings:'kern','liga','calt']"
          >
            I build whole products, end to end, built properly and shipped
            quickly with AI in the workflow.
          </h1>
          <hr
            aria-hidden="true"
            className="col-span-full row-start-2 m-0 mb-[clamp(16px,3svh,24px)] mt-[clamp(24px,5svh,48px)] h-px border-0 bg-ink/20"
          />
          <div className="col-span-full row-start-4 wide:col-span-8 wide:col-start-5 wide:row-start-3">
            <p className="m-0 mb-[clamp(20px,3.6svh,28px)] max-w-[30em] text-lede text-ink">
              Front end, back end, agents and the cloud underneath. Scroll down
              and watch one of them assemble.
            </p>
            <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
              <EnquiryButton />
              <CVRequestButton variant="ghost" />
            </div>
          </div>
        </div>
      </section>
    </Container>
  );
}
