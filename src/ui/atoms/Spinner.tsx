import { VisuallyHidden } from "./VisuallyHidden";

interface SpinnerProps {
  /** Announced as a status when given; otherwise the spinner is decorative. */
  label?: string;
}

/** The b3 `.spin`: stops turning under reduced motion. */
export function Spinner({ label }: SpinnerProps) {
  const ring = (
    <span
      aria-hidden="true"
      className="inline-block size-4 shrink-0 animate-[spin_0.8s_linear_infinite] rounded-pill border-[2.5px] border-on-accent/30 border-t-on-accent motion-reduce:animate-none"
    />
  );
  if (!label) return ring;
  return (
    <span role="status" className="inline-flex">
      {ring}
      <VisuallyHidden>{label}</VisuallyHidden>
    </span>
  );
}
