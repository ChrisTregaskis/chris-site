import { PHOTO } from "../photo";
import hillside from "@/assets/about/chris-and-son-cutout.webp";

/**
 * Take B, the hillside: the photo with its grey sky taken out, so Chris and
 * his son stand on the ridge against the page itself, and the ferns fade
 * into the page below and to the sides. No shape and no frame: the hill is
 * the edge. One still image (a webp with its own transparency, made from the
 * same photo), nothing moves.
 */
export function PortraitHillside() {
  return (
    <figure
      data-portrait="hillside"
      className="mx-auto mb-2 mt-8 w-[min(340px,88vw)] wide:mx-0 wide:-ml-[6%] wide:mb-0 wide:mt-10 wide:w-[min(420px,106%)]"
    >
      <img
        src={hillside}
        alt={PHOTO.alt}
        width={648}
        height={607}
        loading="lazy"
        decoding="async"
        className="block h-auto w-full"
      />
    </figure>
  );
}
