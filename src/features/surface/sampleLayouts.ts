import { type PageSections } from "./reach";

/**
 * Test fixtures: the page's sections as measured in Chrome (page px), at
 * 1440×900, 390×844, 320×640 and 2560×1440, for the tests that check the
 * mesh's reach and its contrast against the real layout.
 */
export interface SampleLayout extends PageSections {
  viewHeight: number;
  physioTop: number;
  burpeesTop: number;
  contactTop: number;
  pageBottom: number;
}

export const LAYOUTS: Record<string, SampleLayout> = {
  desktop: {
    viewHeight: 900,
    heroTop: 68,
    heroBottom: 900,
    workTop: 900,
    physioTop: 9296,
    burpeesTop: 13785,
    aboutTop: 18065,
    aboutBottom: 18732,
    contactTop: 18732,
    pageBottom: 19245,
  },
  phone: {
    viewHeight: 844,
    heroTop: 68,
    heroBottom: 844,
    workTop: 844,
    physioTop: 9306,
    burpeesTop: 13876,
    aboutTop: 17892,
    aboutBottom: 18767,
    contactTop: 18767,
    pageBottom: 19337,
  },
  narrow: {
    viewHeight: 640,
    heroTop: 68,
    heroBottom: 640,
    workTop: 640,
    physioTop: 9155,
    burpeesTop: 13772,
    aboutTop: 16958,
    aboutBottom: 17844,
    contactTop: 17844,
    pageBottom: 18442,
  },
  wide: {
    viewHeight: 1440,
    heroTop: 68,
    heroBottom: 1440,
    workTop: 1440,
    physioTop: 13949,
    burpeesTop: 20771,
    aboutTop: 27319,
    aboutBottom: 27986,
    contactTop: 27986,
    pageBottom: 28499,
  },
};
