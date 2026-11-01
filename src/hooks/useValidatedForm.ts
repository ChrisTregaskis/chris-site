import {
  type ChangeEvent,
  type Dispatch,
  type FocusEvent,
  type FormEvent,
  type SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import { type ApiStatus } from "@/lib/api";
import {
  type FormErrors,
  type FormValues,
  firstInvalid,
  validateFields,
} from "@/lib/formValidation";

export type FormFieldElement =
  | HTMLInputElement
  | HTMLTextAreaElement
  | HTMLSelectElement;

export interface ValidatedFormOptions<F extends string> {
  /** The fields in form order (the first invalid one takes focus on submit). */
  fields: readonly F[];
  initialValues: FormValues<F>;
  /** One field's message, or "" when it is fine. */
  validateField: (field: F, value: string) => string;
  /** The form's request status; held by the caller so it can outlive a drawer closing. */
  status: ApiStatus;
  setStatus: Dispatch<SetStateAction<ApiStatus>>;
  /** Sends the values: resolving finishes the form, throwing hands it back to try again. */
  send: (values: FormValues<F>) => Promise<void>;
  /** Names the failure in the console. */
  failureLabel: string;
}

/**
 * A drawer form's behaviour, shared by the CV request and the enquiry:
 * validation (on blur once touched, live once a field is invalid, all at once
 * on submit with focus on the first invalid field), one send at a time with
 * the fields read-only while it runs, focus on the done view when it lands,
 * and on failure the details kept and focus on Submit, ready to try again.
 */
export function useValidatedForm<F extends string>({
  fields,
  initialValues,
  validateField,
  status,
  setStatus,
  send,
  failureLabel,
}: ValidatedFormOptions<F>) {
  const [values, setValues] = useState<FormValues<F>>(initialValues);
  const [errors, setErrors] = useState<FormErrors<F>>({});
  const [tried, setTried] = useState(false);
  const fieldRefs = useRef<Partial<Record<F, FormFieldElement | null>>>({});
  const submitRef = useRef<HTMLButtonElement>(null);
  const doneRef = useRef<HTMLDivElement>(null);
  const sending = useRef(false);

  const check = (field: F, value: string) =>
    setErrors((previous) => ({
      ...previous,
      [field]: validateField(field, value) || undefined,
    }));

  const fieldProps = (field: F) => ({
    name: field,
    value: values[field],
    error: errors[field],
    readOnly: status === "loading",
    ref: (node: FormFieldElement | null) => {
      fieldRefs.current[field] = node;
    },
    onChange: (event: ChangeEvent<FormFieldElement>) => {
      const { value } = event.target;
      setValues((previous) => ({ ...previous, [field]: value }));
      if (errors[field]) check(field, value);
    },
    onBlur: (event: FocusEvent<FormFieldElement>) => {
      const { value } = event.target;
      if (tried || value) check(field, value);
    },
  });

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (sending.current) return;
    setTried(true);
    const nextErrors = validateFields(fields, values, validateField);
    setErrors(nextErrors);
    const invalid = firstInvalid(fields, nextErrors);
    if (invalid) {
      fieldRefs.current[invalid]?.focus();
      return;
    }

    sending.current = true;
    setStatus("loading");
    try {
      await send(values);
      setStatus("success");
    } catch (error) {
      console.error(`${failureLabel}:`, error);
      setStatus("error");
      submitRef.current?.focus();
    } finally {
      sending.current = false;
    }
  };

  // Move focus to the done view when the request lands.
  useEffect(() => {
    if (status === "success") doneRef.current?.focus({ preventScroll: true });
  }, [status]);

  return { status, values, fieldProps, submit, submitRef, doneRef };
}
