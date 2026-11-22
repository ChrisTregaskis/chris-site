import { type Rgb } from "./paintMesh";

/** A colour token's value ("26 32 35", as tokens.css writes them) as channels. */
export function channels(raw: string, fallback: Rgb): Rgb {
  const parts = raw.trim().split(/\s+/).map(Number);
  return parts.length === 3 && parts.every(Number.isFinite)
    ? [parts[0], parts[1], parts[2]]
    : fallback;
}

export interface MeshColours {
  /** The paper's level for the fills: between the plain paper and the deepest chapter paper. */
  paper: number;
  ink: Rgb;
  light: Rgb;
}

/** The mesh's colours, from the tokens as they stand on `element`. */
export function meshColours(element: Element): MeshColours {
  const style = getComputedStyle(element);
  const surface = channels(
    style.getPropertyValue("--color-surface"),
    [242, 244, 244],
  );
  const deepest = channels(
    style.getPropertyValue("--color-paper-burpees"),
    surface,
  );
  return {
    paper:
      (surface[0] +
        surface[1] +
        surface[2] +
        deepest[0] +
        deepest[1] +
        deepest[2]) /
      6,
    ink: channels(style.getPropertyValue("--color-ink"), [26, 32, 35]),
    light: channels(style.getPropertyValue("--color-sheet"), [255, 255, 255]),
  };
}
