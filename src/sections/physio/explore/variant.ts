/**
 * Design exploration (branch explore/physio-mobile): which phone drawing of
 * the physio chapter to show, from `?physiom=a|b`. Read once at module
 * load, never during render; anything else (or no param) is the live
 * chapter, untouched. Any draft also lowers the 3D cut-off (see `fitDepth`).
 */
export type PhoneDraft = "a" | "b";

export const PHONE_DRAFTS: readonly PhoneDraft[] = ["a", "b"];

export function parseDraft(search: string): PhoneDraft | null {
  const value = new URLSearchParams(search).get("physiom");
  return PHONE_DRAFTS.find((draft) => draft === value) ?? null;
}

function readDraft(): PhoneDraft | null {
  if (typeof window === "undefined") return null;
  return parseDraft(window.location.search);
}

export const PHONE_DRAFT = readDraft();
