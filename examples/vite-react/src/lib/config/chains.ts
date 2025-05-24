import { defineChain } from "@reown/appkit/networks";

import * as viemChains from "viem/chains";

export const polkadotAssetHub = defineChain({
  id: "polkadotAssetHub",
  // id: "68d56f15f85d3136970ec16946040bc1",
  name: "Polkadot Asset Hub",
  nativeCurrency: { name: "Polkadot", symbol: "DOT", decimals: 10 },
  rpcUrls: {
    default: {
      http: ["https://polkadot-asset-hub-rpc.polkadot.io"],
      webSocket: ["wss://polkadot-asset-hub-rpc.polkadot.io"],
    },
  },
  blockExplorers: {
    default: {
      name: "Polkadot Explorer",
      url: "https://assethub-polkadot.subscan.io/",
    },
  },
  chainNamespace: "polkadot",
  caipNetworkId: "polkadot:68d56f15f85d3136970ec16946040bc1",
});

export const westendAssetHub = defineChain({
  // id: "67f9723393ef76214df0118c34bbbd3d",
  id: "westendAssetHub",
  name: "Westend Asset Hub",
  nativeCurrency: { name: "Westend", symbol: "WND", decimals: 10 },
  rpcUrls: {
    default: {
      http: ["https://westend-asset-hub.polkadot.io"],
      webSocket: ["wss://westend-asset-hub.polkadot.io"],
    },
  },
  blockExplorers: {
    default: {
      name: "Polkadot Explorer",
      url: "https://assethub-westend.subscan.io/",
    },
  },
  chainNamespace: "polkadot",
  caipNetworkId: "polkadot:67f9723393ef76214df0118c34bbbd3d",
});

export const ethMainnet = defineChain({
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
});

export const ethWestendAssetHub = defineChain({
  id: "420420421",
  name: "Westend Asset Hub EVM",
  nativeCurrency: { name: "Westend", symbol: "WND", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://westend-asset-hub-eth-rpc.polkadot.io"],
    },
  },
  blockExplorers: {
    default: {
      name: "Blockscout",
      url: "https://blockscout-asset-hub.parity-chains-scw.parity.io",
    },
  },
  chainNamespace: "eip155",
  caipNetworkId: "eip155:420420421",
});

export const moonbaseAlpha = defineChain({
  ...viemChains.moonbaseAlpha,
  chainNamespace: "eip155",
  caipNetworkId: `eip155:${viemChains.moonbaseAlpha.id}}`,
});

export const sepolia = defineChain({
  ...viemChains.sepolia,
  chainNamespace: "eip155",
  caipNetworkId: `eip155:${viemChains.sepolia.id}}`,
});

export const APPKIT_CHAINS = [
  polkadotAssetHub,
  westendAssetHub,
  ethMainnet,
  sepolia,
  ethWestendAssetHub,
  moonbaseAlpha,
];

export const VIEM_CHAINS_BY_ID: Record<number, viemChains.Chain> =
  Object.fromEntries(Object.values(viemChains).map((c) => [c.id, c]));
