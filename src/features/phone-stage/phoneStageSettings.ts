import { PHONE_STAGE_LIVE, type PhoneStageSettings } from "./phoneStage";
import { defineDevSettings, useDevSettings } from "@/features/dev-panel";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { BELOW_WIDE, BREAKPOINT } from "@/ui/tokens/breakpoints";

/** Under `pnpm dev`, says when the switch can't show anything at this width. */
function usePhoneStageNote(): string | null {
  const stacked = useMediaQuery(BELOW_WIDE);
  return stacked
    ? null
    : `Shows only when stacked: below ${BREAKPOINT.wide}px wide.`;
}

/**
 * The phone stage: PHONE_STAGE_LIVE in production; under `pnpm dev`,
 * `compact` unless the dev panel's Work group or `?phoneStage=current`
 * says otherwise.
 */
export const phoneStageSettings = defineDevSettings<PhoneStageSettings>(
  { phoneStage: import.meta.env.DEV ? "compact" : PHONE_STAGE_LIVE },
  import.meta.env.DEV
    ? {
        title: "Work",
        controls: [
          {
            kind: "choice",
            key: "phoneStage",
            label: "Phone stage",
            options: [
              { value: "compact", label: "Compact" },
              { value: "current", label: "Current" },
            ],
          },
        ],
        useNote: usePhoneStageNote,
      }
    : null,
);

/**
 * Whether a diagram chapter pins its compact stage: the setting is
 * `compact` and the chapter is stacked (below `wide`). False until mounted,
 * as `useMediaQuery` is.
 */
export function useCompactStage(): boolean {
  const { phoneStage } = useDevSettings(phoneStageSettings);
  const stacked = useMediaQuery(BELOW_WIDE);
  return phoneStage === "compact" && stacked;
}
