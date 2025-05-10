import type { KheopskitConfig } from "@kheopskit/core";
import { createContext } from "react";

export const KheopskitContext = createContext<{
  config: KheopskitConfig;
} | null>(null);
