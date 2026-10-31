import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { ShowcaseSection } from "../ShowcaseSection";
import { type MotionPresetName, staggerChildren } from "@/ui/motion/presets";
import { useMotionPreset } from "@/ui/motion/useMotionPreset";

const PRESETS: { name: MotionPresetName; note: string }[] = [
  { name: "fade", note: "Opacity only" },
  { name: "fadeUp", note: "Section reveals" },
  { name: "enterFromRight", note: "Drawer in" },
  { name: "enterFromBelow", note: "Phone sheet in" },
  { name: "lift", note: "Cartridge lift" },
];

const REPLAY_BUTTON =
  "rounded-pill bg-raised px-4 py-2 text-body-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-signal";

function PresetDemo({ name, note }: { name: MotionPresetName; note: string }) {
  const preset = useMotionPreset(name);
  const [run, setRun] = useState(0);
  return (
    <li className="flex flex-col gap-3 rounded-card border border-line bg-panel p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-code text-mono-sm">{name}</p>
          <p className="text-caption text-muted">{note}</p>
        </div>
        <button
          type="button"
          className={REPLAY_BUTTON}
          onClick={() => setRun((count) => count + 1)}
        >
          Replay<span className="sr-only"> {name}</span>
        </button>
      </div>
      <div className="flex h-24 items-end justify-center overflow-hidden rounded-row bg-surface p-3">
        <motion.div
          key={run}
          data-preset={name}
          initial={preset.initial}
          animate={preset.animate}
          transition={preset.transition}
          className="h-12 w-20 rounded-badge bg-accent"
        />
      </div>
    </li>
  );
}

function StaggerDemo() {
  const reduced = useReducedMotion() ?? false;
  const item = useMotionPreset("fadeUp");
  const [run, setRun] = useState(0);
  return (
    <div className="mt-6 flex flex-col gap-3">
      <button
        type="button"
        className={`${REPLAY_BUTTON} self-start`}
        onClick={() => setRun((count) => count + 1)}
      >
        Replay stagger
      </button>
      <motion.ul
        key={run}
        className="flex flex-wrap gap-2"
        initial="hidden"
        animate="shown"
        variants={{
          hidden: {},
          shown: { transition: staggerChildren("base", reduced) },
        }}
      >
        {["One", "Two", "Three", "Four", "Five"].map((label) => (
          <motion.li
            key={label}
            variants={{
              hidden: item.initial,
              shown: { ...item.animate, transition: item.transition },
            }}
            className="rounded-pill bg-raised px-3 py-1 text-caption"
          >
            {label}
          </motion.li>
        ))}
      </motion.ul>
    </div>
  );
}

export function MotionSection() {
  return (
    <ShowcaseSection title="Motion presets">
      <p className="mb-6 max-w-measure text-muted">
        With reduced motion on, every preset appears in place with no movement.
      </p>
      <ul className="grid gap-4 sheet:grid-cols-2 wide:grid-cols-3">
        {PRESETS.map((preset) => (
          <PresetDemo key={preset.name} {...preset} />
        ))}
      </ul>
      <StaggerDemo />
    </ShowcaseSection>
  );
}
