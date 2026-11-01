import { type ReactNode } from "react";
import { ChapterHeading } from "@/ui/molecules/ChapterHeading";
import { RevealItem, RevealList } from "@/ui/molecules/Reveal";
import { Section } from "@/ui/molecules/Section";

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

const STEPS: { title: string; text: string; icon: ReactNode }[] = [
  {
    title: "Specs and plans",
    text: "Every piece of work starts as a written spec, then a plan of small tasks with clear finish lines.",
    icon: (
      <>
        <path d="M6 3h9l4 4v14H6z" {...stroke} />
        <path d="M9 11h7M9 15h7M9 7h3" {...stroke} />
      </>
    ),
  },
  {
    title: "Agents implement",
    text: "AI agents build the tasks, several at once, each given just the context it needs.",
    icon: (
      <>
        <rect x="4" y="7" width="7" height="7" rx="2" {...stroke} />
        <rect x="13" y="7" width="7" height="7" rx="2" {...stroke} />
        <path d="M7.5 14v3M16.5 14v3M7.5 7V4M16.5 7V4" {...stroke} />
      </>
    ),
  },
  {
    title: "Review gates",
    text: "Tests, types, lint and a fresh review, then my own read, before anything merges.",
    icon: (
      <>
        <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z" {...stroke} />
        <path d="M8.5 12l2.5 2.5 4.5-5" {...stroke} />
      </>
    ),
  },
  {
    title: "Living working docs",
    text: "Plans, decisions and hand-overs kept current, so any session can pick the work straight back up.",
    icon: (
      <>
        <path d="M4 5h10M4 10h10M4 15h6" {...stroke} />
        <path d="M15 19l5-5-2-2-5 5v2z" {...stroke} />
      </>
    ),
  },
];

/** How I work with AI: the four habits behind the speed. */
export function AiWorkflowSection() {
  return (
    <Section id="how-i-work" labelledBy="how-i-work-title">
      <ChapterHeading
        id="how-i-work-title"
        title="How I work with AI"
        lede="The workflow behind the speed. AI does a lot of the typing; the structure around it is what keeps the quality up."
      />
      <RevealList className="m-0 grid list-none gap-4 p-0 py-[clamp(40px,6vw,80px)] sheet:grid-cols-2 wide:grid-cols-4">
        {STEPS.map((step) => (
          <RevealItem
            key={step.title}
            className="rounded-card border border-line bg-panel px-6 py-[22px]"
          >
            <span
              aria-hidden="true"
              className="mb-4 grid size-11 place-items-center rounded-control bg-raised text-accent"
            >
              <svg viewBox="0 0 24 24" className="size-6">
                {step.icon}
              </svg>
            </span>
            <h3 className="m-0 mb-[6px] font-display text-[20px] font-semibold leading-[1.2]">
              {step.title}
            </h3>
            <p className="m-0 text-[15px] leading-[1.55] text-muted">
              {step.text}
            </p>
          </RevealItem>
        ))}
      </RevealList>
    </Section>
  );
}
