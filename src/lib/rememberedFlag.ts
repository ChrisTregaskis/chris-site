/**
 * A small "this visitor already did it" flag in `localStorage`, such as a
 * finished form. It holds no personal data, only when it was set:
 * `{"at": "<ISO date>"}` under a versioned key (`ct:cv-unlocked:v1`).
 *
 * Storage can be missing or throw (private browsing, blocked site data), so
 * every read and write is guarded: a read that fails counts as not set, and a
 * write that fails is dropped, leaving the site as it is without the flag.
 */
export interface RememberedFlagValue {
  at: string;
}

export function readRememberedFlag(key: string): boolean {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return false;
    const parsed: unknown = JSON.parse(raw);
    return (
      typeof parsed === "object" &&
      parsed !== null &&
      typeof (parsed as Partial<RememberedFlagValue>).at === "string"
    );
  } catch {
    return false;
  }
}

export function writeRememberedFlag(key: string, now: Date = new Date()) {
  try {
    const value: RememberedFlagValue = { at: now.toISOString() };
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage is unavailable; the site works as it does without the flag.
  }
}
