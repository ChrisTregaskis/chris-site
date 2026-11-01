import { useCallback, useEffect, useMemo, useState } from "react";
import {
  clearRememberedFlag,
  readRememberedFlag,
  writeRememberedFlag,
} from "@/lib/rememberedFlag";

export interface RememberedFlag {
  /** True when the flag was already stored from an earlier visit, until `forget` clears it. */
  remembered: boolean;
  /** Stores the flag for next time. Doesn't change `remembered` on this visit. */
  remember: () => void;
  /** Clears the stored flag and `remembered`. */
  forget: () => void;
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
  const forget = useCallback(() => {
    clearRememberedFlag(key);
    setRemembered(false);
  }, [key]);

  return useMemo(
    () => ({ remembered, remember, forget }),
    [remembered, remember, forget],
  );
}
