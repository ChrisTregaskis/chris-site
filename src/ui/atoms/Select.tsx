import { forwardRef, type SelectHTMLAttributes } from "react";
import { fieldClasses } from "./fieldClasses";
import { cn } from "@/lib/cn";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: readonly SelectOption[];
  /** A first, empty choice (value ""), e.g. "Choose one". */
  placeholder?: string;
  invalid?: boolean;
}

/**
 * A native select in the field look, with a chevron in place of the browser's
 * arrow. Native, so phones show their own picker. Forwards its ref so a form
 * can focus it.
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  function Select(
    { options, placeholder, invalid = false, className, ...rest },
    ref,
  ) {
    return (
      <div className="relative">
        <select
          ref={ref}
          {...rest}
          aria-invalid={invalid || undefined}
          className={fieldClasses(
            invalid,
            cn(
              "cursor-pointer appearance-none pr-10 [color-scheme:dark]",
              className,
            ),
          )}
        >
          {placeholder === undefined ? null : (
            <option value="">{placeholder}</option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <svg
          viewBox="0 0 20 20"
          aria-hidden="true"
          className="pointer-events-none absolute right-[14px] top-1/2 size-4 -translate-y-1/2 text-muted"
        >
          <path
            d="M5 7.5l5 5 5-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    );
  },
);
