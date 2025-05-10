import { isWalletPlatform, type WalletPlatform } from "./types";

export type WalletId = string;

export const getWalletId = (
  platform: WalletPlatform,
  name: string
): WalletId => {
  if (!platform) throw new Error("Missing platform");
  if (!name) throw new Error("Invalid name");
  return `${platform}:${name}`;
};

export const parseWalletId = (walletId: string) => {
  if (!walletId) throw new Error("Invalid walletId");
  const [platform, name] = walletId.split("::");
  if (!isWalletPlatform(platform)) throw new Error("Invalid platform");
  if (!name) throw new Error("Invalid address");
  return { platform, name };
};
