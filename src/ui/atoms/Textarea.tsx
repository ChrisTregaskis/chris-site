import { forwardRef, type TextareaHTMLAttributes } from "react";
import { fieldClasses } from "./fieldClasses";
import { cn } from "@/lib/cn";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

/** A multi-line field. Forwards its ref so a form can focus it. */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ invalid = false, className, ...rest }, ref) {
    return (
      <textarea
        ref={ref}
        {...rest}
        aria-invalid={invalid || undefined}
        className={fieldClasses(
          invalid,
          cn("min-h-[96px] resize-y", className),
        )}
      />
    );
  },
);
