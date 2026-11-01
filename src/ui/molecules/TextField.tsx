import { type ChangeEvent, type FocusEvent, forwardRef, useId } from "react";
import { FieldError } from "@/ui/atoms/FieldError";
import { Input } from "@/ui/atoms/Input";
import { Label } from "@/ui/atoms/Label";
import { Select, type SelectOption } from "@/ui/atoms/Select";
import { Textarea } from "@/ui/atoms/Textarea";

type FieldElement = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

export interface TextFieldProps {
  label: string;
  name: string;
  /** When set: the field is invalid and described by this message. */
  error?: string;
  optional?: boolean;
  /** Marks the field required for the browser and assistive tech. */
  required?: boolean;
  disabled?: boolean;
  /** Keeps the value visible but unchangeable, e.g. while a form is sending. */
  readOnly?: boolean;
  multiline?: boolean;
  /** Makes the field a native select of these choices. */
  options?: readonly SelectOption[];
  /** With `options`: the empty first choice. */
  placeholder?: string;
  type?: "text" | "email";
  inputMode?: "text" | "email";
  autoComplete?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (event: ChangeEvent<FieldElement>) => void;
  onBlur?: (event: FocusEvent<FieldElement>) => void;
}

/**
 * Label, field and error, wired for assistive tech: a single-line input, a
 * textarea (`multiline`) or a select (`options`). Controlled or not, as the
 * caller chooses; validation belongs to the form that uses it.
 */
export const TextField = forwardRef<FieldElement, TextFieldProps>(
  function TextField(
    {
      label,
      name,
      error,
      optional = false,
      multiline = false,
      options,
      placeholder,
      type = "text",
      readOnly,
      ...field
    },
    ref,
  ) {
    const fieldId = useId();
    // One callback ref serves every element type without a cast.
    const setRef = (node: FieldElement | null) => {
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    };
    const errorId = `${fieldId}-error`;
    const invalid = Boolean(error);
    const shared = {
      id: fieldId,
      name,
      invalid,
      "aria-describedby": invalid ? errorId : undefined,
      ...field,
    };

    let control;
    if (options) {
      // A select can't be read-only, so it is disabled for the same moment.
      const { disabled, ...rest } = shared;
      control = (
        <Select
          ref={setRef}
          options={options}
          placeholder={placeholder}
          disabled={disabled === true || readOnly === true}
          {...rest}
        />
      );
    } else if (multiline) {
      control = <Textarea ref={setRef} readOnly={readOnly} {...shared} />;
    } else {
      control = (
        <Input ref={setRef} type={type} readOnly={readOnly} {...shared} />
      );
    }

    return (
      <div className="flex min-w-0 flex-col gap-[6px]">
        <Label htmlFor={fieldId} optional={optional}>
          {label}
        </Label>
        {control}
        <FieldError id={errorId}>{error}</FieldError>
      </div>
    );
  },
);
