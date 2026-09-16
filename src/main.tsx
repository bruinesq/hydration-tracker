import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

// HashRouter (not BrowserRouter): GitHub Pages serves this as a static
// project site with no server-side rewrites, so a path like
// /hydration-tracker/u/3/history would 404 on a hard refresh under a
// path-based router. Hash routes (/#/u/3/history) always resolve to the
// same index.html regardless of how the page was reached.
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>
);
