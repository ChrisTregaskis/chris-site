/**
 * Settings an experiment can switch live under `pnpm dev`, from the dev
 * panel or the URL. Each experiment defines its own (`defineDevSettings`):
 * the values a production build uses, and, under `pnpm dev` only, the
 * panel's controls for them. A production build uses the defaults and
 * nothing else: the URL is never read, and the controls (written inside an
 * `import.meta.env.DEV` branch) are compiled out with the panel.
 */

export type DevValue = boolean | string;
export type DevValues = Record<string, DevValue>;

/** An on/off switch: a checkbox in the panel, `?key=1` or `?key=0` in the URL. */
export interface FlagControl<K extends string> {
  kind: "flag";
  key: K;
  label: string;
}

/** One of a few values: radio buttons in the panel, `?key=value` in the URL. */
export interface ChoiceControl<K extends string> {
  kind: "choice";
  key: K;
  label: string;
  options: readonly { value: string; label: string }[];
}

/** A control for each setting: a flag for a boolean, a choice for a string. */
export type DevControl<T extends DevValues> = {
  [K in keyof T & string]: T[K] extends boolean
    ? FlagControl<K>
    : ChoiceControl<K>;
}[keyof T & string];

/** What the panel shows for one experiment. */
export interface DevGroup<T extends DevValues> {
  title: string;
  controls: readonly DevControl<T>[];
  /** Whether a control can't change anything at the moment (greyed out). */
  inactive?: (key: keyof T & string, values: T) => boolean;
  /**
   * A line under the group from live state (a fallback in force, say). A
   * hook: the panel calls it on every render.
   */
  useNote?: (values: T) => string | null;
}

export interface DevSettings<T extends DevValues> {
  readonly defaults: T;
  get: () => T;
  set: (patch: Partial<T>) => void;
  subscribe: (listener: () => void) => () => void;
}

/** Any control, its setting's type forgotten: as the panel sees it. */
export type AnyDevControl = FlagControl<string> | ChoiceControl<string>;

/** One experiment as the panel sees it. */
export interface RegisteredDevGroup {
  group: {
    title: string;
    controls: readonly AnyDevControl[];
    inactive?: (key: string, values: DevValues) => boolean;
    useNote?: (values: DevValues) => string | null;
  };
  settings: DevSettings<DevValues>;
}

/** Every experiment with controls, in the order they were defined (dev only). */
export const devGroups: RegisteredDevGroup[] = [];

/** A flag parameter: 1 or on, 0 or off, anything else the fallback. */
function flag(value: string | null, fallback: boolean): boolean {
  if (value === "1" || value === "on") return true;
  if (value === "0" || value === "off") return false;
  return fallback;
}

/** Values from a query string, each one missing or unreadable keeping its `fallback`. */
export function parseDevParams<T extends DevValues>(
  search: string,
  controls: readonly DevControl<T>[],
  fallback: T,
): T {
  const params = new URLSearchParams(search);
  const values: DevValues = { ...fallback };
  for (const control of controls) {
    const raw = params.get(control.key);
    if (control.kind === "flag") {
      values[control.key] = flag(raw, Boolean(fallback[control.key]));
    } else if (control.options.some((option) => option.value === raw)) {
      values[control.key] = raw as string;
    }
  }
  return values as T;
}

/** `search` with the values written into it, other parameters kept. */
export function writeDevParams<T extends DevValues>(
  search: string,
  controls: readonly DevControl<T>[],
  values: T,
): string {
  const params = new URLSearchParams(search);
  for (const control of controls) {
    const value = values[control.key];
    params.set(
      control.key,
      typeof value === "boolean" ? (value ? "1" : "0") : value,
    );
  }
  const query = params.toString();
  return query ? `?${query}` : "";
}

/**
 * An experiment's settings. Under `pnpm dev`, given a `group`, they start
 * from the URL, appear in the dev panel, and each change is written back to
 * the URL (so a state can be shared or reloaded). Pass the group inside an
 * `import.meta.env.DEV` branch (`import.meta.env.DEV ? {…} : null`), so its
 * labels never reach a production build.
 */
export function defineDevSettings<T extends DevValues>(
  defaults: T,
  group: DevGroup<T> | null,
): DevSettings<T> {
  let current: T | null = null;
  const listeners = new Set<() => void>();
  // The panel's controls, where the URL is read and written: dev only.
  const live =
    import.meta.env.DEV && typeof window !== "undefined" ? group : null;

  const settings: DevSettings<T> = {
    defaults,
    get() {
      current ??= live
        ? parseDevParams(window.location.search, live.controls, defaults)
        : defaults;
      return current;
    },
    set(patch) {
      current = { ...settings.get(), ...patch };
      if (live) {
        const { pathname, search, hash } = window.location;
        window.history.replaceState(
          window.history.state,
          "",
          `${pathname}${writeDevParams(search, live.controls, current)}${hash}`,
        );
      }
      for (const listener of listeners) listener();
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };

  if (import.meta.env.DEV && group) {
    devGroups.push({
      group: group as unknown as RegisteredDevGroup["group"],
      settings: settings as unknown as DevSettings<DevValues>,
    });
  }
  return settings;
}
