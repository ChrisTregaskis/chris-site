import { useEnquiry } from "./EnquiryContext";
import {
  ENQUIRY_DONE_TITLE_ID,
  ENQUIRY_TITLE_ID,
  EnquiryForm,
} from "./EnquiryForm";
import { DrawerHeader } from "@/ui/molecules/DrawerHeader";
import { Drawer } from "@/ui/organisms/Drawer";

/** The enquiry in a drawer (bottom sheet on phones), opened by any EnquiryButton. */
export function EnquiryDrawer() {
  const { drawerOpen, closeDrawer, status } = useEnquiry();

  return (
    <Drawer
      open={drawerOpen}
      onClose={closeDrawer}
      labelledBy={
        status === "success" ? ENQUIRY_DONE_TITLE_ID : ENQUIRY_TITLE_ID
      }
    >
      <div className="flex min-h-full flex-col gap-[18px] px-[clamp(20px,4vw,40px)] pb-8 pt-7">
        <DrawerHeader eyebrow="Contact" onClose={closeDrawer} />
        <EnquiryForm onDone={closeDrawer} />
      </div>
    </Drawer>
  );
}
