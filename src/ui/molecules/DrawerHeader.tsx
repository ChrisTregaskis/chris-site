interface DrawerHeaderProps {
  /** The small accent label above the content, e.g. "CV". */
  eyebrow: string;
  onClose: () => void;
}

/** The top row of a drawer form: its eyebrow and a round Close button. */
export function DrawerHeader({ eyebrow, onClose }: DrawerHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-eyebrow font-semibold uppercase text-accent">
        {eyebrow}
      </span>
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="grid size-10 place-items-center rounded-pill border-[1.5px] border-line bg-transparent text-ink transition-colors duration-base hover:border-accent motion-reduce:transition-none"
      >
        <svg viewBox="0 0 20 20" className="size-4" aria-hidden="true">
          <path
            d="M5 5l10 10M15 5L5 15"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </div>
  );
}
