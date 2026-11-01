import {
  type MouseEvent,
  type ReactNode,
  type SyntheticEvent,
  useEffect,
  useRef,
} from "react";

export interface DrawerProps {
  open: boolean;
  /** Called when the visitor closes it: Escape, the backdrop, or a close control that calls it. */
  onClose: () => void;
  /** Id of the heading that names the drawer. */
  labelledBy: string;
  children: ReactNode;
}

/**
 * The b3 CV drawer: a modal side drawer from `sheet` up, a bottom sheet below
 * it. A native `<dialog>`, so focus is held inside and the page is inert while
 * it is open; focus goes back to whatever opened it. On open, focus goes to an
 * element inside marked `data-drawer-focus` if there is one.
 */
export function Drawer({ open, onClose, labelledBy, children }: DrawerProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      openerRef.current =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;
      dialog.showModal();
      // A view can ask for focus on open (the done view, so it is read first);
      // otherwise the browser's own choice stands.
      dialog
        .querySelector<HTMLElement>("[data-drawer-focus]")
        ?.focus({ preventScroll: true });
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  // Fires for Escape and for dialog.close(); either way the drawer is shut.
  const handleClose = () => {
    openerRef.current?.focus();
    openerRef.current = null;
    if (open) onClose();
  };

  const handleCancel = (event: SyntheticEvent<HTMLDialogElement>) => {
    event.preventDefault();
    onClose();
  };

  // A click on the dialog box itself (not its content) is the backdrop.
  const handleClick = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target === event.currentTarget) onClose();
  };

  return (
    // The click handler is the backdrop; keyboard users close with Escape.
    <dialog
      ref={dialogRef}
      aria-labelledby={labelledBy}
      onClose={handleClose}
      onCancel={handleCancel}
      onClick={handleClick}
      className="inset-x-0 bottom-0 top-auto m-0 h-auto max-h-[92dvh] w-full max-w-none animate-sheet-up overflow-auto overscroll-contain rounded-t-sheet border-0 border-t border-line bg-panel p-0 text-ink shadow-drawer backdrop:bg-scrim/[0.66] backdrop:backdrop-blur-[3px] motion-reduce:animate-none sheet:inset-y-0 sheet:left-auto sheet:right-0 sheet:h-dvh sheet:max-h-none sheet:w-[min(520px,100vw)] sheet:animate-drawer-in sheet:rounded-none sheet:border-l sheet:border-t-0"
    >
      {children}
    </dialog>
  );
}
