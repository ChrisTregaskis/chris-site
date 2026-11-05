import {
  type MouseEvent,
  type SyntheticEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { quietFocus } from "@/lib/quietFocus";

/** Focus `element`, with its ring only if the keyboard moved it. */
function focusFor(element: HTMLElement | null, keyboard: boolean): void {
  if (!element) return;
  if (keyboard) element.focus({ preventScroll: true });
  else quietFocus(element);
}

/**
 * A click the keyboard made (Enter or Space on a button or link) has no
 * pointer presses, so its `detail` is 0.
 */
const fromKeyboard = (event: MouseEvent) => event.detail === 0;

/**
 * Behaviour of the phone menu: a button that opens a full-screen modal
 * `<dialog>` of the page's links. Native and modal, so the page behind is
 * inert (Tab and the screen reader stay in the menu) and doesn't scroll (the
 * `html:has(dialog[open])` rule). Opening focuses the first link from the
 * keyboard, or the menu itself after a tap or click. Every way
 * it closes (its Close button, Escape, choosing a link or a call to action)
 * hands focus back to the button; it also closes if the window grows until
 * the button is hidden (the desktop bar takes over). Focus moved after a tap
 * or click shows no ring (`quietFocus`); after the keyboard, it does.
 */
export function usePhoneMenu() {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const openMenu = (event: MouseEvent<HTMLButtonElement>) => {
    const dialog = dialogRef.current;
    if (!dialog || dialog.open) return;
    dialog.showModal();
    setOpen(true);
    // From the keyboard, focus lands on the first link, ringed. After a tap
    // or click it lands on the menu itself, so no link looks chosen (and no
    // ring shows); Tab goes on from its top.
    if (fromKeyboard(event)) {
      dialog
        .querySelector<HTMLElement>("nav a[href]")
        ?.focus({ preventScroll: true });
    } else {
      quietFocus(dialog);
    }
  };

  // Focus goes back at once, before anything the click opens (the enquiry
  // or CV drawer) notes where to return to.
  const close = useCallback((keyboard: boolean) => {
    const dialog = dialogRef.current;
    if (!dialog?.open) return;
    dialog.close();
    setOpen(false);
    focusFor(buttonRef.current, keyboard);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onResize = () => {
      const button = buttonRef.current;
      if (button && button.getClientRects().length === 0) close(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [open, close]);

  // Escape: closed our way, so focus goes back to the button.
  const onCancel = (event: SyntheticEvent<HTMLDialogElement>) => {
    event.preventDefault();
    close(true);
  };

  // However it was closed, the button says so.
  const onClose = () => setOpen(false);

  // Choosing anything in it (a link, a call to action, Close) closes it;
  // the page's anchor scroll takes a link from there.
  const onClick = (event: MouseEvent<HTMLDialogElement>) => {
    if (
      event.target instanceof Element &&
      event.target.closest("a[href], button")
    ) {
      close(fromKeyboard(event));
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
