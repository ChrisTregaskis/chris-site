import { type EnquiryValues } from "./enquiryFields";

/**
 * Where enquiries go, under `VITE_CHRIS_API`. **Not built yet**: the API only
 * has `/resume` today, so until Chris adds this route every send fails and the
 * form offers LinkedIn instead. The proposed route is in the 3c handover.
 */
export const ENQUIRY_PATH = "/enquiry";

/** What the API receives: trimmed, with `help` left out when not chosen. */
export interface EnquiryPayload {
  name: string;
  email: string;
  message: string;
  help?: string;
}

export function enquiryPayload(values: EnquiryValues): EnquiryPayload {
  const help = values.help.trim();
  return {
    name: values.name.trim(),
    email: values.email.trim(),
    message: values.message.trim(),
    ...(help ? { help } : {}),
  };
}

/**
 * Sends an enquiry to Chris. Resolves once the API has accepted it; throws if
 * it can't be reached or answers with an error, because an enquiry that
 * didn't arrive must never look sent.
 */
export async function sendEnquiry(values: EnquiryValues): Promise<void> {
  const response = await fetch(
    `${import.meta.env.VITE_CHRIS_API}${ENQUIRY_PATH}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(enquiryPayload(values)),
    },
  );
  if (!response.ok) {
    throw new Error(`The enquiry API answered ${response.status}`);
  }
}
