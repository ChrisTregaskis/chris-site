import { motion } from "framer-motion";
import { useLayoutEffect, useRef, useState } from "react";
import { type LeakView } from "./leakTest";
import { ORG_TINT } from "./organisations";
import { cn } from "@/lib/cn";
import { DURATION } from "@/ui/tokens/motion";

export type QuerySize = "large" | "medium" | "compact";

/**
 * The type per size, in px, and the room the block keeps: three query
 * lines, plus the line under them at its longest (one line large and
 * medium, two compact). Medium is the large one a size down, over a 3D
 * stack shrunk to fit; wide is the compact figure beside the steps.
 */
export const QUERY_TYPE = {
  large: { query: 28, line: 15, lineLeading: 1.5, lines: 1, block: 132 },
  medium: { query: 24, line: 15, lineLeading: 1.5, lines: 1, block: 118 },
  compact: { query: 16, line: 14, lineLeading: 1.4, lines: 2, block: 104 },
  compactWide: { query: 22, line: 15, lineLeading: 1.5, lines: 2, block: 132 },
} as const;

/** The query's line height, and the gap above the line under it. */
export const QUERY_LEADING = 1.25;
export const LINE_GAP = 4;

/**
 * The same as classes (static, for Tailwind). Each line height comes after
 * its font size: `cn` drops a line height set before one.
 */
export const SIZES: Record<
  QuerySize,
  { block: string; query: string; line: string }
> = {
  large: {
    block: "min-h-[132px]",
    query: "text-[28px] leading-[1.25]",
    line: "text-[15px] leading-[1.5]",
  },
  medium: {
    block: "min-h-[118px]",
    query: "text-[24px] leading-[1.25]",
    line: "text-[15px] leading-[1.5]",
  },
  compact: {
    block: "min-h-[104px] wide:min-h-[132px]",
    query: "text-[16px] leading-[1.25] wide:text-[22px] wide:leading-[1.25]",
    line: "text-[14px] leading-[1.4] wide:text-[15px] wide:leading-[1.5]",
  },
};

/** How the query's parts move: transform, opacity and clip only, so nothing on the page reflows. */
const MOVE =
  "transition-[transform,opacity,clip-path] duration-slow ease-lift motion-reduce:transition-none";

interface QueryLinesProps {
  view: LeakView;
  size: QuerySize;
  still: boolean;
}

/**
 * The transaction and its query, set as type (at rest, just the table's
 * name), then what comes back in one plain line. The line is drawn here;
 * its spoken twin lives with the figure.
 *
 * Every line keeps its place in the layout in every state, and what comes
 * and goes moves by transform, opacity and clip alone (growing it in by
 * its grid tracks counted as a layout shift each time it played): at rest
 * the table's name slides back over `select * from` (by its measured
 * width), the leak test's filter wipes in, and the line under the query
 * rides up a line while there's no filter.
 */
export function QueryLines({ view, size, still }: QueryLinesProps) {
  const { asked, asking, who, target } = view;
  const type = SIZES[size];
  const prefixRef = useRef<HTMLSpanElement>(null);
  const [prefix, setPrefix] = useState(0);

  useLayoutEffect(() => {
    const element = prefixRef.current;
    if (!element) return undefined;
    const measure = () => setPrefix(element.offsetWidth);
    measure();
    if (typeof ResizeObserver === "undefined") return undefined;
    // Its width changes when the webfont arrives and when the type size does.
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div data-testid="query" className={type.block}>
      <div
        className={cn(
          "font-display font-medium tracking-[-0.02em]",
          type.query,
        )}
      >
        <p
          className={cn(
            "m-0 whitespace-nowrap transition-opacity duration-slow motion-reduce:transition-none",
            asked ? "opacity-100" : "opacity-0",
          )}
          aria-hidden={!asked}
        >
          <span className="text-muted">set local</span> organisation ={" "}
          <span className={ORG_TINT[who].text}>&lsquo;{who}&rsquo;</span>
        </p>
        <p className="m-0 whitespace-nowrap">
          <span
            ref={prefixRef}
            data-testid="query-select"
            aria-hidden={!asked}
            className={cn(
              "inline-block",
              MOVE,
              asked ? "opacity-100" : "opacity-0",
            )}
          >
            <span className="text-muted">select</span> *{" "}
            <span className="text-muted">from</span>&nbsp;
          </span>
          <span
            className={cn("inline-block", MOVE)}
            style={{ transform: asked ? "none" : `translateX(-${prefix}px)` }}
          >
            sessions
          </span>
        </p>
        <p
          className={cn("m-0 whitespace-nowrap", MOVE)}
          aria-hidden={!asking}
          data-testid="query-filter"
          style={{
            opacity: asking ? 1 : 0,
            clipPath: asking ? "inset(0 0 0 0)" : "inset(0 100% 0 0)",
          }}
        >
          <span className="text-muted">where</span> organisation_id ={" "}
          <span className={ORG_TINT[target].text}>&lsquo;{target}&rsquo;</span>
        </p>
        {/* In the query's type, so a line up is one query line (1lh). */}
        <div
          className={MOVE}
          style={{ transform: asking ? "none" : "translateY(-1lh)" }}
        >
          <p
            aria-hidden="true"
            data-testid="query-outcome"
            className={cn(
              "m-0 mt-1 font-body font-normal tracking-normal text-ink",
              type.line,
            )}
          >
            <motion.span
              key={view.line}
              className="block"
              initial={still ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: DURATION.slow }}
            >
              {view.line}
            </motion.span>
          </p>
        </div>
      </div>
    </div>
  );
}
