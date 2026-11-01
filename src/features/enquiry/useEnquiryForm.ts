import { useEnquiry } from "./EnquiryContext";
import {
  EMPTY_ENQUIRY_VALUES,
  ENQUIRY_FIELDS,
  validateEnquiryField,
} from "./enquiryFields";
import { sendEnquiry } from "./sendEnquiry";
import { useValidatedForm } from "@/hooks/useValidatedForm";

/**
 * The enquiry form: the shared drawer-form behaviour (`useValidatedForm`)
 * sending through `sendEnquiry`. Any failure, including an API error, keeps
 * the details and offers a retry, since an enquiry must never look sent when
 * it wasn't.
 */
export function useEnquiryForm() {
  const { status, setStatus } = useEnquiry();
  return useValidatedForm({
    fields: ENQUIRY_FIELDS,
    initialValues: EMPTY_ENQUIRY_VALUES,
    validateField: validateEnquiryField,
    status,
    setStatus,
    send: sendEnquiry,
    failureLabel: "Enquiry failed",
  });
}
