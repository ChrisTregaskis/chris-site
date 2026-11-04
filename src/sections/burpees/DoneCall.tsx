import { DONE } from "./calls";
import { CALL_TYPE, LINE_TYPE } from "./countType";
import { cn } from "@/lib/cn";

interface DoneCallProps {
  done: boolean;
}

/**
 * "Done" and its line, in the row under the count: in flow below the
 * count's own box, so however wide the digits are drawn they never reach
 * it. Its room is kept all set long, so nothing moves when it eases in at
 * 100, and it eases out again below 100.
 */
export function DoneCall({ done }: DoneCallProps) {
  return (
    <div
      className={cn(
        "col-start-1 row-start-3 mt-[clamp(16px,3svh,40px)] transition-[opacity,transform,visibility] duration-slow ease-enter motion-reduce:transition-none",
        done
          ? "translate-y-0 opacity-100"
          : "invisible translate-y-3 opacity-0",
      )}
    >
      <p className={CALL_TYPE}>{DONE.call}</p>
      <p className={LINE_TYPE}>{DONE.line}</p>
    </div>
  );
}
