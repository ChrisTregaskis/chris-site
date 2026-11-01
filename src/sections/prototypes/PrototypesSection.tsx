import { ChapterHeading } from "@/ui/molecules/ChapterHeading";
import { RevealItem, RevealList } from "@/ui/molecules/Reveal";
import { Section } from "@/ui/molecules/Section";

const PROTOTYPES = [
  {
    title: "Content migration with AI sorting",
    text: "A large content library moved across, with AI categorising every item and retrieval (RAG) checking its work.",
  },
  {
    title: "Documents to structured data",
    text: "Pulls a schema's fields out of uploaded documents, with a person reviewing each one before it's saved.",
  },
  {
    title: "Image localisation for slide decks",
    text: "Replaces the text baked into slide images with another market's language, keeping the layout intact.",
  },
  {
    title: "A shared MCP server for a team",
    text: "One set of tools every developer's AI assistant can call, so the whole team works from the same playbook.",
  },
  {
    title: "Early MCP servers for a start-up",
    text: "The first MCP servers for a start-up's product, so AI assistants could work with its data from day one.",
  },
] as const;

/** The hub figure: an MCP server in the middle, the five prototypes around it. */
function HubFigure() {
  const spokes = [0, 1, 2, 3, 4].map((i) => {
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
    return {
      i,
      x: 160 + Math.cos(angle) * 112,
      y: 150 + Math.sin(angle) * 112,
    };
  });
  return (
    <svg
      viewBox="0 0 320 300"
      aria-hidden="true"
      className="mx-auto block h-auto w-full max-w-[360px]"
    >
      {spokes.map(({ i, x, y }) => (
        <line
          key={`line-${i}`}
          x1={160}
          y1={150}
          x2={x}
          y2={y}
          className="stroke-line-strong stroke-[1.5] [stroke-dasharray:3_4]"
        />
      ))}
      <circle
        cx={160}
        cy={150}
        r={46}
        className="fill-raised stroke-accent stroke-[1.5]"
      />
      <text
        x={160}
        y={146}
        textAnchor="middle"
        className="fill-ink font-display text-[17px] font-semibold"
      >
        MCP
      </text>
      <text
        x={160}
        y={166}
        textAnchor="middle"
        className="fill-muted font-body text-[11px] font-medium"
      >
        shared tools
      </text>
      {spokes.map(({ i, x, y }) => (
        <g key={`node-${i}`}>
          <circle
            cx={x}
            cy={y}
            r={22}
            className="fill-panel stroke-line-strong stroke-[1.3]"
          />
          <text
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="central"
            className="fill-ink font-body text-[15px] font-semibold"
          >
            {i + 1}
          </text>
        </g>
      ))}
    </svg>
  );
}

/** Chapter 4: smaller AI builds, each answering one question, and shared MCP tooling. */
export function PrototypesSection() {
  return (
    <Section id="prototypes" labelledBy="prototypes-title">
      <ChapterHeading
        id="prototypes-title"
        title="AI prototypes and MCP tooling"
        lede="Quick builds that each answer one question: can AI do this job well enough to rely on? Plus the tooling that lets a team share what works."
        chips={["n8n", "Claude", "Gemini", "Qdrant", "MCP SDK", "Next.js"]}
      />
      <div className="grid items-center gap-8 py-[clamp(40px,6vw,80px)] wide:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] wide:gap-[clamp(24px,5vw,72px)]">
        <HubFigure />
        <RevealList className="m-0 grid list-none gap-3 p-0">
          {PROTOTYPES.map((item, index) => (
            <RevealItem
              key={item.title}
              className="grid grid-cols-[28px_1fr] gap-x-4 rounded-card border border-line bg-panel px-5 py-4"
            >
              <span
                aria-hidden="true"
                className="row-span-2 inline-grid size-7 place-items-center rounded-pill bg-raised text-[14px] font-semibold"
              >
                {index + 1}
              </span>
              <h3 className="m-0 font-display text-[19px] font-semibold leading-[1.25]">
                {item.title}
              </h3>
              <p className="m-0 mt-1 text-[15px] leading-[1.55] text-muted">
                {item.text}
              </p>
            </RevealItem>
          ))}
        </RevealList>
      </div>
    </Section>
  );
}
