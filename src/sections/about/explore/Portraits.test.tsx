import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PHOTO } from "../photo";
import { PortraitArch } from "./PortraitArch";
import { PortraitHillside } from "./PortraitHillside";
import { PortraitLifted } from "./PortraitLifted";
import { PortraitNight } from "./PortraitNight";

const TAKES = [
  ["a, the arch", PortraitArch],
  ["b, the hillside", PortraitHillside],
  ["c, night into day", PortraitNight],
  ["d, lifted", PortraitLifted],
] as const;

describe("the About portrait takes", () => {
  it.each(TAKES)(
    "take %s shows the photo once, by its description",
    (_, Take) => {
      render(<Take />);
      expect(screen.getAllByRole("img", { name: PHOTO.alt })).toHaveLength(1);
    },
  );
});
