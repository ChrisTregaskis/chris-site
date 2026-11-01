import { useCVRequest } from "./CVRequestContext";
import { CV_TITLE_ID, CVRequestForm } from "./CVRequestForm";
import { Drawer } from "@/ui/organisms/Drawer";

/** The CV request in a drawer (bottom sheet on phones), opened by any CVRequestButton. */
export function CVDrawer() {
  const { drawerOpen, closeDrawer, status } = useCVRequest();

  return (
    <Drawer
      open={drawerOpen}
      onClose={closeDrawer}
      labelledBy={status === "success" ? "cv-done-title" : CV_TITLE_ID}
    >
      <div className="flex min-h-full flex-col gap-[18px] px-[clamp(20px,4vw,40px)] pb-8 pt-7">
        <div className="flex items-center justify-between">
          <span className="text-eyebrow font-semibold uppercase text-accent">
            CV
          </span>
          <button
            type="button"
            aria-label="Close"
            onClick={closeDrawer}
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
        <CVRequestForm onDone={closeDrawer} />
      </div>
    </Drawer>
  );
}
