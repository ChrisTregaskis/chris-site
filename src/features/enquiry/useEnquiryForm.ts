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
 * it wasn't. A visitor who sent one on an earlier visit lands on the sent
 * view (`remembered`), and `sendAnother` takes them back to an empty form for
 * this visit only: the stored flag stays until a new send replaces it.
 */
export function useEnquiryForm() {
  const { status, setStatus, remembered, dismissRemembered } = useEnquiry();
  const form = useValidatedForm({
    fields: ENQUIRY_FIELDS,
    initialValues: EMPTY_ENQUIRY_VALUES,
    validateField: validateEnquiryField,
    status,
    setStatus,
    send: sendEnquiry,
    failureLabel: "Enquiry failed",
  });

  const sendAnother = () => {
    dismissRemembered();
    form.reset();
  };

  return { ...form, remembered, sendAnother };
}
