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

/** A line of text: [left, top, right, bottom] in page px, its colour role, and whether it's large text (24px and up: AA is 3:1). */
export type TextLine = readonly [
  number,
  number,
  number,
  number,
  string,
  boolean,
];

/**
 * Every line of text where the mesh lies (the hero, the top of Wayfinder,
 * the end of the Burpees chapter, About, Contact and the footer) as Chrome
 * lays it out at 1440×900 (desktop) and 390×844 (phone): one box per line
 * of each text node, with its role. The Burpees set is measured at the end
 * of its run, unpinned at its lowest, nearest About: where the mesh's reach
 * is strongest for it. Buttons' text is left out: it sits on the button.
 */
export const TEXT_LINES: Record<"desktop" | "phone", readonly TextLine[]> = {
  desktop: [
    [176, 641, 397, 660, "muted", false],
    [176, 664, 323, 683, "muted", false],
    [176, 188, 1100, 283, "ink", true],
    [176, 284, 1200, 379, "ink", true],
    [176, 379, 996, 474, "ink", true],
    [176, 475, 1143, 570, "ink", true],
    [549, 643, 1132, 668, "ink", false],
    [549, 676, 928, 701, "ink", false],
    [176, 981, 260, 1125, "ink", true],
    [176, 1127, 863, 1189, "ink", true],
    [176, 1190, 859, 1252, "ink", true],
    [9, 17418, 17, 17433, "ink", false],
    [17, 17418, 24, 17433, "muted", false],
    [24, 17418, 31, 17433, "muted", false],
    [176, 17395, 767, 17741, "ink", true],
    [176, 17720, 193, 17739, "muted", false],
    [193, 17720, 219, 17739, "muted", false],
    [219, 17720, 304, 17739, "muted", false],
    [176, 17769, 316, 17829, "accent", true],
    [176, 17842, 561, 17864, "ink", false],
    [176, 18162, 313, 18214, "ink", true],
    [614, 18406, 1203, 18428, "ink", false],
    [614, 18434, 1210, 18456, "ink", false],
    [614, 18463, 1211, 18485, "ink", false],
    [614, 18492, 1088, 18514, "ink", false],
    [614, 18537, 1225, 18559, "muted", false],
    [614, 18566, 1217, 18588, "muted", false],
    [614, 18594, 744, 18616, "muted", false],
    [176, 18829, 596, 18881, "ink", true],
    [176, 18905, 834, 18930, "muted", false],
    [176, 18938, 850, 18963, "muted", false],
    [176, 18970, 867, 18995, "muted", false],
    [176, 19003, 528, 19028, "muted", false],
    [456, 19073, 516, 19092, "ink", false],
    [540, 19073, 590, 19092, "ink", false],
    [614, 19073, 668, 19092, "ink", false],
    [176, 19178, 190, 19194, "muted", false],
    [190, 19178, 221, 19194, "muted", false],
    [221, 19178, 316, 19194, "muted", false],
  ],
  phone: [
    [16, 513, 314, 532, "muted", false],
    [16, 536, 85, 555, "muted", false],
    [16, 181, 246, 225, "ink", true],
    [16, 225, 303, 269, "ink", true],
    [16, 269, 344, 313, "ink", true],
    [16, 313, 234, 357, "ink", true],
    [16, 357, 286, 401, "ink", true],
    [16, 401, 302, 445, "ink", true],
    [16, 575, 361, 597, "ink", false],
    [16, 603, 360, 625, "ink", false],
    [16, 631, 147, 653, "ink", false],
    [16, 876, 62, 956, "ink", true],
    [16, 964, 247, 998, "ink", true],
    [16, 999, 248, 1033, "ink", true],
    [16, 1033, 259, 1067, "ink", true],
    [16, 1095, 342, 1115, "muted", false],
    [16, 1122, 356, 1142, "muted", false],
    [16, 17293, 363, 17496, "ink", true],
    [16, 17489, 33, 17508, "muted", false],
    [33, 17489, 59, 17508, "muted", false],
    [59, 17489, 144, 17508, "muted", false],
    [16, 17536, 97, 17572, "accent", true],
    [16, 17585, 341, 17605, "ink", false],
    [16, 17612, 51, 17632, "ink", false],
    [16, 17940, 103, 17974, "ink", true],
    [16, 18345, 354, 18367, "ink", false],
    [16, 18373, 356, 18395, "ink", false],
    [16, 18402, 341, 18424, "ink", false],
    [16, 18431, 341, 18453, "ink", false],
    [16, 18460, 340, 18482, "ink", false],
    [16, 18489, 338, 18511, "ink", false],
    [16, 18517, 287, 18539, "ink", false],
    [16, 18562, 338, 18584, "muted", false],
    [16, 18591, 360, 18613, "muted", false],
    [16, 18620, 312, 18642, "muted", false],
    [16, 18649, 353, 18671, "muted", false],
    [16, 18677, 53, 18699, "muted", false],
    [16, 18815, 282, 18849, "ink", true],
    [16, 18873, 341, 18895, "muted", false],
    [16, 18900, 362, 18922, "muted", false],
    [16, 18928, 289, 18950, "muted", false],
    [16, 18956, 357, 18978, "muted", false],
    [16, 18984, 332, 19006, "muted", false],
    [16, 19012, 343, 19034, "muted", false],
    [16, 19040, 114, 19062, "muted", false],
    [296, 19107, 356, 19126, "ink", false],
    [16, 19165, 66, 19184, "ink", false],
    [90, 19165, 144, 19184, "ink", false],
    [16, 19270, 30, 19286, "muted", false],
    [30, 19270, 61, 19286, "muted", false],
    [61, 19270, 156, 19286, "muted", false],
  ],
};

/** Where the mesh steps back in the Burpees set at that moment: the count and its calls ([left, top, right, bottom]). */
export const BURPEES_QUIET: Record<
  "desktop" | "phone",
  readonly (readonly [number, number, number, number])[]
> = {
  desktop: [
    [176, 17430, 811, 17707],
    [883, 17446, 1264, 17707],
    [176, 17768, 811, 17868],
  ],
  phone: [
    [16, 17314, 374, 17476],
    [16, 17536, 374, 17694],
    [16, 17536, 374, 17694],
  ],
};
