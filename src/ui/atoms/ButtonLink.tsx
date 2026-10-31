import { type AnchorHTMLAttributes } from "react";
import { type ButtonVariant, buttonClasses } from "./buttonClasses";
import { cn } from "@/lib/cn";

export interface ButtonLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: ButtonVariant;
  href: string;
}

/** A link that looks like a Button (b3 hero calls to action). */
export function ButtonLink({
  variant = "primary",
  className,
  children,
  ...rest
}: ButtonLinkProps) {
  return (
    <a {...rest} className={cn(buttonClasses(variant), className)}>
      {children}
    </a>
  );
}
