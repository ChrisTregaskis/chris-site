import { ShowcaseSection } from "../ShowcaseSection";
import { cn } from "@/lib/cn";
import { ChapterRail } from "@/ui/atoms/ChapterRail";
import { Container } from "@/ui/atoms/Container";
import { stepNumeralClasses } from "@/ui/atoms/stepNumeralClasses";
import { ChapterHeading } from "@/ui/molecules/ChapterHeading";
import { ChipList } from "@/ui/molecules/ChipList";
import { Section } from "@/ui/molecules/Section";
import { TopNav } from "@/ui/molecules/TopNav";
import { NavMenu } from "@/ui/organisms/NavMenu";

const STEPS = [
  {
    n: 1,
    title: "A first step",
    body: "Placeholder copy describing one part of the build.",
    stack: ["TypeScript", "React"],
    active: true,
  },
  {
    n: 2,
    title: "A second step",
    body: "More placeholder copy for the next part.",
    stack: ["Node", "Postgres"],
    active: false,
  },
];

export function LayoutSection() {
  return (
    <ShowcaseSection title="Layout">
      <p className="mb-6 max-w-measure text-muted">
        A mini page: TopNav (the name links home; Work is a NavMenu), a toned
        Section fading in from surface, a numbered ChapterHeading, and two open
        steps: the first selected, its numeral shown; the second a tone quieter,
        its numeral hidden until hovered. The nav links hide below the wide
        breakpoint. From 1280px, its ChapterRail is at the window&apos;s left
        edge while it&apos;s in view: its number out of the total, over a ring
        and a rail that fills as you scroll past, the ring filling once
        it&apos;s read.
      </p>
      <div className="relative">
        <ChapterRail numeral="1" total="2" />
        <div className="overflow-hidden rounded-card bg-surface">
          <Container>
            <TopNav
              name="Ada Lovelace"
              homeHref="#layout"
              links={[
                {
                  label: "Work",
                  control: (
                    <NavMenu
                      label="Work"
                      items={[
                        {
                          href: "#layout",
                          label: "A first study",
                          numeral: "1",
                        },
                        {
                          href: "#layout",
                          label: "How it was made",
                          sub: true,
                        },
                        {
                          href: "#layout",
                          label: "A second study",
                          numeral: "2",
                        },
                      ]}
                    />
                  ),
                },
                { href: "#layout", label: "About" },
                { href: "#layout", label: "Contact" },
              ]}
            />
          </Container>
          <Section
            id="showcase-chapter"
            labelledBy="showcase-chapter-title"
            tone={{ from: "base", to: "wayfinder", feather: "160px" }}
          >
            <ChapterHeading
              id="showcase-chapter-title"
              numeral="1"
              title="A chapter title that runs to two lines"
              lede="A short overview in muted ink sits under the title at every width, in one left-weighted column."
              chips={["React", "Node", "Agents", "Cloud"]}
            />
            <ul className="m-0 grid list-none gap-4 p-0 py-10 wide:grid-cols-2">
              {STEPS.map((step) => (
                <li
                  key={step.n}
                  className={cn(
                    "group tone-ease py-[22px] text-ink",
                    !step.active && "[&:not(:hover)]:tone-dim",
                  )}
                >
                  <span
                    className={stepNumeralClasses(
                      step.active,
                      "group-hover:scale-100 group-hover:opacity-100 group-hover:blur-0",
                    )}
                  >
                    {step.n}
                  </span>
                  <h3 className="m-0 mb-[10px] font-display text-[28px] font-semibold leading-[1.12] tracking-[-0.02em]">
                    {step.title}
                  </h3>
                  <p className="m-0 text-[17px] text-muted">{step.body}</p>
                  <div className="mt-3">
                    <ChipList items={step.stack} size="sm" label="Stack" />
                  </div>
                </li>
              ))}
            </ul>
          </Section>
        </div>
      </div>
    </ShowcaseSection>
  );
}
