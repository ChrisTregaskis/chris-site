import { PHONE_STAGE_LIVE, type PhoneStageSettings } from "./phoneStage";
import { defineDevSettings, useDevSettings } from "@/features/dev-panel";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { BELOW_WIDE } from "@/ui/tokens/breakpoints";

/**
 * The phone stage: PHONE_STAGE_LIVE, settled and no longer in the dev panel.
 * Still a settings store, so tests can choose `current`.
 */
export const phoneStageSettings = defineDevSettings<PhoneStageSettings>(
  { phoneStage: PHONE_STAGE_LIVE },
  null,
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
