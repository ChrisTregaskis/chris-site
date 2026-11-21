import { type NodeId, type RouteKey } from "./geometry";
import { type RingId } from "./story";

/** What a step's detail picks out of the drawing, in amber. */
export interface Highlight {
  nodes: ReadonlySet<NodeId>;
  routes: ReadonlySet<RouteKey>;
  rings: ReadonlySet<RingId>;
}

export const NO_HIGHLIGHT: Highlight = {
  nodes: new Set(),
  routes: new Set(),
  rings: new Set(),
};
