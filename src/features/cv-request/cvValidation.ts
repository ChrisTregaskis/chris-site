/** The CV request form's fields, in the order they appear (and are focused when invalid). */
export const CV_FIELDS = ["firstName", "lastName", "email", "message"] as const;

export type CVField = (typeof CV_FIELDS)[number];
export type CVValues = Record<CVField, string>;
export type CVErrors = Partial<Record<CVField, string>>;

export const EMPTY_CV_VALUES: CVValues = {
  firstName: "",
  lastName: "",
  email: "",
  message: "",
};

const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** The message for one field's value, or "" when it is fine. Only first name and email are checked. */
export function validateCVField(field: CVField, value: string): string {
  const trimmed = value.trim();
  if (field === "firstName") return trimmed ? "" : "Enter your first name";
  if (field === "email") {
    if (!trimmed) return "Enter your email address";
    return EMAIL_SHAPE.test(trimmed)
      ? ""
      : "Enter an email address like name@example.com";
  }
  return "";
}

/** Every field's error; fields that pass are left out. */
export function validateCV(values: CVValues): CVErrors {
  const errors: CVErrors = {};
  for (const field of CV_FIELDS) {
    const message = validateCVField(field, values[field]);
    if (message) errors[field] = message;
  }
  return errors;
}

/** The first invalid field in form order, to move focus to. */
export function firstInvalidField(errors: CVErrors): CVField | undefined {
  return CV_FIELDS.find((field) => errors[field]);
}
