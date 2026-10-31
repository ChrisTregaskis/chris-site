import { ShowcaseSection } from "../ShowcaseSection";
import { Card } from "@/ui/atoms/Card";
import { Container } from "@/ui/atoms/Container";
import { ChapterHeading } from "@/ui/molecules/ChapterHeading";
import { ChipList } from "@/ui/molecules/ChipList";
import { Section } from "@/ui/molecules/Section";
import { TopNav } from "@/ui/molecules/TopNav";

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
        A mini page: TopNav, a Section with a ChapterHeading and chips, and two
        Cards (the first active). The nav links hide below the wide breakpoint.
      </p>
      <div className="overflow-hidden rounded-card border border-line bg-surface">
        <Container>
          <TopNav
            name="Ada Lovelace"
            links={[
              { href: "#layout", label: "Work" },
              { href: "#layout", label: "About" },
              { href: "#layout", label: "Contact" },
            ]}
          />
        </Container>
        <Section id="showcase-chapter" labelledBy="showcase-chapter-title">
          <ChapterHeading
            id="showcase-chapter-title"
            title="A chapter title that runs to two lines"
            lede="A short lede in muted ink sits to the right of the title from the wide breakpoint, and below it on a phone."
            chips={["React", "Node", "Agents", "Cloud"]}
          />
          <ul className="m-0 grid list-none gap-4 p-0 py-10 wide:grid-cols-2">
            {STEPS.map((step) => (
              <Card key={step.n} as="li" active={step.active}>
                <span className="mb-[10px] inline-grid size-7 place-items-center rounded-pill bg-raised text-label font-semibold">
                  {step.n}
                </span>
                <h3 className="m-0 mb-[6px] font-display text-title font-semibold">
                  {step.title}
                </h3>
                <p className="m-0 text-[16px] text-muted">{step.body}</p>
                <div className="mt-3">
                  <ChipList items={step.stack} size="sm" label="Stack" />
                </div>
              </Card>
            ))}
          </ul>
        </Section>
      </div>
    </ShowcaseSection>
  );
}
