import type { KheopskitConfig } from "@kheopskit/core";

import { type AppKitNetwork, defineChain } from "@reown/appkit/networks";

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
  const networks: AppKitNetwork[] = [];

  if (platforms.includes("polkadot")) {
    networks.push(
      defineChain({
        id: "91b171bb158e2d3848fa23a9f1c25182",
        name: "Polkadot",
        nativeCurrency: { name: "Polkadot", symbol: "DOT", decimals: 10 },
        rpcUrls: {
          default: {
            http: ["https://rpc.polkadot.io"],
            wss: "wss://rpc.polkadot.io",
          },
        },
        blockExplorers: {
          default: {
            name: "Polkadot Explorer",
            url: "https://polkadot.js.org/apps/",
          },
        },
        chainNamespace: "polkadot",
        caipNetworkId: "polkadot:91b171bb158e2d3848fa23a9f1c25182",
      }),
    );
  }

  if (platforms.includes("ethereum")) {
    networks.push(
      defineChain({
        id: "1",
        name: "Ethereum",
        nativeCurrency: { name: "Ethereum", symbol: "ETH", decimals: 18 },
        rpcUrls: {
          default: {
            http: ["https://rpc.ankr.com/eth"],
            wss: "wss://rpc.ankr.com/eth",
          },
        },
        blockExplorers: {
          default: { name: "Etherscan", url: "https://etherscan.io/" },
        },
        chainNamespace: "eip155",
        caipNetworkId: "eip155:1",
      }),
    );
  }

  return networks ? (networks as [AppKitNetwork, ...AppKitNetwork[]]) : null;
};
