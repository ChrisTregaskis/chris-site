import { type AnchorHTMLAttributes } from "react";
import { VisuallyHidden } from "./VisuallyHidden";
import { cn } from "@/lib/cn";

export interface TextLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  /** Opens in a new tab, safely, and says so to assistive tech. */
  external?: boolean;
}

export function TextLink({
  external = false,
  className,
  children,
  ...rest
}: TextLinkProps) {
  return (
    <a
      {...rest}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={cn(
        "text-ink underline decoration-line underline-offset-[3px] transition-colors duration-base hover:decoration-accent motion-reduce:transition-none focus-visible:rounded-badge focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-signal",
        className,
      )}
    >
      {children}
      {external ? <VisuallyHidden> (opens in a new tab)</VisuallyHidden> : null}
    </a>
  );
}
