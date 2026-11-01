import {
  type Dispatch,
  type SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRememberedFlag } from "./useRememberedFlag";
import { type ApiStatus } from "@/lib/api";

export interface DrawerFormState {
  /**
   * The form's request: idle, sending, done, or failed to reach the server.
   * "success" too when an earlier visit finished the form (see `remembered`).
   */
  status: ApiStatus;
  setStatus: Dispatch<SetStateAction<ApiStatus>>;
  /** True while showing the done view because an earlier visit finished the form, not this one. */
  remembered: boolean;
  /**
   * Sets aside what an earlier visit left, so the form shows again on this
   * visit. The stored flag stays until a new send replaces it.
   */
  dismissRemembered: () => void;
  /** Whether the form's drawer is open. */
  drawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
}

/**
 * A drawer form's app-wide state (its request status and whether its drawer
 * is open), memoised for a provider value. Status outlives the drawer, so
 * reopening after a send shows the done view; a send that lands is also
 * remembered under `rememberKey` (see `useRememberedFlag`), so a later visit
 * opens on the done view too.
 */
export function useDrawerFormState(rememberKey: string): DrawerFormState {
  const [sendStatus, setStatus] = useState<ApiStatus>("idle");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const {
    remembered: storedFlag,
    remember,
    dismiss: dismissRemembered,
  } = useRememberedFlag(rememberKey);
  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  // Only a send that lands in this visit sets the flag.
  useEffect(() => {
    if (sendStatus === "success") remember();
  }, [sendStatus, remember]);

  const remembered = storedFlag && sendStatus === "idle";
  const status = remembered ? "success" : sendStatus;

  return useMemo(
    () => ({
      status,
      setStatus,
      remembered,
      dismissRemembered,
      drawerOpen,
      openDrawer,
      closeDrawer,
    }),
    [
      status,
      remembered,
      dismissRemembered,
      drawerOpen,
      openDrawer,
      closeDrawer,
    ],
  );
}
