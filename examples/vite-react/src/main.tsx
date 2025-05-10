import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { KheopskitProvider } from "@kheopskit/react";
import type { KheopskitConfig } from "@kheopskit/core";

const rootElement = document.getElementById("root");

const config: KheopskitConfig = {
  autoReconnect: true,
};

if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <KheopskitProvider config={config}>
        <App />
      </KheopskitProvider>
    </StrictMode>
  );
} else {
  console.error("Root element not found");
}
