import { CVRequestButton } from "@/features/cv-request";
import { ButtonLink } from "@/ui/atoms/ButtonLink";
import { Container } from "@/ui/atoms/Container";

/** The first screen: who, what, and the two ways in. Fills the viewport, so the work is found by scrolling. */
export function Hero() {
  return (
    <Container>
      <section
        aria-labelledby="hero-title"
        className="box-border flex min-h-screen flex-col justify-center pb-[clamp(56px,9vw,110px)] pt-[clamp(56px,12vw,150px)] supports-[min-height:100svh]:min-h-[100svh]"
      >
        <p className="m-0 mb-[18px] text-body-sm leading-[1.6] text-muted">
          Chris Tregaskis, senior full-stack TypeScript developer
        </p>
        <h1
          id="hero-title"
          className="m-0 mb-7 max-w-[15ch] font-display text-display-xl font-semibold"
        >
          I build whole products, end to end, and ship them fast with AI in the
          workflow.
        </h1>
        <p className="m-0 mb-[30px] max-w-measure text-lede text-muted">
          Front end, back end, agents and the cloud underneath. Scroll down and
          watch one of them assemble.
        </p>
        <div className="flex flex-wrap gap-3">
          <CVRequestButton />
          <ButtonLink variant="ghost" href="#work">
            See the work
          </ButtonLink>
        </div>
      </section>
    </Container>
  );
}
