import { useReducedMotion } from "framer-motion";
import { useState } from "react";
import { ShowcaseSection } from "../ShowcaseSection";
import { Button } from "@/ui/atoms/Button";
import { RevealItem, RevealList } from "@/ui/molecules/Reveal";
import { Drawer } from "@/ui/organisms/Drawer";
import { NumberedDropdown, pad2 } from "@/ui/organisms/NumberedDropdown";
import { NavMenu } from "@/ui/organisms/NavMenu";
import { Odometer } from "@/ui/organisms/Odometer";
import { PhoneMenu } from "@/ui/organisms/PhoneMenu";
import { StageAction } from "@/ui/organisms/StageAction";
import { StepPicker } from "@/ui/organisms/StepPicker";

/** An icon in place of a number, as an unnumbered story's picker shows. */
const DOT = (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <circle
      cx="12"
      cy="12"
      r="6"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    />
  </svg>
);

const OPTIONS = [
  { value: 1, label: "A first part" },
  { value: 2, label: "A second part" },
  { value: 3, label: "A third part" },
  { value: 4, label: "A fourth part" },
  { value: 5, label: "A fifth part" },
  { value: 6, label: "Try it", separated: true },
];

export function OrganismsSection() {
  const reduced = useReducedMotion() ?? false;
  const [value, setValue] = useState(0);
  const [open, setOpen] = useState(false);
  const shown = value || 1;
  const [step, setStep] = useState(0);
  const [whole, setWhole] = useState(true);

  return (
    <ShowcaseSection title="Organisms">
      <p className="mb-6 max-w-measure text-muted">
        NumberedDropdown with an Odometer label (pick 6 from 1 to watch it roll
        through every number), a Drawer (a bottom sheet below 621px), a NavMenu
        (the top bar's Work disclosure: ArrowDown opens it, Escape closes it), a
        PhoneMenu (the bar's menu below the wide breakpoint: full screen, the
        Work entries, the plain links, then the calls to action as links; Close,
        Escape or choosing anything closes it), a StepPicker (a scroll story's
        picker as the Wayfinder chapter draws it, here with icons in place of
        numbers), a StageAction (its action on its own, as the compact phone
        stage pins it to the drawing's bottom-right corner: a size down, with a
        44px press) and a RevealList. Placeholder copy.
      </p>
      <div className="flex max-w-[460px] items-stretch gap-[10px]">
        <NumberedDropdown
          label="Showcase part"
          options={OPTIONS}
          value={value}
          valueText={`${pad2(shown)} ${OPTIONS[shown - 1].label}`}
          onSelect={setValue}
        >
          <Odometer
            value={shown}
            reducedMotion={reduced}
            className="h-8 min-w-0 flex-1 wide:h-[34px]"
            renderItem={(n) => (
              <>
                <span className="inline-grid h-8 place-items-center font-display text-[20px] font-semibold tabular-nums tracking-[-0.02em] text-accent wide:h-[34px]">
                  {pad2(n)}
                </span>
                {OPTIONS[n - 1].label}
              </>
            )}
          />
        </NumberedDropdown>
        <Button
          onClick={() => setOpen(true)}
          className="flex-none whitespace-nowrap rounded-control py-0"
        >
          Open drawer
        </Button>
      </div>
      <div className="mt-6 flex max-w-[460px] flex-col gap-[14px]">
        <StepPicker
          label="Showcase step"
          options={OPTIONS.slice(0, 5).map((option) => ({
            ...option,
            marker: DOT,
          }))}
          value={step}
          shown={step || 1}
          valueText={OPTIONS[(step || 1) - 1].label}
          onSelect={setStep}
          reducedMotion={reduced}
          marker={() => DOT}
          name={(n) => OPTIONS[n - 1].label}
          action={{
            label: "Try it",
            pressed: step === 5,
            onClick: () => setStep(5),
          }}
          toggle={{
            label: whole ? "Take it apart" : "Put it back together",
            glyph: DOT,
            onClick: () => setWhole(!whole),
          }}
        />
        <div className="relative h-[120px] w-full">
          <StageAction
            action={{
              label: "Try it",
              pressed: step === 5,
              onClick: () => setStep(5),
            }}
            className="bottom-0"
          />
        </div>
      </div>
      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        labelledBy="showcase-drawer-title"
      >
        <div className="flex flex-col gap-4 px-8 py-7">
          <h3
            id="showcase-drawer-title"
            className="m-0 font-display text-display-md font-semibold"
          >
            A drawer
          </h3>
          <p className="m-0 text-muted">
            Escape, the backdrop or the button closes it.
          </p>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Close
          </Button>
        </div>
      </Drawer>
      <div className="mt-8 text-body-sm">
        <NavMenu
          label="Work"
          items={[
            { href: "#organisms", label: "A first study", numeral: "1" },
            { href: "#organisms", label: "How it was made", sub: true },
            { href: "#organisms", label: "A second study", numeral: "2" },
            { href: "#organisms", label: "A third study", numeral: "3" },
          ]}
        />
      </div>
      <div className="mt-8 text-body-sm">
        <PhoneMenu
          name="Ada Lovelace"
          homeHref="#organisms"
          items={[
            { href: "#organisms", label: "A first study", numeral: "1" },
            { href: "#organisms", label: "How it was made", sub: true },
            { href: "#organisms", label: "A second study", numeral: "2" },
            { href: "#organisms", label: "A third study", numeral: "3" },
          ]}
          links={[
            { href: "#layout", label: "About" },
            { href: "#form-fields", label: "Contact" },
          ]}
          actions={
            <>
              <Button variant="ghost">Say hello</Button>
              <Button variant="ghost">Ask for more</Button>
            </>
          }
        />
      </div>
      <RevealList className="m-0 mt-48 grid list-none gap-4 p-0 sheet:grid-cols-3">
        {["First", "Second", "Third"].map((item) => (
          <RevealItem
            key={item}
            className="py-2 font-display text-title font-semibold"
          >
            {item} item
          </RevealItem>
        ))}
      </RevealList>
    </ShowcaseSection>
  );
}
