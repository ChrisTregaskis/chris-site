import {
  type ButtonHTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from "react";
import { type ButtonVariant, buttonClasses } from "./buttonClasses";
import { Spinner } from "./Spinner";
import { VisuallyHidden } from "./VisuallyHidden";
import { cn } from "@/lib/cn";

export interface ButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "type"
> {
  variant?: ButtonVariant;
  type?: "button" | "submit" | "reset";
  /**
   * Busy state: the button keeps its accessible name and focus, announces
   * busy and swallows clicks (aria-disabled, not disabled).
   */
  loading?: boolean;
  /** Visible text beside the spinner while loading, e.g. "Unlocking". */
  loadingText?: ReactNode;
  /** Toggle state (b3 "Try it"); a pressed primary turns signal. */
  pressed?: boolean;
}

export function Button({
  variant = "primary",
  type = "button",
  loading = false,
  loadingText,
  pressed,
  className,
  children,
  onClick,
  ...rest
}: ButtonProps) {
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (loading) {
      event.preventDefault();
      return;
    }
    onClick?.(event);
  };

  return (
    <button
      {...rest}
      type={type}
      onClick={handleClick}
      aria-busy={loading || undefined}
      aria-disabled={loading || rest["aria-disabled"]}
      aria-pressed={pressed}
      className={cn(buttonClasses(variant), className)}
    >
      {loading ? (
        <>
          <Spinner />
          {loadingText ? <span aria-hidden="true">{loadingText}</span> : null}
          <VisuallyHidden>{children}</VisuallyHidden>
        </>
      ) : (
        children
      )}
    </button>
  );
}
