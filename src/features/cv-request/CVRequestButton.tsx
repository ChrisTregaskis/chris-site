import { type ReactNode } from "react";
import { useCVRequest } from "./CVRequestContext";
import { Button } from "@/ui/atoms/Button";
import { type ButtonSize, type ButtonVariant } from "@/ui/atoms/buttonClasses";

interface CVRequestButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children?: ReactNode;
}

/** Opens the CV drawer. */
export function CVRequestButton({
  variant = "primary",
  size = "md",
  children = "Request my CV",
}: CVRequestButtonProps) {
  const { openDrawer } = useCVRequest();
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
