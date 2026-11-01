import { useCVRequestForm } from "./useCVRequestForm";
import { CV_VIEW_URL } from "./cvLink";
import { Button } from "@/ui/atoms/Button";
import { ButtonLink } from "@/ui/atoms/ButtonLink";
import { VisuallyHidden } from "@/ui/atoms/VisuallyHidden";
import { DrawerDone } from "@/ui/molecules/DrawerDone";
import { DrawerIntro } from "@/ui/molecules/DrawerIntro";
import { FormAlert } from "@/ui/molecules/FormAlert";
import { FormSubmitRow } from "@/ui/molecules/FormSubmitRow";
import { TextField } from "@/ui/molecules/TextField";

export const CV_TITLE_ID = "cv-title";
export const CV_DONE_TITLE_ID = "cv-done-title";

interface CVRequestFormProps {
  /** "Back to the site" on the unlocked view. */
  onDone: () => void;
}

/** The b3 CV request: the form, its failure banner, and the unlocked view (with its own line on a return visit). */
export function CVRequestForm({ onDone }: CVRequestFormProps) {
  const {
    status,
    remembered,
    delivered,
    fieldProps,
    submit,
    submitRef,
    doneRef,
  } = useCVRequestForm();

  if (status === "success") {
    return (
      <DrawerDone
        doneRef={doneRef}
        titleId={CV_DONE_TITLE_ID}
        title="CV unlocked"
        actions={
          <>
            <ButtonLink href={CV_VIEW_URL} target="_blank" rel="noopener">
              View CV
              <VisuallyHidden> (opens in a new tab)</VisuallyHidden>
            </ButtonLink>
            <Button variant="ghost" onClick={onDone}>
              Back to the site
            </Button>
          </>
        }
      >
        {remembered
          ? "It's still unlocked from your last visit, ready to view or download."
          : delivered
            ? "Thanks for asking. It's yours to view or download, and I'll be in touch if it looks like a fit."
            : "It's yours to view or download. Your note didn't reach me this time, so if you'd like a chat, LinkedIn is the quickest way."}
      </DrawerDone>
    );
  }

  return (
    <div>
      <DrawerIntro titleId={CV_TITLE_ID} title="Request my CV">
        Leave your name and email and the CV unlocks straight away, ready to
        view or download. I&apos;ll get a note that you asked, and that&apos;s
        all your details are used for.
      </DrawerIntro>
      <form
        noValidate
        onSubmit={submit}
        aria-labelledby={CV_TITLE_ID}
        className="grid grid-cols-1 gap-x-[14px] gap-y-4 sheet:grid-cols-2"
      >
        {status === "error" ? (
          <FormAlert title="That didn't go through">
            Something went wrong reaching the server. Your details are still
            here, so you can try again.
          </FormAlert>
        ) : null}
        <TextField
          label="First name"
          autoComplete="given-name"
          required
          {...fieldProps("firstName")}
        />
        <TextField
          label="Last name"
          autoComplete="family-name"
          optional
          {...fieldProps("lastName")}
        />
        <div className="col-span-full">
          <TextField
            label="Email address"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            {...fieldProps("email")}
          />
        </div>
        <div className="col-span-full">
          <TextField
            label="Message"
            multiline
            optional
            {...fieldProps("message")}
          />
        </div>
        <FormSubmitRow
          submitRef={submitRef}
          sending={status === "loading"}
          failed={status === "error"}
          label="Unlock the CV"
          loadingText="Unlocking"
          sendingStatus="Sending your request"
        />
      </form>
    </div>
  );
}
