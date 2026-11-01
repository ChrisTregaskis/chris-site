import { type ReactNode } from "react";
import { Icon } from "@/ui/atoms/Icon";

interface FormAlertProps {
  title: string;
  children: ReactNode;
}

/** The b3 form failure banner: an alert with a warning mark, a bold title and a line of help. */
export function FormAlert({ title, children }: FormAlertProps) {
  return (
    <div
      role="alert"
      className="col-span-full flex items-start gap-3 rounded-control border-[1.5px] border-danger/50 bg-danger/10 px-4 py-[14px]"
    >
      <span className="mt-px text-danger">
        <Icon size={24}>
          <svg viewBox="0 0 24 24">
            <circle
              cx="12"
              cy="12"
              r="10"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path
              d="M12 7v6M12 16.5v.5"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
          </svg>
        </Icon>
      </span>
      <div>
        <b className="block font-semibold">{title}</b>
        <p className="m-0 mt-[2px] text-[14.5px] text-muted">{children}</p>
      </div>
    </div>
  );
}
