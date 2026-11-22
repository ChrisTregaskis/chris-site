import { useId, useState, useSyncExternalStore } from "react";
import {
  type DevValues,
  type RegisteredDevGroup,
  devGroups,
} from "./devSettings";

function GroupNote({
  useNote,
  values,
}: {
  useNote: NonNullable<RegisteredDevGroup["group"]["useNote"]>;
  values: DevValues;
}) {
  const note = useNote(values);
  return note ? (
    <p className="m-0 max-w-[200px] text-caption text-muted">{note}</p>
  ) : null;
}

function GroupControls({ group, settings }: RegisteredDevGroup) {
  const values = useSyncExternalStore(
    settings.subscribe,
    settings.get,
    settings.get,
  );
  const id = useId();
  const inactive = (key: string) => group.inactive?.(key, values) ?? false;

  return (
    <fieldset className="m-0 flex flex-col gap-3 border-0 p-0">
      <legend className="mb-2 p-0 font-code text-[12px] text-muted">
        {group.title}
      </legend>
      {group.controls.map((control) =>
        control.kind === "flag" ? (
          <label
            key={control.key}
            className="flex items-center gap-2 has-[:disabled]:text-muted"
          >
            <input
              type="checkbox"
              checked={Boolean(values[control.key])}
              disabled={inactive(control.key)}
              onChange={(event) =>
                settings.set({ [control.key]: event.target.checked })
              }
            />
            {control.label}
          </label>
        ) : (
          <fieldset
            key={control.key}
            disabled={inactive(control.key)}
            className="m-0 flex flex-col gap-1 border-0 p-0 disabled:text-muted"
          >
            <legend className="mb-1 p-0 text-muted">{control.label}</legend>
            {control.options.map((option) => (
              <label key={option.value} className="flex items-center gap-2">
                <input
                  type="radio"
                  name={`${id}-${control.key}`}
                  value={option.value}
                  checked={values[control.key] === option.value}
                  onChange={() => settings.set({ [control.key]: option.value })}
                />
                {option.label}
              </label>
            ))}
          </fieldset>
        ),
      )}
      {group.useNote ? (
        <GroupNote useNote={group.useNote} values={values} />
      ) : null}
    </fieldset>
  );
}

/**
 * The dev panel, for `pnpm dev` only (mounted by DevPanelSlot, never built
 * into the site): every experiment's switches (see devSettings), each
 * change written to the URL so a state can be shared or compared.
 */
export function DevPanel() {
  const [open, setOpen] = useState(true);
  const id = useId();
  if (!devGroups.length) return null;

  return (
    <div
      data-dev-panel=""
      className="fixed bottom-4 right-4 z-40 max-h-[calc(100dvh-96px)] overflow-auto rounded-card border border-solid border-line bg-sheet text-body-sm text-ink shadow-popover [accent-color:rgb(var(--color-accent))]"
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen(!open)}
        className="flex w-full cursor-pointer items-center justify-between gap-4 border-0 bg-transparent px-3 py-2 text-left font-code text-[12px] text-muted"
      >
        Dev panel
        <span aria-hidden="true">{open ? "–" : "+"}</span>
      </button>
      {open ? (
        <div id={id} className="flex flex-col gap-5 px-3 pb-3">
          {devGroups.map((registered) => (
            <GroupControls key={registered.group.title} {...registered} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
