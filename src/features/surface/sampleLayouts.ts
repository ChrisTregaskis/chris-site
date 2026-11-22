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

/**
 * Every line of text where the mesh lies (the hero, the top of Wayfinder,
 * About, Contact and the footer) as Chrome lays it out: one box per line
 * of each text node, [left, top, right, bottom] in page px, at 1440×900
 * (desktop) and 390×844 (phone). Buttons' text is left out: it sits on the
 * button, not the paper.
 */
export const TEXT_BOXES: Record<
  "desktop" | "phone",
  readonly (readonly [number, number, number, number])[]
> = {
  desktop: [
    [176, 641, 397, 660],
    [176, 664, 323, 683],
    [176, 188, 1100, 283],
    [176, 284, 1200, 379],
    [176, 379, 996, 474],
    [176, 475, 1143, 570],
    [549, 643, 1132, 668],
    [549, 676, 928, 701],
    [9, 900, 17, 915],
    [17, 900, 24, 915],
    [24, 900, 31, 915],
    [176, 981, 260, 1125],
    [176, 1127, 863, 1189],
    [176, 1190, 859, 1252],
    [176, 18162, 313, 18214],
    [614, 18406, 1203, 18428],
    [614, 18434, 1210, 18456],
    [614, 18463, 1211, 18485],
    [614, 18492, 1088, 18514],
    [614, 18537, 1225, 18559],
    [614, 18566, 1217, 18588],
    [614, 18594, 744, 18616],
    [176, 18829, 596, 18881],
    [176, 18905, 834, 18930],
    [176, 18938, 850, 18963],
    [176, 18970, 867, 18995],
    [176, 19003, 528, 19028],
    [456, 19073, 516, 19092],
    [485, 19084, 623, 19103],
    [540, 19073, 590, 19092],
    [564, 19084, 702, 19103],
    [614, 19073, 668, 19092],
    [640, 19084, 778, 19103],
    [176, 19178, 190, 19194],
    [190, 19178, 221, 19194],
    [221, 19178, 316, 19194],
  ],
  phone: [
    [16, 513, 314, 532],
    [16, 536, 85, 555],
    [16, 181, 246, 225],
    [16, 225, 303, 269],
    [16, 269, 344, 313],
    [16, 313, 234, 357],
    [16, 357, 286, 401],
    [16, 401, 302, 445],
    [16, 575, 361, 597],
    [16, 603, 360, 625],
    [16, 631, 147, 653],
    [16, 876, 62, 956],
    [16, 964, 247, 998],
    [16, 999, 248, 1033],
    [16, 1033, 259, 1067],
    [16, 1095, 342, 1115],
    [16, 1122, 356, 1142],
    [16, 17940, 103, 17974],
    [16, 18345, 354, 18367],
    [16, 18373, 356, 18395],
    [16, 18402, 341, 18424],
    [16, 18431, 341, 18453],
    [16, 18460, 340, 18482],
    [16, 18489, 338, 18511],
    [16, 18517, 287, 18539],
    [16, 18562, 338, 18584],
    [16, 18591, 360, 18613],
    [16, 18620, 312, 18642],
    [16, 18649, 353, 18671],
    [16, 18677, 53, 18699],
    [16, 18815, 282, 18849],
    [16, 18873, 341, 18895],
    [16, 18900, 362, 18922],
    [16, 18928, 289, 18950],
    [16, 18956, 357, 18978],
    [16, 18984, 332, 19006],
    [16, 19012, 343, 19034],
    [16, 19040, 114, 19062],
    [296, 19107, 356, 19126],
    [325, 19118, 463, 19137],
    [16, 19165, 66, 19184],
    [41, 19176, 179, 19195],
    [90, 19165, 144, 19184],
    [117, 19176, 255, 19195],
    [16, 19270, 30, 19286],
    [30, 19270, 61, 19286],
    [61, 19270, 156, 19286],
  ],
};
