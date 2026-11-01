import {
  type ChangeEvent,
  type FocusEvent,
  type FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { useCVRequest } from "./CVRequestContext";
import {
  type CVErrors,
  type CVField,
  type CVValues,
  EMPTY_CV_VALUES,
  firstInvalidField,
  validateCV,
  validateCVField,
} from "./cvValidation";

type FieldElement = HTMLInputElement | HTMLTextAreaElement;

function withError(
  errors: CVErrors,
  field: CVField,
  message: string,
): CVErrors {
  return { ...errors, [field]: message || undefined };
}

/**
 * State and behaviour of the CV request form: validation (on blur once
 * touched, live once a field is invalid, all at once on submit), the POST to
 * `VITE_CHRIS_API/resume`, and the outcome. An API that answers with an error
 * still unlocks the CV (the request just didn't reach Chris); a request that
 * never arrives leaves the form filled in, ready to try again.
 */
export function useCVRequestForm() {
  const { status, setStatus } = useCVRequest();
  const [values, setValues] = useState<CVValues>(EMPTY_CV_VALUES);
  const [errors, setErrors] = useState<CVErrors>({});
  const [tried, setTried] = useState(false);
  const [delivered, setDelivered] = useState(true);
  const fieldRefs = useRef<Partial<Record<CVField, FieldElement | null>>>({});
  const submitRef = useRef<HTMLButtonElement>(null);
  const doneRef = useRef<HTMLDivElement>(null);
  const sending = useRef(false);
  const sendingStatus = status === "loading";

  const fieldProps = (field: CVField) => ({
    name: field,
    value: values[field],
    error: errors[field],
    readOnly: sendingStatus,
    ref: (node: FieldElement | null) => {
      fieldRefs.current[field] = node;
    },
    onChange: (event: ChangeEvent<FieldElement>) => {
      const { value } = event.target;
      setValues((previous) => ({ ...previous, [field]: value }));
      if (errors[field]) {
        setErrors((previous) =>
          withError(previous, field, validateCVField(field, value)),
        );
      }
    },
    onBlur: (event: FocusEvent<FieldElement>) => {
      const { value } = event.target;
      if (tried || value) {
        setErrors((previous) =>
          withError(previous, field, validateCVField(field, value)),
        );
      }
    },
  });

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (sending.current) return;
    setTried(true);
    const nextErrors = validateCV(values);
    setErrors(nextErrors);
    const invalid = firstInvalidField(nextErrors);
    if (invalid) {
      fieldRefs.current[invalid]?.focus();
      return;
    }

    sending.current = true;
    setStatus("loading");
    try {
      const response = await fetch(`${import.meta.env.VITE_CHRIS_API}/resume`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      setDelivered(response.ok);
      setStatus("success");
    } catch (error) {
      console.error("CV request failed:", error);
      setStatus("error");
      submitRef.current?.focus();
    } finally {
      sending.current = false;
    }
  };

  // Move focus to the unlocked message when the request lands.
  useEffect(() => {
    if (status === "success") doneRef.current?.focus({ preventScroll: true });
  }, [status]);

  return {
    status,
    delivered,
    fieldProps,
    submit,
    submitRef,
    doneRef,
  };
}
