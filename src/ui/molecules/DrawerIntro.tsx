import { type ReactNode } from "react";
import { DRAWER_TITLE_CLASSES } from "./drawerTitleClasses";

interface DrawerIntroProps {
  /** Id for the heading, which names the drawer. */
  titleId: string;
  title: string;
  children: ReactNode;
}

/** A drawer form's heading and the short paragraph under it. */
export function DrawerIntro({ titleId, title, children }: DrawerIntroProps) {
  return (
    <>
      <h2 id={titleId} className={DRAWER_TITLE_CLASSES}>
        {title}
      </h2>
      <p className="mb-[22px] mt-[10px] text-[16px] text-muted">{children}</p>
    </>
  );
}
