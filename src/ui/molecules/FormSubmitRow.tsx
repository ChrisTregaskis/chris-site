import { type Ref } from "react";
import { Button } from "@/ui/atoms/Button";

interface FormSubmitRowProps {
  submitRef: Ref<HTMLButtonElement>;
  sending: boolean;
  /** Whether the last send failed (the button then reads "Try again"). */
  failed: boolean;
  label: string;
  /** Beside the spinner while sending, e.g. "Sending". */
  loadingText: string;
  /** Said politely to assistive tech while sending. */
  sendingStatus: string;
}

/** A drawer form's submit button and its polite sending status. */
export function FormSubmitRow({
  submitRef,
  sending,
  failed,
  label,
  loadingText,
  sendingStatus,
}: FormSubmitRowProps) {
  return (
    <div className="col-span-full mt-1 flex flex-wrap items-center gap-[14px]">
      <Button
        ref={submitRef}
        type="submit"
        loading={sending}
        loadingText={loadingText}
        className="min-w-[168px]"
      >
        {failed ? "Try again" : label}
      </Button>
      <span role="status" className="text-caption text-muted">
        {sending ? sendingStatus : ""}
      </span>
    </div>
  );
}
