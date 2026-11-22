import { useSyncExternalStore } from "react";
import { type DevSettings, type DevValues } from "./devSettings";

/** An experiment's settings, live. */
export function useDevSettings<T extends DevValues>(
  settings: DevSettings<T>,
): T {
  return useSyncExternalStore(settings.subscribe, settings.get, settings.get);
}
