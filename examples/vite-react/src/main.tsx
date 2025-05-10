import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { Subscribe } from "@react-rxjs/core";

const rootElement = document.getElementById("root");

if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <Subscribe>
        <App />
      </Subscribe>
    </StrictMode>
  );
} else {
  console.error("Root element not found");
}
