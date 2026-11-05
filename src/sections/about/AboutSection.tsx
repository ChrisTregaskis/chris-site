import { AboutPhoto } from "./AboutPhoto";
import { PortraitArch } from "./explore/PortraitArch";
import { PortraitHillside } from "./explore/PortraitHillside";
import { PortraitLifted } from "./explore/PortraitLifted";
import { PortraitNight } from "./explore/PortraitNight";
import { PORTRAIT_VARIANT } from "./explore/variant";
import { Section } from "@/ui/molecules/Section";

/** Design exploration: the photo for `?portrait=a|b|c|d`, else the live one. */
function Portrait() {
  switch (PORTRAIT_VARIANT) {
    case "a":
      return <PortraitArch />;
    case "b":
      return <PortraitHillside />;
    case "c":
      return <PortraitNight />;
    case "d":
      return <PortraitLifted />;
    default:
      return <AboutPhoto />;
  }
}

/** About: two paragraphs and a photo of Chris with his son. */
export function AboutSection() {
  return (
    <Section
      id="about"
      labelledBy="about-title"
      spacing="roomy"
      tone={{ from: "burpees", to: "about" }}
    >
      <div className="grid gap-7 wide:grid-cols-[1fr_1.6fr]">
        <div>
          <h2
            id="about-title"
            className="m-0 font-display text-display-md font-semibold"
          >
            About
          </h2>
          <Portrait />
        </div>
        <div className="self-start wide:self-end">
          <p className="m-0 mb-4 max-w-[34em] text-body-lg">
            I&apos;m a full-stack TypeScript developer who loves turning a rough
            idea into something people use. Toy with the stack, build the proof
            of concept, see what holds. Lately that means AI: agents, MCP
            tooling and chat products, built with a workflow I&apos;ve tuned to
            ship a lot in a short time.
          </p>
          <p className="m-0 mb-4 max-w-[34em] text-body-lg text-muted">
            Tech to one side, it&apos;s the simple joys. My wife and kids,
            family game and film nights, walks across the British countryside,
            dusting off the drums and the odd Steam sale.
          </p>
        </div>
      </div>
    </Section>
  );
}
