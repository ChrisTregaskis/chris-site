import { useState } from "react";
import { useCVRequest } from "./CVRequestContext";
import {
  CV_FIELDS,
  type CVValues,
  EMPTY_CV_VALUES,
  validateCVField,
} from "./cvValidation";
import { useValidatedForm } from "@/hooks/useValidatedForm";

/**
 * The CV request form: the shared drawer-form behaviour (`useValidatedForm`)
 * posting to `VITE_CHRIS_API/resume`. An API that answers with an error still
 * unlocks the CV (the request just didn't reach Chris); a request that never
 * arrives leaves the form filled in, ready to try again. A visitor who
 * unlocked it on an earlier visit lands on the unlocked view (`remembered`).
 */
export function useCVRequestForm() {
  const { status, setStatus, remembered } = useCVRequest();
  const [delivered, setDelivered] = useState(true);

  const send = async (values: CVValues) => {
    const response = await fetch(`${import.meta.env.VITE_CHRIS_API}/resume`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    setDelivered(response.ok);
  };

  const { fieldProps, submit, submitRef, doneRef } = useValidatedForm({
    fields: CV_FIELDS,
    initialValues: EMPTY_CV_VALUES,
    validateField: validateCVField,
    status,
    setStatus,
    send,
    failureLabel: "CV request failed",
  });

  return {
    status,
    remembered,
    delivered,
    fieldProps,
    submit,
    submitRef,
    doneRef,
  };
}
