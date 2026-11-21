import { motion, useReducedMotion } from "framer-motion";
import { type ReactNode, useState } from "react";
import { ARCH_COPY, type Principle, type PrincipleId } from "./archCopy";
import { type ArchDraft } from "./archDraft";
import { type ArchFigureProps, Glyph } from "./archKit";
import { RingsPlan } from "./RingsPlan";
import { RouteMap } from "./RouteMap";
import { SectionCut } from "./SectionCut";
import { cn } from "@/lib/cn";
import { useMotionPreset } from "@/ui/motion/useMotionPreset";

const REVEAL_VIEW = { once: true, margin: "0px 0px -15% 0px" } as const;

const FIGURES: Record<
  ArchDraft["direction"],
  (p: ArchFigureProps) => ReactNode
> = {
  a: RouteMap,
  b: SectionCut,
  c: RingsPlan,
};

interface ArchLayerProps {
  draft: ArchDraft;
}

/**
 * The physio chapter's how-it-runs layer (draft): a small drawing of how the
 * platform runs and the four principles that keep it shut in, one of three
 * drawings, before the row-level security steps or after the leak test. A
 * principle under the pointer lights its part of the drawing; the drawing
 * itself carries each principle's glyph, so the two match without numbers.
 */
export function ArchLayer({ draft }: ArchLayerProps) {
  const still = useReducedMotion() ?? false;
  const [active, setActive] = useState<PrincipleId | null>(null);
  const reveal = useMotionPreset("fadeUp");
  const copy = ARCH_COPY[draft.place];
  const Figure = FIGURES[draft.direction];
  const figure = <Figure active={active} still={still} />;

  const head = (
    <motion.div
      initial={still ? false : reveal.initial}
      whileInView={reveal.animate}
      viewport={REVEAL_VIEW}
      transition={reveal.transition}
    >
      <p className="m-0 mb-2 text-label font-semibold text-muted">
        {copy.eyebrow}
      </p>
      <h3
        id="physio-arch-title"
        className="m-0 mb-[10px] font-display text-[28px] font-semibold leading-[1.12] tracking-[-0.02em]"
      >
        {copy.title}
      </h3>
      <p className="m-0 max-w-[31em] text-[17px] text-muted">{copy.intro}</p>
    </motion.div>
  );

  const principle = (p: Principle) => {
    return (
      <motion.li
        key={p.id}
        data-principle={p.id}
        className="flex gap-[14px]"
        initial={still ? false : reveal.initial}
        whileInView={reveal.animate}
        viewport={REVEAL_VIEW}
        transition={reveal.transition}
        onPointerEnter={(event) => {
          if (event.pointerType === "mouse") setActive(p.id);
        }}
        onPointerLeave={() => setActive(null)}
      >
        <Glyph
          id={p.id}
          className={cn(
            "mt-[3px] size-[22px] shrink-0 transition-colors duration-base motion-reduce:transition-none",
            active === p.id ? "text-signal" : "text-accent",
          )}
        />
        <div>
          <h4 className="m-0 mb-1 font-display text-[19px] font-semibold leading-[1.25] text-ink">
            {p.title}
          </h4>
          <p className="m-0 text-[16px] leading-[1.55] text-muted">{p.text}</p>
        </div>
      </motion.li>
    );
  };

  const list = (indexes: number[], className?: string) => (
    <ul className={cn("m-0 grid list-none gap-[22px] p-0", className)}>
      {copy.principles
        .filter((_, i) => indexes.includes(i))
        .map((p) => principle(p))}
    </ul>
  );

  return (
    <section
      aria-labelledby="physio-arch-title"
      data-testid="physio-arch"
      data-direction={draft.direction}
      data-place={draft.place}
      className={cn(
        "relative",
        draft.place === "before"
          ? "pb-[clamp(24px,6vw,72px)] pt-[clamp(32px,6vw,72px)]"
          : "pb-section pt-[clamp(8px,3vw,32px)]",
      )}
    >
      {draft.direction === "a" ? (
        // A: the copy carries on the heading's column; the tall map sits in
        // the space beside it. Stacked: heading, map, then the principles.
        <div className="grid gap-8 wide:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] wide:grid-rows-[auto_1fr] wide:gap-x-[clamp(24px,5vw,72px)] wide:gap-y-7">
          <div className="wide:col-start-1 wide:row-start-1">{head}</div>
          <div className="mx-auto w-full max-w-[400px] wide:col-start-2 wide:row-span-2 wide:row-start-1 wide:self-start">
            {figure}
          </div>
          {list([0, 1, 2, 3], "wide:col-start-1 wide:row-start-2")}
        </div>
      ) : null}
      {draft.direction === "b" ? (
        // B: the drawing under the leak test's figure, the copy in the steps'
        // column. Stacked: heading, drawing, then the principles.
        <div className="grid gap-8 wide:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] wide:grid-rows-[auto_1fr] wide:gap-x-[clamp(24px,5vw,72px)] wide:gap-y-7">
          <div className="wide:col-start-2 wide:row-start-1">{head}</div>
          <div className="mx-auto w-full max-w-[460px] wide:col-start-1 wide:row-span-2 wide:row-start-1 wide:self-center">
            {figure}
          </div>
          {list([0, 1, 2, 3], "wide:col-start-2 wide:row-start-2")}
        </div>
      ) : null}
      {draft.direction === "c" ? (
        // C: the rings centred, two principles either side of them (from
        // xl; on smaller laptops and tablets, the rings beside all four).
        <div className="grid gap-8">
          {head}
          <div className="grid gap-[22px] wide:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] wide:gap-x-[clamp(24px,4vw,56px)] xl:grid-cols-[minmax(0,1fr)_minmax(0,440px)_minmax(0,1fr)] xl:items-center">
            <div className="mx-auto mb-[10px] w-full max-w-[460px] wide:row-span-2 wide:mb-0 wide:self-center xl:col-start-2 xl:row-span-1 xl:row-start-1">
              {figure}
            </div>
            {list(
              [0, 1],
              "wide:col-start-2 wide:self-end xl:col-start-1 xl:row-start-1 xl:self-center",
            )}
            {list(
              [2, 3],
              "wide:col-start-2 wide:self-start xl:col-start-3 xl:row-start-1 xl:self-center",
            )}
          </div>
        </div>
      ) : null}
    </section>
  );
}
