import {
  type MouseEvent,
  type SyntheticEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

/**
 * Behaviour of the phone menu: a button that opens a full-screen modal
 * `<dialog>` of the page's links. Native and modal, so the page behind is
 * inert (Tab and the screen reader stay in the menu) and doesn't scroll (the
 * `html:has(dialog[open])` rule). Opening focuses the first link. Every way
 * it closes (its Close button, Escape, choosing a link or the call to action)
 * hands focus back to the button; it also closes if the window grows until
 * the button is hidden (the desktop bar takes over).
 */
export function usePhoneMenu() {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const openMenu = () => {
    const dialog = dialogRef.current;
    if (!dialog || dialog.open) return;
    dialog.showModal();
    setOpen(true);
    dialog
      .querySelector<HTMLElement>("nav a[href]")
      ?.focus({ preventScroll: true });
  };

  // Focus goes back at once, before anything the click opens (the enquiry
  // drawer) notes where to return to.
  const close = useCallback(() => {
    const dialog = dialogRef.current;
    if (!dialog?.open) return;
    dialog.close();
    setOpen(false);
    buttonRef.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    if (!open) return;
    const onResize = () => {
      const button = buttonRef.current;
      if (button && button.getClientRects().length === 0) close();
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [open, close]);

  // Escape: closed our way, so focus goes back to the button.
  const onCancel = (event: SyntheticEvent<HTMLDialogElement>) => {
    event.preventDefault();
    close();
  };

  // However it was closed, the button says so.
  const onClose = () => setOpen(false);

  // Choosing anything in it (a link, the call to action, Close) closes it;
  // the page's anchor scroll takes a link from there.
  const onClick = (event: MouseEvent<HTMLDialogElement>) => {
    if (
      event.target instanceof Element &&
      event.target.closest("a[href], button")
    ) {
      close();
    }
  };

  return {
    open,
    buttonRef,
    dialogRef,
    openMenu,
    onCancel,
    onClose,
    onClick,
  };
}
