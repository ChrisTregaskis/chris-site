import { useReducedMotion } from "framer-motion";
import { useState } from "react";
import { ShowcaseSection } from "../ShowcaseSection";
import { Button } from "@/ui/atoms/Button";
import { cn } from "@/lib/cn";
import { RevealItem, RevealList } from "@/ui/molecules/Reveal";
import { Drawer } from "@/ui/organisms/Drawer";
import { NumberedDropdown, pad2 } from "@/ui/organisms/NumberedDropdown";
import { Odometer } from "@/ui/organisms/Odometer";

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

  return (
    <ShowcaseSection title="Organisms">
      <p className="mb-6 max-w-measure text-muted">
        NumberedDropdown with an Odometer label (pick 6 from 1 to watch it roll
        through every number), a Drawer (a bottom sheet below 621px) and a
        RevealList. Placeholder copy.
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
                <span
                  className={cn(
                    "inline-grid h-8 min-w-8 place-items-center rounded-row px-[6px] font-display text-[15px] font-bold tabular-nums wide:h-[34px] wide:min-w-[34px]",
                    value ? "bg-accent text-on-accent" : "bg-raised text-ink",
                  )}
                >
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
      <RevealList className="m-0 mt-8 grid list-none gap-4 p-0 sheet:grid-cols-3">
        {["First", "Second", "Third"].map((item) => (
          <RevealItem
            key={item}
            className="rounded-card border border-line bg-panel px-6 py-5"
          >
            {item} card
          </RevealItem>
        ))}
      </RevealList>
    </ShowcaseSection>
  );
}
