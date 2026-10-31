import { useState } from "react";
import { ShowcaseSection } from "../ShowcaseSection";
import { Button } from "@/ui/atoms/Button";
import { ButtonLink } from "@/ui/atoms/ButtonLink";
import { Icon } from "@/ui/atoms/Icon";
import { Spinner } from "@/ui/atoms/Spinner";
import { TextLink } from "@/ui/atoms/TextLink";

const ArrowDown = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 5v14M6 13l6 6 6-6" />
  </svg>
);

const Document = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M8 2a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V8l-6-6h-4z" />
    <path d="M12 2v6h6" />
  </svg>
);

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-3 wide:grid-cols-[10rem_minmax(0,1fr)] wide:items-center">
      <span className="font-code text-mono-sm text-muted">{label}</span>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  );
}

export function ActionsSection() {
  const [pressed, setPressed] = useState(false);
  const [loading, setLoading] = useState(false);

  return (
    <ShowcaseSection title="Actions">
      <div className="flex flex-col gap-6">
        <Row label="Button">
          <Button>Primary action</Button>
          <Button variant="ghost">Secondary action</Button>
          <Button variant="ghost">
            <Icon>
              <ArrowDown />
            </Icon>
            With an icon
          </Button>
        </Row>
        <Row label="ButtonLink">
          <ButtonLink href="#actions">See the work</ButtonLink>
          <ButtonLink href="#actions" variant="ghost">
            Get in touch
          </ButtonLink>
        </Row>
        <Row label="loading">
          <Button
            loading={loading}
            loadingText="Sending"
            className="min-w-[168px]"
            onClick={() => {
              setLoading(true);
              window.setTimeout(() => setLoading(false), 2000);
            }}
          >
            Send the request
          </Button>
          <Button loading loadingText="Sending" className="min-w-[168px]">
            Always loading
          </Button>
        </Row>
        <Row label="pressed">
          <Button pressed={pressed} onClick={() => setPressed((on) => !on)}>
            Try it
          </Button>
          <Button variant="ghost" pressed>
            Pressed ghost
          </Button>
        </Row>
        <Row label="focus-visible">
          <Button data-focus-demo>Tab to me</Button>
          <span className="text-caption text-muted">
            Signal outline, 2px, offset 3px.
          </span>
        </Row>
        <Row label="TextLink">
          <p>
            Read the <TextLink href="#actions">case notes</TextLink> or the{" "}
            <TextLink href="https://example.com" external>
              long-form articles
            </TextLink>
            .
          </p>
        </Row>
        <Row label="Icon">
          <Icon size={16}>
            <Document />
          </Icon>
          <Icon size={18}>
            <Document />
          </Icon>
          <Icon>
            <Document />
          </Icon>
          <Icon size={24} label="Document">
            <Document />
          </Icon>
        </Row>
        <Row label="Spinner">
          <span className="inline-flex rounded-pill bg-accent p-2">
            <Spinner label="Loading" />
          </span>
        </Row>
      </div>
    </ShowcaseSection>
  );
}
