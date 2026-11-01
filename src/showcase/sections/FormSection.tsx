import { ShowcaseSection } from "../ShowcaseSection";
import { Button } from "@/ui/atoms/Button";
import { FormAlert } from "@/ui/molecules/FormAlert";
import { TextField } from "@/ui/molecules/TextField";

export function FormSection() {
  return (
    <ShowcaseSection title="Form fields">
      <p className="mb-6 max-w-measure text-muted">
        TextField composes Label, Input, Textarea or Select (with options) and
        FieldError. FormAlert is the failure banner. Two columns from the sheet
        breakpoint, one below. No validation here: the form that uses a field
        owns that.
      </p>
      <div className="max-w-[520px] rounded-card border border-line bg-panel p-6">
        <form
          noValidate
          className="grid gap-x-[14px] gap-y-4 sheet:grid-cols-2"
          onSubmit={(event) => event.preventDefault()}
        >
          <FormAlert title="That didn't send">
            Your details are still here, so you can try again.
          </FormAlert>
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
            <TextField
              label="What kind of help"
              name="help"
              optional
              placeholder="Choose one"
              options={[
                { value: "a", label: "A first choice" },
                { value: "b", label: "A second choice" },
              ]}
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
