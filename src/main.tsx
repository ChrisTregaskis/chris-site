import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./app/App";
import { AppProviders } from "./app/AppProviders";
import { scrollFeelFrom } from "./features/scroll-feel";

import "./styles/index.css";
import "./ui/tokens/fonts";

// The scroll-feel prototype (explore branch): read once, before the first
// render, and marked on <html> for the CSS that keys off it.
const scrollFeel = scrollFeelFrom(window.location.search);
if (scrollFeel) document.documentElement.dataset.scroll = scrollFeel;

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AppProviders scrollFeel={scrollFeel}>
      <App />
    </AppProviders>
  </React.StrictMode>,
);
