import type { WalletPlatform } from "@/api/types";
import { isWalletPlatform } from "./isWalletPlatform";

export type WalletId = string;

export const getWalletId = (
  platform: WalletPlatform,
  name: string
): WalletId => {
  if (!isWalletPlatform(platform)) throw new Error("Invalid platform");
  if (!name) throw new Error("Invalid name");
  return `${platform}:${name}`;
};

export const parseWalletId = (walletId: string) => {
  if (!walletId) throw new Error("Invalid walletId");
  const [platform, name] = walletId.split(":");
  if (!isWalletPlatform(platform)) throw new Error("Invalid platform");
  if (!name) throw new Error("Invalid address");
  return { platform, name };
};
