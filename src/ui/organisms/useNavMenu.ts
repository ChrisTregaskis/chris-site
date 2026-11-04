import {
  type FocusEvent,
  type KeyboardEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

/**
 * Behaviour of a disclosure that shows a list of links (the top bar's Work
 * menu): the button toggles it; ArrowDown on the button opens it on the
 * first link; ArrowUp and ArrowDown (with Home and End) move between links,
 * as Tab does; Escape closes it and returns focus to the button; a click
 * outside, focus leaving it, or choosing a link closes it.
 */
export function useNavMenu() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const focusOnOpen = useRef<"first" | null>(null);

  const links = () => [
    ...(listRef.current?.querySelectorAll<HTMLAnchorElement>("a[href]") ?? []),
  ];

  const close = useCallback((refocus: boolean) => {
    setOpen(false);
    if (refocus) buttonRef.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    if (!open) return;
    if (focusOnOpen.current === "first") {
      links()[0]?.focus({ preventScroll: true });
      focusOnOpen.current = null;
    }
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) close(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open, close]);

  const onButtonClick = () => setOpen((wasOpen) => !wasOpen);

  const onButtonKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      focusOnOpen.current = "first";
      if (open) links()[0]?.focus({ preventScroll: true });
      else setOpen(true);
    }
  };

  const onRootKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!open) return;
    if (event.key === "Escape") {
      event.preventDefault();
      close(true);
      return;
    }
    const list = links();
    const index = list.indexOf(document.activeElement as HTMLAnchorElement);
    if (index < 0) return;
    const next = {
      ArrowDown: (index + 1) % list.length,
      ArrowUp: (index - 1 + list.length) % list.length,
      Home: 0,
      End: list.length - 1,
    }[event.key];
    if (next === undefined) return;
    event.preventDefault();
    list[next].focus({ preventScroll: true });
  };

  // Focus moving out of the menu (Tab past its last link) closes it.
  const onRootBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (
      open &&
      event.relatedTarget instanceof Node &&
      !rootRef.current?.contains(event.relatedTarget)
    ) {
      close(false);
    }
  };

  // Choosing a link closes the menu; the page's anchor scroll takes it from there.
  const onLinkClick = () => close(false);

  return {
    open,
    rootRef,
    buttonRef,
    listRef,
    onButtonClick,
    onButtonKeyDown,
    onRootKeyDown,
    onRootBlur,
    onLinkClick,
  };
}
