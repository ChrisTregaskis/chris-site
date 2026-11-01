import {
  emailError,
  type FormErrors,
  type FormValues,
  firstInvalid,
  requiredError,
  validateFields,
} from "@/lib/formValidation";

/** The CV request form's fields, in the order they appear (and are focused when invalid). */
export const CV_FIELDS = ["firstName", "lastName", "email", "message"] as const;

export type CVField = (typeof CV_FIELDS)[number];
export type CVValues = FormValues<CVField>;
export type CVErrors = FormErrors<CVField>;

export const EMPTY_CV_VALUES: CVValues = {
  firstName: "",
  lastName: "",
  email: "",
  message: "",
};

/** The message for one field's value, or "" when it is fine. Only first name and email are checked. */
export function validateCVField(field: CVField, value: string): string {
  if (field === "firstName") {
    return requiredError(value, "Enter your first name");
  }
  if (field === "email") return emailError(value);
  return "";
}

/** Every field's error; fields that pass are left out. */
export function validateCV(values: CVValues): CVErrors {
  return validateFields(CV_FIELDS, values, validateCVField);
}

/** The first invalid field in form order, to move focus to. */
export function firstInvalidField(errors: CVErrors): CVField | undefined {
  return firstInvalid(CV_FIELDS, errors);
}
