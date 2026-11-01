import { cn } from "@/lib/cn";
import { ChapterHeading } from "@/ui/molecules/ChapterHeading";
import { RevealItem, RevealList } from "@/ui/molecules/Reveal";
import { Section } from "@/ui/molecules/Section";

const FLOW = [
  { name: "Trade portal", note: "Customers order online" },
  { name: "Typed API", note: "Validated and tested" },
  { name: "Legacy system", note: "SQL built from strings" },
  { name: "Delivery", note: "Signed for on an ePOD" },
] as const;

const POINTS = [
  "Ordering portals for trade customers, built over legacy APIs that assembled SQL from strings, behind typed and tested layers.",
  "Config-driven form components, so a new order or account form is data rather than code.",
  "An electronic proof of delivery (ePOD) product for drivers out on the road.",
  "Cypress end-to-end tests around every path a customer orders through.",
  "An internal console for the team, on SST, tRPC and Kysely.",
] as const;

/** An order's path from portal to doorstep: the old system stays, the edges get modern. */
function OrderFlow() {
  return (
    <ol
      aria-label="How an order flows"
      className="relative m-0 grid list-none gap-3 p-0 sheet:grid-cols-4 sheet:gap-4"
    >
      {FLOW.map((step, index) => {
        const legacy = step.name === "Legacy system";
        return (
          <li
            key={step.name}
            className={cn(
              "relative rounded-card border bg-panel px-4 py-[14px]",
              legacy ? "border-dashed border-muted" : "border-line",
            )}
          >
            <span
              aria-hidden="true"
              className={cn(
                "mb-2 block h-[6px] w-8 rounded-pill",
                legacy
                  ? "bg-muted"
                  : index === FLOW.length - 1
                    ? "bg-signal"
                    : "bg-accent",
              )}
            />
            <b className="block font-display text-[17px] font-semibold leading-[1.3]">
              {step.name}
            </b>
            <span className="text-[14px] text-muted">{step.note}</span>
          </li>
        );
      })}
    </ol>
  );
}

/** Chapter 5: e-commerce for a food manufacturer, modern edges on a legacy core. */
export function EcommerceSection() {
  return (
    <Section id="ecommerce" labelledBy="ecommerce-title">
      <ChapterHeading
        id="ecommerce-title"
        title="E-commerce for food manufacturing"
        lede="Ordering portals and shop fronts for a food manufacturer, built on top of legacy systems that were staying put."
        chips={["React", "TypeScript", "SST", "tRPC", "Kysely", "Cypress"]}
      />
      <div className="grid gap-8 py-[clamp(40px,6vw,80px)]">
        <OrderFlow />
        <RevealList className="m-0 grid list-none gap-x-[clamp(24px,5vw,72px)] gap-y-3 p-0 wide:grid-cols-2">
          {POINTS.map((point) => (
            <RevealItem
              key={point}
              className="relative pl-5 text-[16px] leading-[1.6] text-muted before:absolute before:left-0 before:top-[0.6em] before:size-[7px] before:rounded-pill before:bg-accent before:content-['']"
            >
              {point}
            </RevealItem>
          ))}
        </RevealList>
      </div>
    </Section>
  );
}
