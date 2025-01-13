import type { ToastOptions as ToastifyToastOptions } from "react-toastify";
import { toast } from "react-toastify";

/** Different values for configuring the toast scheme */
type ToastScheme = "SUCCESS" | "WARN" | "ERROR" | "INFO";

interface ToastOptions extends ToastifyToastOptions{
  /** Scheme of the toast. @default "INFO" */
  scheme?: ToastScheme;
}

//#32D583

export const showToast = (message: string, options?: ToastOptions) => {
  const {
    scheme = "INFO",
    position = "top-right" 
  } = options ?? {};

  switch (scheme) {
    case "SUCCESS": {
      toast.success(message, {
        className: "",
        position,
        ...options
      });
      break;
    }
    case "WARN": {
      toast.warn(message, {
        className: "",
        position,
        ...options
      });
      break;
    }
    case "ERROR": {
      toast.error(message, {
        className: "",
        position,
        ...options
      });
      break;
    }
    default:
    case "INFO": {
      toast.info(message, {
        className: "",
        position,
        ...options
      });
      break;
    }
  }
};
