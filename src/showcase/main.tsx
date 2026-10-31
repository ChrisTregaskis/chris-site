import React from "react";
import ReactDOM from "react-dom/client";
import { Showcase } from "./Showcase";

import "@/styles/index.css";
import "@/ui/tokens/fonts";

// Dev-only entry (showcase.html). Never part of `pnpm build`.
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Showcase />
  </React.StrictMode>,
);
