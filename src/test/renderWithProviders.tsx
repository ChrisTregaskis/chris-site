import { type ReactElement } from "react";
import { render, type RenderResult } from "@testing-library/react";
import { ToastContainer } from "react-toastify";
import { AppProvider } from "@/providers/AppProvider";

/** Render `ui` inside the app's providers, with a toast container so toasts are assertable. */
export function renderWithProviders(ui: ReactElement): RenderResult {
  return render(
    <AppProvider>
      {ui}
      <ToastContainer />
    </AppProvider>,
  );
}
