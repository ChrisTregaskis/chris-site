import { forwardRef, type InputHTMLAttributes } from "react";
import { fieldClasses } from "./fieldClasses";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

/** A single-line field. Forwards its ref so a form can focus it. */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { invalid = false, className, ...rest },
  ref,
) {
  return (
    <input
      ref={ref}
      {...rest}
      aria-invalid={invalid || undefined}
      className={fieldClasses(invalid, className)}
    />
  );
});
