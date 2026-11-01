import { useCVRequest } from "./CVRequestContext";
import { CV_DONE_TITLE_ID, CV_TITLE_ID, CVRequestForm } from "./CVRequestForm";
import { DrawerHeader } from "@/ui/molecules/DrawerHeader";
import { Drawer } from "@/ui/organisms/Drawer";

/** The CV request in a drawer (bottom sheet on phones), opened by any CVRequestButton. */
export function CVDrawer() {
  const { drawerOpen, closeDrawer, status } = useCVRequest();

  return (
    <Drawer
      open={drawerOpen}
      onClose={closeDrawer}
      labelledBy={status === "success" ? CV_DONE_TITLE_ID : CV_TITLE_ID}
    >
      <div className="flex min-h-full flex-col gap-[18px] px-[clamp(20px,4vw,40px)] pb-8 pt-7">
        <DrawerHeader eyebrow="CV" onClose={closeDrawer} />
        <CVRequestForm onDone={closeDrawer} />
      </div>
    </Drawer>
  );
}
