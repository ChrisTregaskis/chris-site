import { VisuallyHidden } from "./VisuallyHidden";

interface SpinnerProps {
  /** Announced as a status when given; otherwise the spinner is decorative. */
  label?: string;
}

/**
 * The b3 `.spin`, drawn in the current text colour so it shows on any button
 * variant: a faint full ring with a turning arc. Stops turning under reduced
 * motion.
 */
export function Spinner({ label }: SpinnerProps) {
  const ring = (
    <span aria-hidden="true" className="relative inline-block size-4 shrink-0">
      <span className="absolute inset-0 rounded-pill border-[2.5px] border-current opacity-30" />
      <span className="absolute inset-0 animate-[spin_0.8s_linear_infinite] rounded-pill border-[2.5px] border-transparent border-t-current motion-reduce:animate-none" />
    </span>
  );
  if (!label) return ring;
  return (
    <span role="status" className="inline-flex">
      {ring}
      <VisuallyHidden>{label}</VisuallyHidden>
    </span>
  );
}
