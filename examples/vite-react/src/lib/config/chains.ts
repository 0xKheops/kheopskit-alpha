import { defineChain } from "@reown/appkit/networks";

import * as viemChains from "viem/chains";

export const polkadot = defineChain({
  id: "91b171bb158e2d3848fa23a9f1c25182",
  name: "Polkadot",
  nativeCurrency: { name: "Polkadot", symbol: "DOT", decimals: 10 },
  rpcUrls: {
    default: {
      http: ["https://rpc.polkadot.io"],
      webSocket: ["wss://rpc.polkadot.io"],
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
});

export const westendAssetHub = defineChain({
  id: "67f9723393ef76214df0118c34bbbd3d",
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
      url: "https://polkadot.js.org/apps/",
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

export const SUPPORTED_CHAINS = [
  polkadot,
  westendAssetHub,
  ethMainnet,
  ethWestendAssetHub,
];

export const VIEM_CHAINS_BY_ID = Object.fromEntries(
  Object.values(viemChains).map((c) => [c.id, c]),
);
