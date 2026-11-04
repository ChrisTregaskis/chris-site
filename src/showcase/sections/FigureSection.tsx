import { useReducedMotion } from "framer-motion";
import { useRef, useState } from "react";
import { ShowcaseSection } from "../ShowcaseSection";
import {
  INSIDE,
  InsideList,
  PART_ORDER,
  type PartId,
  type PlatformIndex,
  PARTS,
  partNumber,
  WayfinderFigure,
} from "@/features/wayfinder";
import { Button } from "@/ui/atoms/Button";

/**
 * The Wayfinder figure on its own: taken apart or whole, any part in focus,
 * the phone's open-in-place mode, and that part's "Inside" list picking its
 * pieces out. On the page it also grows into the room around its stage
 * while apart; here it keeps its column.
 */
export function FigureSection() {
  const reduced = useReducedMotion() ?? false;
  const [part, setPart] = useState<PartId | null>("bff");
  const [apart, setApart] = useState(true);
  const [lite, setLite] = useState(false);
  const [platform, setPlatform] = useState<PlatformIndex>(1);
  const [pressed, setPressed] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const pulseRef = useRef<SVGGElement>(null);

  const focus = (next: PartId | null) => {
    setPart(next);
    setPressed(null);
  };

  return (
    <ShowcaseSection title="Figure">
      <p className="mb-6 max-w-measure text-muted">
        The Wayfinder figure as an exploded assembly: every part lifts to its
        own tier and the one in focus opens into numbered pieces, tagged like
        callouts on a technical drawing (13px whatever the drawing&apos;s
        scale). Phone mode opens only the part in focus, in place, and draws off
        only its pipes. The list picks a piece out (hover, focus or press).
        Click a cartridge to swap the platform.
      </p>
      <div className="grid items-start gap-10 wide:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="max-w-[640px] pt-16">
          <WayfinderFigure
            selected={part}
            hot={new Set()}
            lit={new Set()}
            platform={platform}
            onPart={focus}
            onSlot={setPlatform}
            pulseRef={pulseRef}
            apart={apart}
            lite={lite}
            highlight={preview ?? pressed}
            reducedMotion={reduced}
          />
        </div>
        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-[14px]">
            <Button
              variant="ghost"
              pressed={apart}
              onClick={() => setApart((value) => !value)}
            >
              Taken apart
            </Button>
            <Button
              variant="ghost"
              pressed={lite}
              onClick={() => setLite((value) => !value)}
            >
              Phone mode
            </Button>
          </div>
          <div
            role="group"
            aria-label="Part in focus"
            className="flex flex-wrap gap-x-4 gap-y-2 text-[14px]"
          >
            <Button
              variant="ghost"
              pressed={part === null}
              onClick={() => focus(null)}
            >
              None
            </Button>
            {PART_ORDER.map((id) => (
              <Button
                key={id}
                variant="ghost"
                pressed={part === id}
                onClick={() => focus(id)}
                aria-label={`${partNumber(id)}, ${PARTS[id].name}`}
              >
                {partNumber(id)}
              </Button>
            ))}
          </div>
          {part ? (
            <div>
              <p className="m-0 text-[14px] font-medium text-muted">
                {PARTS[part].name}
              </p>
              <InsideList
                n={partNumber(part)}
                pieces={INSIDE[part]}
                pressed={pressed}
                onPreview={setPreview}
                onPress={(id) =>
                  setPressed((current) => (current === id ? null : id))
                }
              />
            </div>
          ) : null}
        </div>
      </div>
    </ShowcaseSection>
  );
}
