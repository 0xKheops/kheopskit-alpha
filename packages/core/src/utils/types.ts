// TODO: mnve file to its own @kheopswap/types package ?

const WALLET_PLATFORMS = ["polkadot", "ethereum"] as const;

export type WalletPlatform = (typeof WALLET_PLATFORMS)[number];

export const isWalletPlatform = (
  platform: unknown
): platform is WalletPlatform =>
  typeof platform === "string" &&
  WALLET_PLATFORMS.includes(platform as WalletPlatform);

export type AccountAddressType = "ss58" | "ethereum";

export type UnsubscribeFn = () => void;
