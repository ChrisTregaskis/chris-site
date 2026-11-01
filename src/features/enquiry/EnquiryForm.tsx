import { HELP_OPTIONS } from "./enquiryFields";
import { LINKEDIN_URL } from "./links";
import { useEnquiryForm } from "./useEnquiryForm";
import { Button } from "@/ui/atoms/Button";
import { TextLink } from "@/ui/atoms/TextLink";
import { DrawerDone } from "@/ui/molecules/DrawerDone";
import { DrawerIntro } from "@/ui/molecules/DrawerIntro";
import { FormAlert } from "@/ui/molecules/FormAlert";
import { FormSubmitRow } from "@/ui/molecules/FormSubmitRow";
import { TextField } from "@/ui/molecules/TextField";

export const ENQUIRY_TITLE_ID = "enquiry-title";
export const ENQUIRY_DONE_TITLE_ID = "enquiry-done-title";

interface EnquiryFormProps {
  /** "Back to the site" on the sent view. */
  onDone: () => void;
}

/**
 * "Get in touch": name, email, an optional kind of help and the message; its
 * failure banner; the sent view, and its return-visit version with "Send
 * another message".
 */
export function EnquiryForm({ onDone }: EnquiryFormProps) {
  const {
    status,
    remembered,
    sendAnother,
    fieldProps,
    submit,
    submitRef,
    doneRef,
  } = useEnquiryForm();

  if (status === "success" && remembered) {
    return (
      <DrawerDone
        doneRef={doneRef}
        titleId={ENQUIRY_DONE_TITLE_ID}
        title="Message sent"
        actions={
          <>
            <Button onClick={sendAnother}>Send another message</Button>
            <Button variant="ghost" onClick={onDone}>
              Back to the site
            </Button>
          </>
        }
      >
        Thanks, your message reached me and I&apos;ll reply by email.
      </DrawerDone>
    );
  }

  if (status === "success") {
    return (
      <DrawerDone
        doneRef={doneRef}
        titleId={ENQUIRY_DONE_TITLE_ID}
        title="Message sent"
        actions={<Button onClick={onDone}>Back to the site</Button>}
      >
        Thanks for getting in touch. I&apos;ll read it properly and reply by
        email.
      </DrawerDone>
    );
  }

  return (
    <div>
      <DrawerIntro titleId={ENQUIRY_TITLE_ID} title="Get in touch">
        Tell me a little about your business and what you&apos;re trying to do.
        It comes straight to me, and I&apos;ll reply by email.
      </DrawerIntro>
      <form
        noValidate
        onSubmit={submit}
        aria-labelledby={ENQUIRY_TITLE_ID}
        className="grid grid-cols-1 gap-x-[14px] gap-y-4 sheet:grid-cols-2"
      >
        {status === "error" ? (
          <FormAlert title="That didn't send">
            Your message didn&apos;t reach me. Your details are still here, so
            you can try again, or message me on{" "}
            <TextLink href={LINKEDIN_URL} external>
              LinkedIn
            </TextLink>{" "}
            instead.
          </FormAlert>
        ) : null}
        <TextField
          label="Name"
          autoComplete="name"
          required
          {...fieldProps("name")}
        />
        <TextField
          label="Email address"
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          {...fieldProps("email")}
        />
        <div className="col-span-full">
          <TextField
            label="What kind of help"
            options={HELP_OPTIONS}
            placeholder="Choose one"
            optional
            {...fieldProps("help")}
          />
        </div>
        <div className="col-span-full">
          <TextField
            label="What's it about?"
            multiline
            required
            {...fieldProps("message")}
          />
        </div>
        <FormSubmitRow
          submitRef={submitRef}
          sending={status === "loading"}
          failed={status === "error"}
          label="Send message"
          loadingText="Sending"
          sendingStatus="Sending your message"
        />
      </form>
    </div>
  );
}
