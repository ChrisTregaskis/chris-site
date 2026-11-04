import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./app/App";
import { AppProviders } from "./app/AppProviders";
import { applyLook } from "./explore/look";

import "./styles/index.css";
import "./ui/tokens/fonts";
import "./explore/looks.css";

applyLook();

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </React.StrictMode>,
);
