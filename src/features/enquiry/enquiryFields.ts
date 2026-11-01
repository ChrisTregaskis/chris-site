import {
  emailError,
  type FormErrors,
  type FormValues,
  requiredError,
} from "@/lib/formValidation";
import { type SelectOption } from "@/ui/atoms/Select";

/** The enquiry form's fields, in the order they appear (and are focused when invalid). */
export const ENQUIRY_FIELDS = ["name", "email", "help", "message"] as const;

export type EnquiryField = (typeof ENQUIRY_FIELDS)[number];
export type EnquiryValues = FormValues<EnquiryField>;
export type EnquiryErrors = FormErrors<EnquiryField>;

export const EMPTY_ENQUIRY_VALUES: EnquiryValues = {
  name: "",
  email: "",
  help: "",
  message: "",
};

/** The optional "What kind of help" choices; the value is what Chris's inbox shows. */
export const HELP_OPTIONS: readonly SelectOption[] = [
  { value: "existing-system", label: "Improving an existing system" },
  { value: "ai", label: "Adding AI to what we have" },
  { value: "prototype", label: "A prototype or proof of concept" },
  { value: "not-sure", label: "Not sure yet" },
];

/** The message for one field's value, or "" when it is fine. "What kind of help" is optional. */
export function validateEnquiryField(
  field: EnquiryField,
  value: string,
): string {
  if (field === "name") return requiredError(value, "Enter your name");
  if (field === "email") return emailError(value);
  if (field === "message") {
    return requiredError(value, "Tell me a little about what you need");
  }
  return "";
}
