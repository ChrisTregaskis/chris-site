import React from "react";
import ReactDOM from "react-dom/client";
import { Showcase } from "./Showcase";

import "./showcase.css";
import "@/ui/tokens/fonts";

// The design system showcase (showcase.html): `pnpm dev` serves it, and
// `pnpm build` builds it in its own pass (see vite.config.ts) for /showcase.
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Showcase />
  </React.StrictMode>,
);
