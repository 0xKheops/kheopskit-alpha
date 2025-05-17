import { type AppKit, createAppKit } from "@reown/appkit/core";
import type { KheopskitConfig } from "./types";

const CACHE = new Map<string, AppKit>();

export const getAppKit = (config: KheopskitConfig): AppKit | null => {
  if (!config.walletConnect?.projectId) return null;

  const key = JSON.stringify(config.walletConnect);
  if (!CACHE.has(key)) {
    CACHE.set(
      key,
      createAppKit({
        projectId: config.walletConnect.projectId,
        metadata: config.walletConnect.metadata,
        networks: config.walletConnect.networks,
      }),
    );
  }

  // biome-ignore lint/style/noNonNullAssertion: <explanation>
  return CACHE.get(key)!;
};
