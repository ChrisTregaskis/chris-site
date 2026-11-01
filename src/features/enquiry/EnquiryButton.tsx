import { type ReactNode } from "react";
import { useEnquiry } from "./EnquiryContext";
import { Button } from "@/ui/atoms/Button";
import { type ButtonSize, type ButtonVariant } from "@/ui/atoms/buttonClasses";

interface EnquiryButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children?: ReactNode;
}

/** Opens the enquiry drawer. */
export function EnquiryButton({
  variant = "primary",
  size = "md",
  children = "Get in touch",
}: EnquiryButtonProps) {
  const { openDrawer } = useEnquiry();
  return (
    <Button
      variant={variant}
      size={size}
      aria-haspopup="dialog"
      onClick={openDrawer}
    >
      {children}
    </Button>
  );
}
