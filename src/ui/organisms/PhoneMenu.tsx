import { type ReactNode, useId } from "react";
import { type NavMenuItem, NavMenuLinks } from "./NavMenuLinks";
import { usePhoneMenu } from "./usePhoneMenu";
import { Button } from "@/ui/atoms/Button";
import { Container } from "@/ui/atoms/Container";
import {
  TOP_NAV_BAR_CLASSES,
  TOP_NAV_NAME_CLASSES,
} from "@/ui/molecules/topNavClasses";

export interface PhoneMenuLink {
  href: string;
  label: string;
}

export interface PhoneMenuProps {
  /** The name at the bar's left, repeated on the menu's own bar. */
  name: string;
  homeHref: string;
  /** The numbered entries (the case studies), as in the Work menu. */
  items: NavMenuItem[];
  /** Named over the numbered entries. */
  itemsLabel?: string;
  /** Plain links after them (About, Contact). */
  links: PhoneMenuLink[];
  /**
   * Under the links: the calls to action (Get in touch, Request my CV), in
   * the link style; the menu's only buttons are its own. Choosing one closes
   * the menu, focus back on Menu, before it opens whatever it opens.
   */
  actions?: ReactNode;
}

// The b3 bar's compact ghost button (as Get in touch was), stretched to a
// 44px target without moving its text off the bar's right edge.
const TOGGLE_CLASSES = "-mr-2 min-h-[44px] px-2 text-accent";

/**
 * The top bar's menu below `wide`: a Menu button that opens the page's
 * navigation full screen, on the page's own surface, under a copy of the bar
 * whose Close sits where Menu was. The numbered case studies (as in the Work
 * menu), then the plain links, then the calls to action, all on one text edge
 * with the numerals hanging left of it. No boxes or rules. It fades in, its
 * links rising a little (none of it under reduced motion), and closes at once.
 */
export function PhoneMenu({
  name,
  homeHref,
  items,
  itemsLabel = "Work",
  links,
  actions,
}: PhoneMenuProps) {
  const dialogId = useId();
  const itemsLabelId = useId();
  const menu = usePhoneMenu();

  return (
    <>
      <Button
        ref={menu.buttonRef}
        variant="ghost"
        size="sm"
        aria-haspopup="dialog"
        aria-expanded={menu.open}
        aria-controls={dialogId}
        onClick={menu.openMenu}
        className={TOGGLE_CLASSES}
      >
        Menu
      </Button>
      {/* Clicks pick out a chosen link or button; Escape is the dialog's own cancel. */}
      <dialog
        ref={menu.dialogRef}
        id={dialogId}
        aria-label="Menu"
        onCancel={menu.onCancel}
        onClose={menu.onClose}
        onClick={menu.onClick}
        tabIndex={-1}
        className="fixed inset-0 m-0 h-full max-h-none w-full max-w-none animate-menu-in overflow-y-auto overscroll-contain border-0 bg-surface p-0 text-ink outline-none backdrop:bg-transparent motion-reduce:animate-none"
      >
        <Container>
          <div className={TOP_NAV_BAR_CLASSES}>
            <a href={homeHref} className={TOP_NAV_NAME_CLASSES}>
              {name}
            </a>
            <Button
              variant="ghost"
              size="sm"
              aria-label="Close menu"
              className={TOGGLE_CLASSES}
            >
              Close
            </Button>
          </div>
          <div className="animate-fade-up pb-12 pt-5 motion-reduce:animate-none">
            <nav aria-label="Primary">
              <p
                id={itemsLabelId}
                className="m-0 mb-2 pl-[44px] text-eyebrow uppercase text-muted"
              >
                {itemsLabel}
              </p>
              <NavMenuLinks items={items} labelledBy={itemsLabelId} roomy />
              <div className="mt-6">
                <NavMenuLinks items={links} roomy />
              </div>
            </nav>
            {actions ? (
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 pl-[44px]">
                {actions}
              </div>
            ) : null}
          </div>
        </Container>
      </dialog>
    </>
  );
}
