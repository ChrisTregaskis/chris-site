import { type ToastOptions as ToastifyToastOptions } from "react-toastify";
import { toast } from "react-toastify";
import { useCallback } from "react";
import { ThemeMode } from "@/context/ThemeContext";
import { useTheme } from "@/hooks/useTheme";

/** Different values for configuring the toast scheme */
type ToastScheme = "SUCCESS" | "WARN" | "ERROR" | "INFO";

interface ToastOptions extends ToastifyToastOptions {
  /** Scheme of the toast. @default "INFO" */
  scheme?: ToastScheme;
}

const useToast = () => {
  const { themeMode } = useTheme();

  const showToast = useCallback(
    (message: string, options?: ToastOptions) => {
      const toastClassName =
        themeMode === ThemeMode.DARK
          ? "bg-gray-800 text-white"
          : "bg-white text-black";

      const { scheme = "INFO", position = "top-right" } = options ?? {};

      switch (scheme) {
        case "SUCCESS": {
          toast.success(message, {
            className: toastClassName,
            position,
            ...options,
          });
          break;
        }
        case "WARN": {
          toast.warn(message, {
            className: toastClassName,
            position,
            ...options,
          });
          break;
        }
        case "ERROR": {
          toast.error(message, {
            className: toastClassName,
            position,
            ...options,
          });
          break;
        }

        case "INFO": {
          toast.info(message, {
            className: toastClassName,
            position,
            ...options,
          });
          break;
        }

        default: {
          toast.error("Unhandled toast type");
        }
      }
    },
    [themeMode],
  );

  return { showToast };
};

export default useToast;
