import { type Box } from "./mesh";
import { TEXT_BLUR, TEXT_PAD } from "./strength";

/**
 * Every line of text under `roots`, as boxes in page px (or in the
 * coordinates `origin` sets): one per line fragment of each text node, so
 * the gaps between lines and the ragged ends of a paragraph aren't covered.
 * Only those `wanted` are kept (the ones where the mesh lies). Elements
 * whose own box isn't wanted are skipped without measuring their text.
 */
export function textLineBoxes(
  roots: readonly Element[],
  origin: { x: number; y: number },
  wanted: (box: Box) => boolean,
): Box[] {
  const boxes: Box[] = [];
  const range = document.createRange();
  const near = new Map<Element, boolean>();
  const toBox = (r: DOMRect | DOMRectReadOnly): Box => ({
    left: r.left - origin.x,
    top: r.top - origin.y,
    right: r.right - origin.x,
    bottom: r.bottom - origin.y,
  });
  for (const root of roots) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      const parent = node.parentElement;
      if (!parent || !node.textContent?.trim()) continue;
      let close = near.get(parent);
      if (close === undefined) {
        close = wanted(toBox(parent.getBoundingClientRect()));
        near.set(parent, close);
      }
      if (!close) continue;
      range.selectNodeContents(node);
      for (const rect of range.getClientRects()) {
        // Visually hidden text measures a pixel or so: nothing to protect.
        if (rect.width < 2 || rect.height < 4) continue;
        const box = toBox(rect);
        if (wanted(box)) boxes.push(box);
      }
    }
  }
  range.detach();
  return boxes;
}

/**
 * Draws the text mask for a band of the page into `mask`: each line's box,
 * grown by TEXT_PAD and blurred (TEXT_BLUR), opaque where text is. Drawn
 * at `scale` of the page (it's all soft edges, so half is plenty). The blur
 * is a canvas shadow cast by a box drawn just off the canvas: shadows blur
 * in every browser, where a canvas `filter` doesn't yet.
 */
export function drawTextMask(
  mask: HTMLCanvasElement,
  boxes: readonly Box[],
  band: { left: number; top: number; width: number; height: number },
  scale: number,
): void {
  const width = Math.max(1, Math.ceil(band.width * scale));
  const height = Math.max(1, Math.ceil(band.height * scale));
  if (mask.width !== width) mask.width = width;
  if (mask.height !== height) mask.height = height;
  const context = mask.getContext("2d");
  if (!context) return;
  context.setTransform(1, 0, 0, 1, 0, 0);
  context.clearRect(0, 0, width, height);
  const reach = TEXT_PAD + TEXT_BLUR * 2;
  const away = band.width + reach * 4;
  context.setTransform(
    scale,
    0,
    0,
    scale,
    -band.left * scale,
    -band.top * scale,
  );
  context.fillStyle = "#000";
  context.shadowColor = "#000";
  context.shadowBlur = TEXT_BLUR * scale;
  context.shadowOffsetX = away * scale;
  context.shadowOffsetY = 0;
  for (const box of boxes) {
    if (
      box.bottom + reach < band.top ||
      box.top - reach > band.top + band.height
    ) {
      continue;
    }
    context.fillRect(
      box.left - TEXT_PAD - away,
      box.top - TEXT_PAD,
      box.right - box.left + 2 * TEXT_PAD,
      box.bottom - box.top + 2 * TEXT_PAD,
    );
  }
  context.shadowColor = "transparent";
}
