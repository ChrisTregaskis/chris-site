import { type ReactNode, type Ref } from "react";
import { DRAWER_TITLE_CLASSES } from "./drawerTitleClasses";

interface DrawerDoneProps {
  /** Takes focus when the form lands here. */
  doneRef: Ref<HTMLDivElement>;
  /** Id for the heading, which names the drawer while this shows. */
  titleId: string;
  title: string;
  children: ReactNode;
  /** The view's buttons. */
  actions: ReactNode;
}

/** A drawer form's done view: the signal tick, a heading, a line and its actions. Focusable, so focus can land on it, and the drawer focuses it when it opens on it. */
export function DrawerDone({
  doneRef,
  titleId,
  title,
  children,
  actions,
}: DrawerDoneProps) {
  return (
    <div
      ref={doneRef}
      tabIndex={-1}
      data-drawer-focus=""
      aria-labelledby={titleId}
      className="flex flex-col gap-[18px] focus:outline-none"
    >
      <span
        aria-hidden="true"
        className="grid size-16 place-items-center rounded-pill bg-signal text-on-accent"
      >
        <svg viewBox="0 0 24 24" className="size-[30px]">
          <path
            d="M5 12.5l4.5 4.5L19 7.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <h2 id={titleId} className={DRAWER_TITLE_CLASSES}>
        {title}
      </h2>
      <p className="m-0 text-[16px] text-muted">{children}</p>
      <div className="flex flex-wrap gap-3">{actions}</div>
    </div>
  );
}
