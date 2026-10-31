import { type ReactNode } from "react";
import { cn } from "@/lib/cn";

interface IconProps {
  /** An inline `<svg>`; it is sized to fill the wrapper. */
  children: ReactNode;
  /** Names a meaningful icon; without it the icon is decorative. */
  label?: string;
  size?: 16 | 18 | 20 | 24;
}

const SIZE: Record<NonNullable<IconProps["size"]>, string> = {
  16: "size-4",
  18: "size-[18px]",
  20: "size-5",
  24: "size-6",
};

export function Icon({ children, label, size = 20 }: IconProps) {
  return (
    <span
      {...(label
        ? { role: "img", "aria-label": label }
        : { "aria-hidden": true })}
      className={cn("inline-flex shrink-0 [&>svg]:size-full", SIZE[size])}
    >
      {children}
    </span>
  );
}
