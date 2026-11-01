import { type AnchorHTMLAttributes } from "react";
import {
  type ButtonSize,
  type ButtonVariant,
  buttonClasses,
} from "./buttonClasses";
import { cn } from "@/lib/cn";

export interface ButtonLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  href: string;
}

/** A link that looks like a Button (b3 hero calls to action). */
export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  children,
  ...rest
}: ButtonLinkProps) {
  return (
    <a {...rest} className={cn(buttonClasses(variant, size), className)}>
      {children}
    </a>
  );
}
