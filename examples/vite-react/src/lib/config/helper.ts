import type { KheopskitConfig } from "@kheopskit/core";

import type { AppKitNetwork } from "@reown/appkit/networks";
import {
  ethMainnet,
  ethWestendAssetHub,
  polkadotAssetHub,
  westendAssetHub,
} from "./chains";

export const ensureConfig = (
  config: Partial<KheopskitConfig>,
): Partial<KheopskitConfig> => {
  const platforms = config.platforms ?? [];
  const networks = getNetworks(platforms);

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
      ? [polkadotAssetHub, westendAssetHub]
      : []),
    ...(platforms.includes("ethereum") ? [ethMainnet, ethWestendAssetHub] : []),
  ];

  return networks.length
    ? (networks as [AppKitNetwork, ...AppKitNetwork[]])
    : null;
};
