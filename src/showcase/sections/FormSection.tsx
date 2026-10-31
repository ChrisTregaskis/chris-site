import { ShowcaseSection } from "../ShowcaseSection";
import { Button } from "@/ui/atoms/Button";
import { TextField } from "@/ui/molecules/TextField";

export function FormSection() {
  return (
    <ShowcaseSection title="Form fields">
      <p className="mb-6 max-w-measure text-muted">
        TextField composes Label, Input or Textarea and FieldError. Two columns
        from the sheet breakpoint, one below. No validation here: the form that
        uses a field owns that.
      </p>
      <div className="max-w-[520px] rounded-card border border-line bg-panel p-6">
        <form
          noValidate
          className="grid gap-x-[14px] gap-y-4 sheet:grid-cols-2"
          onSubmit={(event) => event.preventDefault()}
        >
          <TextField
            label="First name"
            name="firstName"
            autoComplete="given-name"
            defaultValue="Ada"
          />
          <TextField
            label="Last name"
            name="lastName"
            autoComplete="family-name"
            optional
          />
          <div className="sheet:col-span-2">
            <TextField
              label="Email"
              name="email"
              type="email"
              autoComplete="email"
              defaultValue="ada@"
              error="Enter an email address like name@example.com"
            />
          </div>
          <div className="sheet:col-span-2">
            <TextField label="Message" name="message" multiline optional />
          </div>
          <div className="mt-1 sheet:col-span-2">
            <Button type="submit" className="min-w-[168px]">
              Send the request
            </Button>
          </div>
        </form>
      </div>
    </ShowcaseSection>
  );
}
