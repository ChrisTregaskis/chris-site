import { useCallback, useEffect, useMemo, useState } from "react";
import { readRememberedFlag, writeRememberedFlag } from "@/lib/rememberedFlag";

export interface RememberedFlag {
  /** True when the flag was already stored from an earlier visit, until `dismiss` sets it aside. */
  remembered: boolean;
  /** Stores the flag for next time. Doesn't change `remembered` on this visit. */
  remember: () => void;
  /**
   * Sets `remembered` aside for this visit only. The stored flag stays, so the
   * next visit is still remembered; only a new `remember` replaces it.
   */
  dismiss: () => void;
}

/**
 * A `localStorage` flag remembering that the visitor already did something
 * (see `@/lib/rememberedFlag`: a timestamp, no personal data, every storage
 * call guarded). Read after mount, so render never touches storage.
 */
export function useRememberedFlag(key: string): RememberedFlag {
  const [remembered, setRemembered] = useState(false);

  useEffect(() => {
    setRemembered(readRememberedFlag(key));
  }, [key]);

  const remember = useCallback(() => writeRememberedFlag(key), [key]);
  const dismiss = useCallback(() => setRemembered(false), []);

  return useMemo(
    () => ({ remembered, remember, dismiss }),
    [remembered, remember, dismiss],
  );
}
