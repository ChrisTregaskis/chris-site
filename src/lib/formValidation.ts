/** A form's values, one string per field. */
export type FormValues<F extends string> = Record<F, string>;

/** A form's errors; fields that pass are left out. */
export type FormErrors<F extends string> = Partial<Record<F, string>>;

const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** The message for an email field, or "" when it is fine. */
export function emailError(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "Enter your email address";
  return EMAIL_SHAPE.test(trimmed)
    ? ""
    : "Enter an email address like name@example.com";
}

/** `message` when the value is blank (or only spaces), otherwise "". */
export function requiredError(value: string, message: string): string {
  return value.trim() ? "" : message;
}

/** Every field's error, in form order; fields that pass are left out. */
export function validateFields<F extends string>(
  fields: readonly F[],
  values: FormValues<F>,
  validateField: (field: F, value: string) => string,
): FormErrors<F> {
  const errors: FormErrors<F> = {};
  for (const field of fields) {
    const message = validateField(field, values[field]);
    if (message) errors[field] = message;
  }
  return errors;
}

/** The first invalid field in form order, to move focus to. */
export function firstInvalid<F extends string>(
  fields: readonly F[],
  errors: FormErrors<F>,
): F | undefined {
  return fields.find((field) => errors[field]);
}
