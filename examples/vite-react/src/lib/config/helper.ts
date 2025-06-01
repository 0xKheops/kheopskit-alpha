import type { KheopskitConfig } from "@kheopskit/core";

import type { CaipNetwork } from "@reown/appkit/core";
import type { AppKitNetwork } from "@reown/appkit/networks";
import { APPKIT_CHAINS } from "./chains";

export const ensureConfig = (
  config: Partial<KheopskitConfig>,
): Partial<KheopskitConfig> => {
  const platforms = config.platforms ?? [];
  const networks = getNetworks(platforms);

  console.log("[appkit] networks", networks);

  return {
    ...config,
    walletConnect: networks
      ? {
          projectId: import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID,
          metadata: {
            name: "Kheopskit Demo",
            description: "Kheopskit Demo",
            url: window.location.origin,
            icons: [],
          },
          networks,
        }
      : undefined,
  };
};

const getNetworks = (platforms: KheopskitConfig["platforms"]) => {
  const networks: AppKitNetwork[] = [
    ...(platforms.includes("polkadot")
      ? APPKIT_CHAINS.filter(isPolkadotNetwork)
      : []),
    ...(platforms.includes("ethereum")
      ? APPKIT_CHAINS.filter(isEthereumNetwork)
      : []),
  ];

  return networks.length
    ? (networks as [AppKitNetwork, ...AppKitNetwork[]])
    : null;
};

export const isPolkadotNetwork = (network: AppKitNetwork): boolean => {
  const n = network as CaipNetwork;
  return n.chainNamespace === "polkadot";
};

export const isEthereumNetwork = (network: AppKitNetwork): boolean => {
  const n = network as CaipNetwork;
  return n.chainNamespace === "eip155";
};
