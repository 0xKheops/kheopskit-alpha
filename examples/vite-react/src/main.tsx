import { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { Subscribe } from "@react-rxjs/core";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Suspense fallback="LOADING">
      <Subscribe>
        <App />
      </Subscribe>
    </Suspense>
  </StrictMode>
);
