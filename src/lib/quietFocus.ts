/** Marks an element focused by script after a tap or click; styles drop its ring. */
export const QUIET_FOCUS_ATTRIBUTE = "data-quiet-focus";

/**
 * Focus `element` without painting a focus ring, for focus moved by script
 * after a tap or click (iOS Safari would otherwise ring it). It asks the
 * browser not to show one (`focusVisible: false`, where supported) and marks
 * the element so the page's styles hide the ring everywhere else. The mark
 * clears on the element's next key press or when focus leaves it, so a
 * keyboard user sees the ring again at once.
 */
export function quietFocus(element: HTMLElement): void {
  element.setAttribute(QUIET_FOCUS_ATTRIBUTE, "");
  const clear = () => {
    element.removeAttribute(QUIET_FOCUS_ATTRIBUTE);
    element.removeEventListener("keydown", clear);
    element.removeEventListener("blur", clear);
  };
  element.addEventListener("keydown", clear);
  element.addEventListener("blur", clear);
  const options: FocusOptions & { focusVisible?: boolean } = {
    preventScroll: true,
    focusVisible: false,
  };
  element.focus(options);
}
