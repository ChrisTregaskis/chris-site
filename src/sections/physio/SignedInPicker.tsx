import { type FocusEvent } from "react";
import { type Org, ORG_TINT, ORGS } from "./organisations";
import { DEMO_PRESSED, PRESSABLE } from "./pressable";
import { cn } from "@/lib/cn";

interface SignedInPickerProps {
  /** Shown once a request has arrived. */
  shown: boolean;
  /** A picker (the leak test is open); otherwise just who is signed in. */
  live: boolean;
  who: Org;
  onPick: (org: Org) => void;
  /** The organisation the demo is pressing, if any. */
  pressing?: Org | null;
  focusProps?: {
    onFocus: (event: FocusEvent<HTMLElement>) => void;
    onBlur: (event: FocusEvent<HTMLElement>) => void;
  };
  className?: string;
}

/** Who's asking: shown once a request arrives, a picker once the leak test is open. */
export function SignedInPicker({
  shown,
  live,
  who,
  onPick,
  pressing = null,
  focusProps,
  className,
}: SignedInPickerProps) {
  return (
    <div
      {...focusProps}
      role={live ? "group" : undefined}
      aria-label={live ? "Signed in as" : undefined}
      className={cn(
        "flex min-h-[28px] flex-wrap items-baseline gap-x-5 gap-y-1 text-[15px] transition-opacity duration-slow motion-reduce:transition-none",
        shown ? "opacity-100" : "opacity-0",
        className,
      )}
    >
      <span className="text-muted">Signed in as</span>
      {ORGS.map((org) => {
        const chosen = org === who;
        const visible = live || chosen;
        return (
          <button
            key={org}
            type="button"
            disabled={!live}
            tabIndex={live ? 0 : -1}
            aria-pressed={live ? chosen : undefined}
            onClick={() => onPick(org)}
            className={cn(
              "flex items-center gap-2 border-0 border-b-2 border-transparent bg-transparent p-0 pb-[2px] font-medium text-muted hover:text-ink disabled:cursor-default",
              PRESSABLE,
              chosen && "text-ink",
              chosen && live && "border-current",
              visible ? "opacity-100" : "pointer-events-none opacity-0",
              pressing === org && cn(DEMO_PRESSED, "text-ink"),
            )}
          >
            <i
              aria-hidden="true"
              className={cn("size-[8px] rounded-pill", ORG_TINT[org].bg)}
            />
            {org}
          </button>
        );
      })}
    </div>
  );
}
