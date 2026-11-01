import vehicle from "@/assets/wayfinder/vehicle.svg";

/**
 * The picture on the chat's vehicle card. One swap point: to replace the
 * placeholder outline with a raster sketch, drop the file into
 * `assets/wayfinder/` and change the import and `VEHICLE` below. The slot
 * draws it at 118×42 CSS px (about 2.8:1, a side-on car) inside a 62px
 * media strip; supply 2x or 3x that (236×84 or 354×126) as webp with a
 * transparent or strip-coloured background.
 */
export const VEHICLE = {
  src: vehicle,
  width: 118,
  height: 42,
  alt: "Sketch of a seven-seat family SUV, side on",
} as const;

export function VehicleImage() {
  return (
    <img
      src={VEHICLE.src}
      alt={VEHICLE.alt}
      width={VEHICLE.width}
      height={VEHICLE.height}
      loading="lazy"
      decoding="async"
      className="block aspect-[118/42] h-[42px] w-[118px] object-contain"
    />
  );
}
