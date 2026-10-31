import { type ReactElement } from "react";
import { render, type RenderResult } from "@testing-library/react";
import { ToastContainer } from "react-toastify";
import { AppProviders } from "@/app/AppProviders";

/** Render `ui` inside the app's providers, plus a ToastContainer so toasts are assertable. */
export function renderWithProviders(ui: ReactElement): RenderResult {
  return render(
    <AppProviders>
      {ui}
      <ToastContainer />
    </AppProviders>,
  );
}
