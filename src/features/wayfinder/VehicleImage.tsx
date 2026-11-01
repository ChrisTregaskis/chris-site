import sketch2x from "@/assets/wayfinder/vehicle-sketch-800.webp";
import sketch from "@/assets/wayfinder/vehicle-sketch-400.webp";

/**
 * The picture on the chat's vehicle card: a hand-drawn sketch, cropped to
 * 2:1 with the whole car in frame, drawn across the card's full width like
 * a car maker's listing image. The card is at most 384px wide (it is
 * narrower on phones and in the two-column layout), so the 1x file is 400px
 * and the 2x 800px; `width`/`height` give the browser the ratio up front.
 */
export const VEHICLE = {
  src: sketch,
  srcSet: `${sketch} 400w, ${sketch2x} 800w`,
  sizes: "min(384px, calc(100vw - 106px))",
  width: 400,
  height: 200,
  alt: "Sketch of a lilac family SUV on a city street",
} as const;

export function VehicleImage() {
  return (
    <img
      src={VEHICLE.src}
      srcSet={VEHICLE.srcSet}
      sizes={VEHICLE.sizes}
      alt={VEHICLE.alt}
      width={VEHICLE.width}
      height={VEHICLE.height}
      loading="lazy"
      decoding="async"
      className="block aspect-[2/1] h-auto w-full bg-gradient-to-br from-chat-media-from to-chat-media-to object-cover"
    />
  );
}
