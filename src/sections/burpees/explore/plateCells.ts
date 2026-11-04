import { type Pose } from "../burpeeSet";

/**
 * Direction A's data: each burpee as the app declares it (its
 * `src/domain/variants.ts`), a list of positions, each one pose and either a
 * spoken count or silence. A cell's key is its pose and which occurrence of
 * that pose it is, so a cell the two burpees share keeps its key and can move
 * rather than be redrawn.
 */
export interface PlateCell {
  key: string;
  pose: Pose;
  count: number | null;
  /** What a silent position is called on the plate. */
  silent?: "set" | "stand";
}

/** The set on your hips is held a second; every position after it is a tempo beat (the app's ADR 0017). */
export const SET_BEAT_MS = 1000;
export const TEMPO_MS = 800;
/** The rest the plate's loop takes on the stand before the next rep. */
export const PLATE_REST_MS = 1600;

function plate(list: readonly (readonly [Pose, number | null])[]): PlateCell[] {
  const seen = new Map<Pose, number>();
  return list.map(([pose, count], index) => {
    const occurrence = seen.get(pose) ?? 0;
    seen.set(pose, occurrence + 1);
    const silent = count === null ? (index === 0 ? "set" : "stand") : undefined;
    return { key: `${pose}-${occurrence}`, pose, count, silent };
  });
}

export const NAVY_SEAL = plate([
  ["fists-to-hips", null],
  ["tuck", 1],
  ["plank", 2],
  ["chest", 3],
  ["plank-r-knee", 4],
  ["chest", 5],
  ["plank-l-knee", 6],
  ["chest", 7],
  ["plank", 8],
  ["tuck", 9],
  ["fists-to-hips", 10],
  ["stand", null],
]);

export const SIX_COUNT = plate([
  ["fists-to-hips", null],
  ["tuck", 1],
  ["plank", 2],
  ["chest", 3],
  ["plank", 4],
  ["tuck", 5],
  ["fists-to-hips", 6],
  ["stand", null],
]);

/** How long cell `index` of a plate is held before the next: the set a second, the stand a rest, the rest a beat. */
export function holdFor(cells: readonly PlateCell[], index: number): number {
  if (index === 0) return SET_BEAT_MS;
  if (index === cells.length - 1) return TEMPO_MS + PLATE_REST_MS;
  return TEMPO_MS;
}
