import { useId, useState } from "react";
import { MESH_MODES, type MeshMode } from "./settings";
import { setSurface } from "./surfaceStore";
import { useSurfaceSettings } from "./useSurfaceSettings";

const MESH_LABELS: Record<MeshMode, string> = {
  off: "Off",
  static: "Static",
  pointer: "Pointer",
};

export interface SurfacePanelProps {
  /** What the visitor actually gets, when it differs from the setting (pointer on a touch screen, say). */
  fallback?: string | null;
}

/**
 * The surface experiments' switches, for `pnpm dev` only (never built into
 * the site: see Surface). Chapter tones on or off; the mesh off, static or
 * following the pointer. Each change is written to the URL, so a state can
 * be shared or compared (`?tones=1&mesh=pointer`).
 */
export function SurfacePanel({ fallback }: SurfacePanelProps) {
  const settings = useSurfaceSettings();
  const [open, setOpen] = useState(true);
  const id = useId();

  return (
    <div
      data-surface-panel=""
      className="fixed bottom-4 right-4 z-40 rounded-card border border-solid border-line bg-sheet text-body-sm text-ink shadow-popover [accent-color:rgb(var(--color-accent))]"
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen(!open)}
        className="flex w-full cursor-pointer items-center justify-between gap-4 border-0 bg-transparent px-3 py-2 text-left font-code text-[12px] text-muted"
      >
        Surface (dev)
        <span aria-hidden="true">{open ? "–" : "+"}</span>
      </button>
      {open ? (
        <div id={id} className="flex flex-col gap-3 px-3 pb-3">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.tones}
              onChange={(event) =>
                setSurface({ ...settings, tones: event.target.checked })
              }
            />
            Chapter tones
          </label>
          <fieldset className="m-0 flex flex-col gap-1 border-0 p-0">
            <legend className="mb-1 p-0 text-muted">Mesh</legend>
            {MESH_MODES.map((mode) => (
              <label key={mode} className="flex items-center gap-2">
                <input
                  type="radio"
                  name={`${id}-mesh`}
                  value={mode}
                  checked={settings.mesh === mode}
                  onChange={() => setSurface({ ...settings, mesh: mode })}
                />
                {MESH_LABELS[mode]}
              </label>
            ))}
          </fieldset>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.lines}
              disabled={settings.mesh === "off"}
              onChange={(event) =>
                setSurface({ ...settings, lines: event.target.checked })
              }
            />
            Pencil lines
          </label>
          {fallback ? (
            <p className="m-0 max-w-[180px] text-caption text-muted">
              {fallback}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
