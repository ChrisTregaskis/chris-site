import { useCVRequestForm } from "./useCVRequestForm";
import { CV_VIEW_URL } from "./cvLink";
import { Button } from "@/ui/atoms/Button";
import { ButtonLink } from "@/ui/atoms/ButtonLink";
import { Icon } from "@/ui/atoms/Icon";
import { TextField } from "@/ui/molecules/TextField";

export const CV_TITLE_ID = "cv-title";

interface CVRequestFormProps {
  /** "Back to the site" on the unlocked view. */
  onDone: () => void;
}

/** The b3 CV request: the form, its failure banner, and the unlocked view. */
export function CVRequestForm({ onDone }: CVRequestFormProps) {
  const { status, delivered, fieldProps, submit, submitRef, doneRef } =
    useCVRequestForm();
  const sending = status === "loading";

  if (status === "success") {
    return (
      <div
        ref={doneRef}
        tabIndex={-1}
        aria-labelledby="cv-done-title"
        className="flex flex-col gap-[18px] focus:outline-none"
      >
        <span
          aria-hidden="true"
          className="grid size-16 place-items-center rounded-pill bg-signal text-on-accent"
        >
          <svg viewBox="0 0 24 24" className="size-[30px]">
            <path
              d="M5 12.5l4.5 4.5L19 7.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <h2
          id="cv-done-title"
          className="m-0 font-display text-[clamp(30px,4vw,40px)] font-semibold leading-[1.05] tracking-[-0.02em]"
        >
          CV unlocked
        </h2>
        <p className="m-0 text-[16px] text-muted">
          {delivered
            ? "Thanks for asking. It's yours to view or download, and I'll be in touch if it looks like a fit."
            : "It's yours to view or download. Your note didn't reach me this time, so if you'd like a chat, LinkedIn is the quickest way."}
        </p>
        <div className="flex flex-wrap gap-3">
          <ButtonLink href={CV_VIEW_URL} target="_blank" rel="noopener">
            View CV
          </ButtonLink>
          <Button variant="ghost" onClick={onDone}>
            Back to the site
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2
        id={CV_TITLE_ID}
        className="m-0 font-display text-[clamp(30px,4vw,40px)] font-semibold leading-[1.05] tracking-[-0.02em]"
      >
        Request my CV
      </h2>
      <p className="mb-[22px] mt-[10px] text-[16px] text-muted">
        Leave your name and email and the CV unlocks straight away, ready to
        view or download. I&apos;ll get a note that you asked, and that&apos;s
        all your details are used for.
      </p>
      <form
        noValidate
        onSubmit={submit}
        aria-labelledby={CV_TITLE_ID}
        className="grid grid-cols-1 gap-x-[14px] gap-y-4 sheet:grid-cols-2"
      >
        {status === "error" ? (
          <div
            role="alert"
            className="col-span-full flex items-start gap-3 rounded-control border-[1.5px] border-danger/50 bg-danger/10 px-4 py-[14px]"
          >
            <span className="mt-px text-danger">
              <Icon size={24}>
                <svg viewBox="0 0 24 24">
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path
                    d="M12 7v6M12 16.5v.5"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  />
                </svg>
              </Icon>
            </span>
            <div>
              <b className="block font-semibold">That didn&apos;t go through</b>
              <p className="m-0 mt-[2px] text-[14.5px] text-muted">
                Something went wrong reaching the server. Your details are still
                here, so you can try again.
              </p>
            </div>
          </div>
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
        <div className="col-span-full mt-1 flex flex-wrap items-center gap-[14px]">
          <Button
            ref={submitRef}
            type="submit"
            loading={sending}
            loadingText="Unlocking"
            className="min-w-[168px]"
          >
            {status === "error" ? "Try again" : "Unlock the CV"}
          </Button>
          <span role="status" className="text-caption text-muted">
            {sending ? "Sending your request" : ""}
          </span>
        </div>
      </form>
    </div>
  );
}
