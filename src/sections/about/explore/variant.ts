import { searchVariant } from "@/lib/searchVariant";

/**
 * Design exploration (branch explore/about-portrait): which treatment of the
 * About photo to show, from `?portrait=a|b|c|d`. No param is the live look.
 */
export type PortraitVariant = "a" | "b" | "c" | "d";

export const PORTRAIT_VARIANTS = ["a", "b", "c", "d"] as const;

export const PORTRAIT_VARIANT: PortraitVariant | null =
  typeof window === "undefined"
    ? null
    : searchVariant(window.location.search, "portrait", PORTRAIT_VARIANTS);
