import { type ReactNode } from "react";

export interface LabelProps {
  htmlFor: string;
  children: ReactNode;
  optional?: boolean;
}

/** The b3 form label; `optional` appends a muted "(optional)". */
export function Label({ htmlFor, children, optional = false }: LabelProps) {
  return (
    <label
      htmlFor={htmlFor}
      className="text-label font-semibold leading-[normal]"
    >
      {children}
      {optional ? (
        <span className="font-normal text-muted"> (optional)</span>
      ) : null}
    </label>
  );
}
