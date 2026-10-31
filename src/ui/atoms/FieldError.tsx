import { type ReactNode } from "react";

export interface FieldErrorProps {
  id: string;
  children?: ReactNode;
}

/** The b3 field error with its round "!" badge; nothing when empty. */
export function FieldError({ id, children }: FieldErrorProps) {
  if (children === undefined || children === null || children === "") {
    return null;
  }
  return (
    <p
      id={id}
      className="m-0 flex items-center gap-[6px] text-[13.5px] font-medium leading-[normal] text-danger-ink"
    >
      <span
        aria-hidden="true"
        className="inline-grid size-4 flex-none place-items-center rounded-pill bg-danger text-[11px] font-extrabold leading-none text-on-accent"
      >
        !
      </span>
      {children}
    </p>
  );
}
