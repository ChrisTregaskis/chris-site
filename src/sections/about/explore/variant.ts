import { searchVariant } from "@/lib/searchVariant";

/**
 * Design exploration (branch explore/about-contact): which take on About and
 * Contact to show, from `?about=a|b`. No param is the live copy.
 */
export type AboutVariant = "a" | "b";

export const ABOUT_VARIANT: AboutVariant | null =
  typeof window === "undefined"
    ? null
    : searchVariant(window.location.search, "about", ["a", "b"] as const);
