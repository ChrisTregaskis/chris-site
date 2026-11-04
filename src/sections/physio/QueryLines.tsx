import { motion } from "framer-motion";
import { type LeakView } from "./leakTest";
import { ORG_TINT } from "./organisations";
import { cn } from "@/lib/cn";
import { DURATION } from "@/ui/tokens/motion";

export type QuerySize = "large" | "compact";

/**
 * The type per size, in px, and the room the block keeps so nothing below it
 * moves when the leak test's filter grows in: three query lines, plus the
 * line under them at its longest (one line large, two compact). Wide is the
 * compact figure beside the steps.
 */
export const QUERY_TYPE = {
  large: { query: 28, line: 15, lineLeading: 1.5, lines: 1, block: 132 },
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
  compact: {
    block: "min-h-[104px] wide:min-h-[132px]",
    query: "text-[16px] leading-[1.25] wide:text-[22px] wide:leading-[1.25]",
    line: "text-[14px] leading-[1.4] wide:text-[15px] wide:leading-[1.5]",
  },
};

interface QueryLinesProps {
  view: LeakView;
  size: QuerySize;
  still: boolean;
}

/**
 * The transaction and its query, set as type (at rest, just the table's
 * name), then what comes back in one plain line. The line is drawn here;
 * its spoken twin lives with the figure.
 */
export function QueryLines({ view, size, still }: QueryLinesProps) {
  const { asked, asking, who, target } = view;
  const type = SIZES[size];
  return (
    <div className={type.block}>
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
          {/* The query grows in front of the table's name (0fr to 1fr). */}
          <span
            data-testid="query-select"
            aria-hidden={!asked}
            className={cn(
              "inline-grid transition-[grid-template-columns,opacity] duration-slow ease-lift motion-reduce:transition-none",
              asked
                ? "grid-cols-[1fr] opacity-100"
                : "grid-cols-[0fr] opacity-0",
            )}
          >
            <span className="overflow-hidden">
              <span className="text-muted">select</span> *{" "}
              <span className="text-muted">from</span>&nbsp;
            </span>
          </span>
          sessions
        </p>
        {/* The leak test's filter: grows in under the query (0fr to 1fr). */}
        <div
          className={cn(
            "grid transition-[grid-template-rows,opacity] duration-slow ease-lift motion-reduce:transition-none",
            asking
              ? "grid-rows-[1fr] opacity-100"
              : "grid-rows-[0fr] opacity-0",
          )}
        >
          <p
            className="m-0 overflow-hidden whitespace-nowrap"
            aria-hidden={!asking}
            data-testid="query-filter"
          >
            <span className="text-muted">where</span> organisation_id ={" "}
            <span className={ORG_TINT[target].text}>
              &lsquo;{target}&rsquo;
            </span>
          </p>
        </div>
      </div>
      <p
        aria-hidden="true"
        data-testid="query-outcome"
        className={cn("m-0 mt-1 text-ink", type.line)}
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
  );
}
