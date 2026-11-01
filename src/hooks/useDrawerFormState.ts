import {
  type Dispatch,
  type SetStateAction,
  useCallback,
  useMemo,
  useState,
} from "react";
import { type ApiStatus } from "@/lib/api";

export interface DrawerFormState {
  /** The form's request: idle, sending, done, or failed to reach the server. */
  status: ApiStatus;
  setStatus: Dispatch<SetStateAction<ApiStatus>>;
  /** Whether the form's drawer is open. */
  drawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
}

/**
 * A drawer form's app-wide state (its request status and whether its drawer
 * is open), memoised for a provider value. Status outlives the drawer, so
 * reopening after a send shows the done view.
 */
export function useDrawerFormState(): DrawerFormState {
  const [status, setStatus] = useState<ApiStatus>("idle");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  return useMemo(
    () => ({ status, setStatus, drawerOpen, openDrawer, closeDrawer }),
    [status, drawerOpen, openDrawer, closeDrawer],
  );
}
